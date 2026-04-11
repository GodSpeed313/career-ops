# Technical Ecosystem Integration - Setup Guide

## Overview

Your technical ecosystem (Teplit, WorldCraft-Visuals, Melody Maestro, and Open Source contributions) is now fully integrated into the career-ops LaTeX pipeline. This allows you to generate professional CVs with comprehensive project portfolios and technical toolbox documentation.

## Security & Privacy

### ⚠️ CRITICAL: Private Repository Protection

**Teplit (your personal Replit clone) is PRIVATE and must never be committed to the public career-ops repository.**

The `.gitignore` file has been updated with security guidance:

```
# SECURITY: Private projects should NOT be committed to public repo
# These should be symlinked or referenced externally only
# DO NOT UNCOMMENT UNLESS MOVING THESE INTO THIS REPO:
# /Teplit/
# /WorldCraft-Visuals/
# /Melody-Maestro/
```

**How it works:**
- Private projects (Teplit) are referenced in `projects.yml` with `status: "private"`
- They are stored separately in `c:\Users\Owner\Teplit\` (outside career-ops repo)
- Only PUBLIC projects appear on generated CVs by default
- Teplit can be shown in PRIVATE portfolio mode only

### Best Practices

1. **Never clone Teplit into career-ops/** - Keep it separate
2. **Use symlinks** if you want local reference (optional)
3. **Double-check git status** before committing:
   ```bash
   cd career-ops
   git status  # Should NOT show Teplit directory
   ```

## Configuration Files

### 1. `config/projects.yml` (User Customization)

Copy the example and customize with your actual data:

```bash
cp examples/projects.example.yml config/projects.yml
```

**Structure:**
- `projects[]` - Array of all your projects (Teplit, WorldCraft, Melody, Career-Ops, etc.)
- `toolbox` - Global tech stack across all projects
- `display_settings` - Controls which projects appear on public vs. private CVs

**Project Statuses:**
- `"public"` - Visible on CVs by default
- `"private"` - Hidden unless explicitly included
- `"portfolio"` - Portfolio case study (Melody Maestro)

### 2. `config/profile.yml` (Existing)

Your personal data: name, email, location, LinkedIn, GitHub.

### 3. `examples/projects.example.yml` (Reference)

Pre-filled template with all four projects. Read-only reference for structure.

## LaTeX Generation

### Basic Command

```bash
node generate-pdf.mjs dummy.html my-cv.pdf --format=latex
```

**Output:** `output/my-cv.tex` - Ready for Overleaf or pdflatex

### What Gets Included

1. **Header** - Candidate name, contact info, LinkedIn, GitHub
2. **Professional Summary** - From cv.md
3. **Work Experience** - From cv.md
4. **Technical Ecosystem** (NEW) - From projects.yml:
   - Project Gallery (auto-filtered by `display_settings.public_projects`)
   - Toolbox (Languages, Frameworks, Databases, Music Production, Data Science)
5. **Skills** - From cv.md
6. **Education** - From cv.md

### Customization Examples

#### To show Teplit on a private CV:

Edit `config/projects.yml`:
```yaml
display_settings:
  public_projects:
    - worldcraft
    - career-ops
  
  private_projects:  # New section for internal use
    - teplit
    - worldcraft
    - melody
    - career-ops
```

Then in your script, create a private rendering:
```javascript
// Filter for private instead of public
displayProjects = projectsData.projects.filter(p => 
  privateIds.includes(p.id)
);
```

#### To customize Melody Maestro section:

Edit `config/projects.yml` under `melody`:
```yaml
- id: melody
  tools:
    daw: "FL Studio 21"  # Update version
    synths:
      - name: "Serum"  # Add new tools
      - name: "Wavetable"
    effects: ["Custom VST"]
```

## Project Data Structure

### Example: WorldCraft-Visuals

```yaml
projects:
  - id: worldcraft
    name: "WorldCraft-Visuals"
    tagline: "Procedural Fantasy Kingdom Generator"
    role: "Author"
    status: "public"
    description: |
      Multi-line description...
    hero_metric: "10M+ unique kingdom combinations"
    
    stack:
      languages: ["Python"]
      core_libraries: ["NumPy", "procedural-generation", "Qiskit"]
      paradigm: ["Procedural Generation"]
    
    github_url: "https://github.com/..."
    
    key_achievements:
      - "V2 release..."
      - "Dynamic architectural..."
    
    proof_points:
      - type: "github"
        text: "500+ stars"
```

### Project Fields Reference

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | Yes | Unique identifier (use in display_settings) |
| name | string | Yes | Full project name |
| tagline | string | Yes | One-line summary |
| role | string | Yes | Your role (Author, Creator, Contributor, etc.) |
| status | string | Yes | "public", "private", "portfolio" |
| description | string | Yes | 2-3 sentence description |
| hero_metric | string | No | Key quantifiable achievement |
| stack | object | No | Languages, libraries, tools used |
| github_url | string | No | Link to repository |
| key_achievements | array | No | Bulleted wins |
| proof_points | array | No | Portfolio links, metrics, etc. |

## Toolbox Structure

```yaml
toolbox:
  languages:
    - name: "Python"
      level: "Expert"  # Expert, Advanced, Proficient
      use_cases: ["Data science", "Procedural generation"]
  
  frameworks: ["React + Vite", "Express.js", "Node.js"]
  
  databases: ["PostgreSQL"]
  
  devops: ["Docker", "Docker Compose", "GitHub Actions"]
  
  quantum: ["Qiskit", "Quantum-native orchestration"]
  
  music_tech: ["FL Studio 21", "Surge XT", "Odin 2"]
  
  data_tools: ["NumPy", "Pandas", "Matplotlib"]
```

## File Organization

```
career-ops/
├── config/
│   ├── profile.yml           # Your personal data (gitignored)
│   └── projects.yml          # Your projects (gitignored)
│
├── examples/
│   ├── profile.example.yml   # Template (source control)
│   ├── projects.example.yml  # Template (source control)
│   └── cv-example.md         # Sample CV
│
├── templates/
│   ├── cv-template.tex       # LaTeX template (with {{ ecosystem_section }})
│   ├── cv-template.html      # HTML template
│   └── ...
│
├── generate-pdf.mjs          # Main script (reads config, generates LaTeX)
│
└── output/
    └── *.tex                 # Generated LaTeX files
```

## Security Checklist

Before pushing to a public repository:

- [ ] `git status` shows NO Teplit directory
- [ ] `.gitignore` includes `config/projects.yml` (user data)
- [ ] `config/projects.yml` is NOT committed (only examples/)
- [ ] Teplit is stored separately outside career-ops
- [ ] Generated `.tex` files in output/ have no sensitive data
- [ ] Private projects have `status: "private"` in projects.yml

## Troubleshooting

### Q: "Projects configuration not found (optional)" message

**A:** Expected behavior. Create `config/projects.yml` if you want custom projects:
```bash
cp examples/projects.example.yml config/projects.yml
```

Then edit it with your data.

### Q: Teplit section missing from CV?

**A:** Check `display_settings.public_projects` in projects.yml. Teplit has `status: "private"` so it's filtered out by default. Use a private rendering mode to show it.

### Q: LaTeX generation hangs?

**A:** If rendering takes >5 seconds, check for:
- Circular references in projects.yml
- Unicode characters in descriptions (may need escaping)
- Very large toolbox sections

### Q: How do I generate different CVs for different purposes?

**A:** Create multiple projects.yml files with different display_settings:
- `config/projects.yml` - public CV (WorldCraft, Career-Ops)
- `config/projects-private.yml` - internal portfolio (all projects)
- `config/projects-music.yml` - music producer portfolio (Melody + WorldCraft)

Then load the appropriate one:
```javascript
const projectsPath = process.argv[3] === '--private' 
  ? 'config/projects-private.yml'
  : 'config/projects.yml';
```

## Example: Running the Full Pipeline

```bash
# 1. Customize your data
cp examples/projects.example.yml config/projects.yml
# Edit config/projects.yml...

# 2. Generate LaTeX
node generate-pdf.mjs dummy.html portfolio.pdf --format=latex

# 3. View output
cat output/portfolio.tex

# 4. Compile to PDF (requires pdflatex or Overleaf)
pdflatex output/portfolio.tex
# or upload to Overleaf
```

## Next Steps

1. **Create `config/projects.yml`** from the example
2. **Customize** with your actual project data
3. **Test** with `node generate-pdf.mjs dummy.html test.pdf --format=latex`
4. **Verify** the output in `output/test.tex`
5. **Never commit** `config/projects.yml` or private projects to public repos
6. **Use in Overleaf** or compile locally with pdflatex

---

**Questions?** Check the career-ops README and the inline code comments in `generate-pdf.mjs`.
