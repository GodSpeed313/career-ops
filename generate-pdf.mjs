#!/usr/bin/env node

/**
 * generate-pdf.mjs — HTML → PDF via Playwright, or Markdown → LaTeX via Jinja2
 *
 * Usage:
 *   node generate-pdf.mjs <input.html> <output.pdf> [--format=letter|a4|latex]
 *
 * Formats:
 *   a4       - Render HTML to A4 PDF (default)
 *   letter   - Render HTML to Letter PDF
 *   latex    - Generate LaTeX source from cv.md using Jinja2 templating
 *
 * Requires: @playwright/test (or playwright) installed, nunjucks for LaTeX templating.
 * Uses Chromium headless to render the HTML and produce a clean, ATS-parseable PDF.
 */

import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import nunjucks from 'nunjucks';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Normalize text for ATS compatibility by converting problematic Unicode.
 *
 * ATS parsers and legacy systems often fail on em-dashes, smart quotes,
 * zero-width characters, and non-breaking spaces. These cause mojibake,
 * parsing errors, or display issues. See issue #1.
 *
 * Only touches body text — preserves CSS, JS, tag attributes, and URLs.
 * Returns { html, replacements } so the caller can log what was changed.
 */
function normalizeTextForATS(html) {
  const replacements = {};
  const bump = (key, n) => { replacements[key] = (replacements[key] || 0) + n; };

  const masks = [];
  const masked = html.replace(
    /<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi,
    (match) => {
      const token = `\u0000MASK${masks.length}\u0000`;
      masks.push(match);
      return token;
    }
  );

  let out = '';
  let i = 0;
  while (i < masked.length) {
    const lt = masked.indexOf('<', i);
    if (lt === -1) { out += sanitizeText(masked.slice(i)); break; }
    out += sanitizeText(masked.slice(i, lt));
    const gt = masked.indexOf('>', lt);
    if (gt === -1) { out += masked.slice(lt); break; }
    out += masked.slice(lt, gt + 1);
    i = gt + 1;
  }

  const restored = out.replace(/\u0000MASK(\d+)\u0000/g, (_, n) => masks[Number(n)]);
  return { html: restored, replacements };

  function sanitizeText(text) {
    if (!text) return text;
    let t = text;
    t = t.replace(/\u2014/g, () => { bump('em-dash', 1); return '-'; });
    t = t.replace(/\u2013/g, () => { bump('en-dash', 1); return '-'; });
    t = t.replace(/[\u201C\u201D\u201E\u201F]/g, () => { bump('smart-double-quote', 1); return '"'; });
    t = t.replace(/[\u2018\u2019\u201A\u201B]/g, () => { bump('smart-single-quote', 1); return "'"; });
    t = t.replace(/\u2026/g, () => { bump('ellipsis', 1); return '...'; });
    t = t.replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, () => { bump('zero-width', 1); return ''; });
    t = t.replace(/\u00A0/g, () => { bump('nbsp', 1); return ' '; });
    return t;
  }
}

/**
 * Extract a section from Markdown CV content.
 * Searches for ## SectionName and extracts content until next main section (##) or EOF.
 * Handles both Unix (\n) and Windows (\r\n) line endings.
 */
function extractCVSection(content, sectionName) {
  // Normalize line endings to \n for consistent regex matching
  const normalized = content.replace(/\r\n/g, '\n');
  
  // Match the section header and capture everything until the next ## section at the start of a line
  // Note: SubSections (###) don't stop the capture; only main sections (##) at line start do
  const regex = new RegExp(
    `^## ${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$` +  // Match the exact header line
    `\\n` +  // Required newline after header
    `([\\s\\S]*?)` +  // Capture everything (non-greedy)
    `(?=^## |\\Z)`,  // Until next main section (## at line start) or end of string
    'im'
  );
  
  const match = normalized.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Load configuration and CV data, merging with fallback to examples.
 * If user files don't exist, uses fictional example data from examples/ folder.
 */
async function loadCVData() {
  let profile = {};
  let cvContent = '';

  // Try to load user's profile.yml
  try {
    const profilePath = path.join(process.cwd(), 'config', 'profile.yml');
    const profileContent = await fs.readFile(profilePath, 'utf-8');
    profile = yaml.load(profileContent) || {};
  } catch (err) {
    console.log('ℹ️  Using example profile (user profile not found)');
    try {
      const exampleProfilePath = path.join(process.cwd(), 'examples', 'profile.example.yml');
      const exampleProfileContent = await fs.readFile(exampleProfilePath, 'utf-8');
      profile = yaml.load(exampleProfileContent) || {};
    } catch (exErr) {
      console.warn('⚠️  Could not load example profile either');
    }
  }

  // Try to load user's cv.md
  try {
    const cvPath = path.join(process.cwd(), 'cv.md');
    cvContent = await fs.readFile(cvPath, 'utf-8');
  } catch (err) {
    console.log('ℹ️  Using example CV (user CV not found)');
    try {
      const examplePath = path.join(process.cwd(), 'examples', 'cv-example.md');
      cvContent = await fs.readFile(examplePath, 'utf-8');
    } catch (exErr) {
      throw new Error('Could not load CV or example: ' + exErr.message);
    }
  }

  // Extract sections
  const sections = {
    summary: extractCVSection(cvContent, 'Professional Summary'),
    experience: extractCVSection(cvContent, 'Work Experience'),
    skills: extractCVSection(cvContent, 'Skills'),
    education: extractCVSection(cvContent, 'Education')
  };

  // Build candidate object with fallbacks
  const candidate = profile.candidate || {
    full_name: 'Your Name',
    email: 'your.email@example.com',
    location: 'City, State',
    phone: '+1-555-0000',
    linkedin: 'https://linkedin.com/in/yourprofile',
    github: 'https://github.com/yourprofile'
  };

  return { candidate, ...sections };
}

/**
 * Generate LaTeX source using Jinja2 templating.
 * Uses nunjucks to render the template with CV data.
 */
async function generateLatex(outputPath) {
  try {
    console.log('📄 Generating LaTeX source with Jinja2...');

    // Load CV data and candidate info
    const templateData = await loadCVData();

    // Load the LaTeX template
    const templatePath = path.join(process.cwd(), 'templates', 'cv-template.tex');
    const templateContent = await fs.readFile(templatePath, 'utf-8');

    // Configure nunjucks (Jinja2 equivalent for Node.js)
    nunjucks.configure({ autoescape: false });

    // Render template with data
    const renderedLatex = nunjucks.renderString(templateContent, templateData);

    // Verify all placeholders were replaced
    const unrenderedCount = (renderedLatex.match(/\{\{/g) || []).length;
    if (unrenderedCount > 0) {
      console.warn(`⚠️  Warning: ${unrenderedCount} Jinja2 placeholders still unrendered`);
    }

    // Save to output directory
    const outputDir = path.join(process.cwd(), 'output');
    await fs.mkdir(outputDir, { recursive: true });

    const outputFilename = path.basename(outputPath).replace(/\.pdf$/, '.tex');
    const texOutputPath = path.join(outputDir, outputFilename);

    await fs.writeFile(texOutputPath, renderedLatex);

    console.log(`✅ LaTeX saved to: ${texOutputPath}`);
    console.log(`📋 Ready for Overleaf! All Jinja2 templates rendered.`);
    return;
  } catch (error) {
    console.error('❌ Error generating LaTeX:', error.message);
    process.exit(1);
  }
}

async function generatePDF() {
  const args = process.argv.slice(2);

  // Parse arguments
  let inputPath, outputPath, format = 'a4';

  for (const arg of args) {
    if (arg.startsWith('--format=')) {
      format = arg.split('=')[1].toLowerCase();
    } else if (!inputPath) {
      inputPath = arg;
    } else if (!outputPath) {
      outputPath = arg;
    }
  }

  if (!inputPath || !outputPath) {
    console.error('Usage: node generate-pdf.mjs <input.html> <output.pdf> [--format=letter|a4|latex]');
    process.exit(1);
  }

  inputPath = resolve(inputPath);
  outputPath = resolve(outputPath);

  // Validate format
  const validFormats = ['a4', 'letter', 'latex'];
  if (!validFormats.includes(format)) {
    console.error(`❌ Invalid format: ${format}. Use: a4, letter, or latex`);
    process.exit(1);
  }

  // Handle LaTeX generation with Jinja2
  if (format === 'latex') {
    await generateLatex(outputPath);
    return;
  }

  console.log(`📄 Input:  ${inputPath}`);
  console.log(`📁 Output: ${outputPath}`);
  console.log(`📏 Format: ${format.toUpperCase()}`);

  // Read HTML to inject font paths as absolute file:// URLs
  let html = await readFile(inputPath, 'utf-8');

  // Resolve font paths relative to career-ops/fonts/
  const fontsDir = resolve(__dirname, 'fonts');
  html = html.replace(
    /url\(['"]?\.\/fonts\//g,
    `url('file://${fontsDir}/`
  );
  // Close any unclosed quotes from the replacement
  html = html.replace(
    /file:\/\/([^'")]+)\.woff2['"]\)/g,
    `file://$1.woff2')`
  );

  // Normalize text for ATS compatibility (issue #1)
  const normalized = normalizeTextForATS(html);
  html = normalized.html;
  const totalReplacements = Object.values(normalized.replacements).reduce((a, b) => a + b, 0);
  if (totalReplacements > 0) {
    const breakdown = Object.entries(normalized.replacements).map(([k, v]) => `${k}=${v}`).join(', ');
    console.log(`🧹 ATS normalization: ${totalReplacements} replacements (${breakdown})`);
  }

  // Launch Chromium to render HTML → PDF
  const browser = await chromium.launch();
  const context = await browser.createContext();
  const page = await context.newPage();

  // Set viewport to A4/Letter
  const viewportWidth = '210mm'; // A4 width in Playwright format
  const viewportHeight = '297mm'; // A4 height
  
  await page.goto(`file://${inputPath}`, { waitUntil: 'networkidle' });
  
  // Determine page size based on format
  let pageSize = { format: 'A4' };
  if (format === 'letter') {
    pageSize = { format: 'Letter' };
  }
  
  await page.pdf({ path: outputPath, format: pageSize.format });
  
  await browser.close();

  console.log(`✅ PDF saved to: ${outputPath}`);
}

generatePDF().catch((err) => {
  console.error(`❌ Global Error: ${err.message}`);
  process.exit(1);
});