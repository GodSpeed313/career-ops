# Quick Reference Card: Technical Ecosystem Integration

## 🔐 Security Summary

```
✅ Teplit is PROTECTED
   • Stored in c:\Users\Owner\Teplit\ (OUTSIDE career-ops)
   • Never committed to public repo
   • .gitignore explicitly guards against accidental commits
   • Status: "private" in projects.yml excludes from public CVs
   
✅ Public CV shows: WorldCraft-Visuals + Career-Ops Contribution
   
✅ Private Portfolio can show: All projects (including Teplit)
```

## 🚀 Common Commands

```bash
# 1. Initialize your configuration (one-time)
cp examples/projects.example.yml config/projects.yml
# Then edit config/projects.yml with your data

# 2. Generate public CV with projects
node generate-pdf.mjs dummy.html portfolio.pdf --format=latex
# Output: output/portfolio.tex

# 3. Check file (before git commit)
git status
# Should NOT show Teplit/ or config/projects.yml

# 4. Generate private portfolio (advanced)
# Edit config/projects-private.yml with different display_settings
# Update generate-pdf.mjs to load projects-private.yml
```

## 📁 Key Files

| File | Purpose | User edits? |
|------|---------|------------|
| `config/projects.yml` | Your projects (gitignored) | ✅ YES |
| `examples/projects.example.yml` | Template reference | ❌ NO |
| `templates/cv-template.tex` | LaTeX template | ✅ OPTIONAL |
| `generate-pdf.mjs` | Rendering logic | ✅ OPTIONAL |
| `.gitignore` | Security rules | ⚠️ CAREFUL |
| `ECOSYSTEM_SETUP.md` | Full documentation | ℹ️ READ |

## 🎯 Project Structure (In Your config/projects.yml)

```yaml
projects:
  - id: unique-id              # Use in display_settings
    name: "Project Name"
    tagline: "One-line summary"
    role: "Your Role"
    status: "public"|"private"|"portfolio"
    description: "2-3 sentence description"
    hero_metric: "Key achievement"
    stack:
      languages: [Python, JavaScript]
      frameworks: [React, Express]
    github_url: "https://..."

toolbox:
  languages:
    - name: "Python"
      level: "Expert"
      use_cases: [Data Science, ...]
  frameworks: [React, Express, ...]
  databases: [PostgreSQL, ...]
  music_tech: [FL Studio, Surge XT, ...]

display_settings:
  public_projects: [worldcraft, career-ops]  # What appears on CV
```

## 🔒 Security Checklist

Before `git push`:

```bash
# 1. Verify Teplit is NOT copied into career-ops
ls . | grep -i teplit       # Should return nothing

# 2. Check git won't commit Teplit
git status | grep -i teplit # Should return nothing

# 3. Verify user config is gitignored
git status config/          # Should NOT list projects.yml

# 4. Check .gitignore comments are present
grep -i "SECURITY" .gitignore  # Should find security section
```

## 🎨 Example Projects in Your Ecosystem

### 1. **Teplit** (Private)
- Status: `"private"`
- Tech: Node.js, React, Docker, PostgreSQL
- Visible: Private portfolio only

### 2. **WorldCraft-Visuals** (Public)
- Status: `"public"`
- Tech: Python, Procedural Generation, Qiskit
- Visible: All CVs

### 3. **Melody Maestro** (Portfolio)
- Status: `"portfolio"`
- Tech: FL Studio, Surge XT, Odin 2, VSTs
- Visible: Music producer portfolio

### 4. **Career-Ops Contribution** (Public)
- Status: `"public"`
- Tech: JavaScript, LaTeX, Jinja2
- Visible: All CVs

## 💡 Common Customizations

### Show Private Projects Only (Recruiting Contacts)

```yaml
# In config/projects.yml
display_settings:
  public_projects:
    - teplit
    - melody
    - worldcraft
```

### Change Project Order

```yaml
# Re-order in display_settings.public_projects
public_projects:
  - career-ops        # Appears first
  - worldcraft        # Appears second
```

### Add New Project

1. Add to `projects[]` in config/projects.yml
2. Update `display_settings.public_projects`
3. Regenerate: `node generate-pdf.mjs dummy.html cv.pdf --format=latex`

## 🚨 DO NOT

```
❌ git add Teplit/
❌ cp Teplit /career-ops/Teplit
❌ Commit .env or credentials
❌ Edit examples/projects.example.yml for personal data
❌ Hardcode file paths (use relative paths)
❌ Remove .gitignore security comments
```

## ✅ DO

```
✅ Edit config/projects.yml for your data
✅ Keep Teplit in c:\Users\Owner\Teplit\
✅ Run git status before push
✅ Test with: node generate-pdf.mjs dummy.html test.pdf --format=latex
✅ Review output/test.tex before distributing
✅ Update display_settings when adding projects
```

## 📊 Generated Output Format

```latex
\section{SUMMARY}          ← From cv.md

\section{EXPERIENCE}       ← From cv.md

\section{TECHNICAL ECOSYSTEM}     ← NEW: Generated from projects.yml
  \subsection{Project Gallery}
    • Teplit (if public_projects includes it)
    • WorldCraft-Visuals
    • Melody Maestro (if included)
    • Career-Ops Contribution
    ↳ For each: name, description, hero metric, stack

  \subsection{Toolbox}
    • Languages (Python, JavaScript, LaTeX, etc.)
    • Frameworks & Platforms
    • Databases & Infrastructure
    • Specialized Tools (Music Production, Data Science)

\section{SKILLS}           ← From cv.md

\section{EDUCATION}        ← From cv.md
```

## 🔄 Workflow

```
1. Edit config/projects.yml
   ↓
2. Run: node generate-pdf.mjs dummy.html cv.pdf --format=latex
   ↓
3. Verify: cat output/cv.tex (or open in Overleaf)
   ↓
4. Customize display_settings for different CVs
   ↓
5. git status (confirm no private code)
   ↓
6. git push (safely!)
```

## 📞 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Projects config not found" | Run: `cp examples/projects.example.yml config/projects.yml` |
| Teplit showing on CV | Check `display_settings.public_projects` - should NOT include "teplit" |
| Missing toolbox section | Verify `toolbox:` exists in config/projects.yml |
| LaTeX errors | Use Overleaf to debug `output/portfolio.tex` |
| Stuck on generation | Check for circular references or Unicode issues in project descriptions |

---

**Remember:** Your private code (Teplit) is SAFE! It's protected by architecture, not just .gitignore. ✅

For detailed setup, see `ECOSYSTEM_SETUP.md`
For full documentation, see `INTEGRATION_COMPLETE.md`
