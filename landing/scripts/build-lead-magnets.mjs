#!/usr/bin/env node
/**
 * Build lead magnets — converts Markdown sources in public/resources/downloads/
 * to PDF (via pandoc) and XLSX (via csv-to-xlsx converter).
 *
 * Prerequisites:
 *   brew install pandoc         # macOS
 *   brew install --cask wkhtmltopdf  # for better PDF rendering
 *
 * Usage:
 *   node scripts/build-lead-magnets.mjs
 *
 * Alternative without pandoc:
 *   Use VS Code "Markdown PDF" extension → right-click .md → "Export (pdf)"
 *   Or import .md into Typora / Obsidian → Export → PDF
 *
 * For CSV → XLSX:
 *   Open .csv in Excel → Add formulas per README.md in each folder → Save as .xlsx
 */

import { readdirSync, statSync, existsSync, writeFileSync } from 'node:fs'
import { join, dirname, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DOWNLOADS_DIR = join(ROOT, 'public/resources/downloads')

const PANDOC_AVAILABLE = (() => {
  try {
    execSync('which pandoc', { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
})()

function logHeader(text) {
  console.log(`\n\x1b[1m\x1b[36m${text}\x1b[0m`)
  console.log('═'.repeat(text.length))
}

function findFiles(dir, ext) {
  const results = []
  if (!existsSync(dir)) return results
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...findFiles(full, ext))
    } else if (entry.endsWith(ext)) {
      results.push(full)
    }
  }
  return results
}

function convertMdToPdf(mdPath) {
  const outPath = mdPath.replace(/\.md$/, '.pdf')
  try {
    execSync(
      `pandoc "${mdPath}" -o "${outPath}" ` +
        `--pdf-engine=wkhtmltopdf ` +
        `-V margin-top=20mm -V margin-bottom=20mm ` +
        `-V margin-left=20mm -V margin-right=20mm ` +
        `--metadata title="$(head -1 "${mdPath}" | sed 's/^# //')"`,
      { stdio: 'pipe' }
    )
    console.log(`  ✓ ${basename(mdPath)} → ${basename(outPath)}`)
    return true
  } catch (e) {
    // fallback: HTML only (without wkhtmltopdf)
    try {
      execSync(`pandoc "${mdPath}" -o "${outPath.replace('.pdf', '.html')}" --standalone --css=lead-magnet.css`, {
        stdio: 'pipe',
      })
      console.log(`  ⚠ ${basename(mdPath)} → ${basename(outPath.replace('.pdf', '.html'))} (HTML fallback — install wkhtmltopdf for PDF)`)
      return true
    } catch (err) {
      console.error(`  ✗ ${basename(mdPath)} — pandoc failed: ${err.message.split('\n')[0]}`)
      return false
    }
  }
}

function writeConversionGuide() {
  const guidePath = join(DOWNLOADS_DIR, 'CONVERSION-GUIDE.md')
  writeFileSync(
    guidePath,
    `# Lead Magnet Conversion Guide

The Markdown + CSV files in this folder are the SOURCE content for Procurea lead magnets.
To ship to users, convert them to PDF + XLSX.

## Option 1 — Pandoc (recommended)

\`\`\`bash
# Install once
brew install pandoc
brew install --cask wkhtmltopdf

# Build all PDFs
node landing/scripts/build-lead-magnets.mjs
\`\`\`

## Option 2 — VS Code extension (easiest)

1. Install "Markdown PDF" extension by yzane
2. Right-click any \`.md\` file → **Markdown PDF: Export (pdf)**
3. PDF appears next to the .md file

## Option 3 — Typora / Obsidian

1. Open \`.md\` in Typora or Obsidian
2. File → Export → PDF
3. Apply Procurea brand stylesheet (see \`lead-magnet.css\` below)

## CSV → XLSX

For the XLSX magnets (\`rfq-comparison-template\`, \`tco-calculator\`):

1. Open \`.csv\` in Microsoft Excel or Google Sheets
2. Add formulas per the \`README.md\` in each folder
3. **Save As** \`.xlsx\`

## Branding notes

Apply Procurea brand to PDFs:
- Font: Inter (body), Inter Tight (headings)
- Accent color: #5E8C8F (teal)
- Include Procurea logo on cover page + footer
- Page numbers bottom-center
- Header with magnet title (left) and Procurea wordmark (right)

## Output placement

After conversion, the PDFs and XLSX files should sit at:
- \`landing/public/resources/downloads/rfq-comparison-template.xlsx\`
- \`landing/public/resources/downloads/supplier-risk-checklist-2026.pdf\`
- \`landing/public/resources/downloads/tco-calculator.xlsx\`
- \`landing/public/resources/downloads/vendor-scoring-framework.pdf\`
- \`landing/public/resources/downloads/nearshore-migration-playbook.pdf\`

The \`gatedDownloadUrl\` field in \`src/content/resources.ts\` already points at these paths.
`,
    'utf8'
  )
  console.log(`  Wrote ${basename(guidePath)}`)
}

function writeLeadMagnetCSS() {
  const cssPath = join(DOWNLOADS_DIR, 'lead-magnet.css')
  const css = `/* Procurea lead magnet print stylesheet */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@600;700;800&display=swap');

body {
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 11pt;
  line-height: 1.55;
  color: #0F172B;
  max-width: 780px;
  margin: 0 auto;
  padding: 40px;
}

h1, h2, h3 {
  font-family: 'Inter Tight', -apple-system, sans-serif;
  letter-spacing: -0.02em;
  color: #2A5C5D;
  margin-top: 2em;
  margin-bottom: 0.5em;
  page-break-after: avoid;
}

h1 {
  font-size: 28pt;
  color: #5E8C8F;
  border-bottom: 3px solid #5E8C8F;
  padding-bottom: 0.3em;
}

h2 {
  font-size: 18pt;
  border-bottom: 1px solid #E2E8F0;
  padding-bottom: 0.2em;
}

h3 { font-size: 14pt; }

p, ul, ol { margin: 0 0 1em 0; }

code {
  background: #F1F5F9;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 10pt;
}

pre {
  background: #F1F5F9;
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  page-break-inside: avoid;
}

blockquote {
  border-left: 4px solid #5E8C8F;
  margin: 1em 0;
  padding: 0.5em 1em;
  background: #F8FAFC;
  font-style: italic;
  color: #475569;
  page-break-inside: avoid;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
  page-break-inside: avoid;
}

th {
  background: #5E8C8F;
  color: white;
  padding: 0.6em;
  text-align: left;
  font-weight: 600;
}

td {
  border-bottom: 1px solid #E2E8F0;
  padding: 0.5em 0.6em;
}

tr:nth-child(even) td { background: #F8FAFC; }

hr { border: none; border-top: 2px solid #E2E8F0; margin: 2em 0; }

strong { color: #2A5C5D; font-weight: 600; }

a { color: #5E8C8F; text-decoration: none; }
a:hover { text-decoration: underline; }

/* Print specifics */
@page {
  size: A4;
  margin: 20mm;
  @bottom-center {
    content: counter(page);
    font-size: 9pt;
    color: #94A3B8;
  }
}

@media print {
  body { padding: 0; max-width: none; }
  h1 { page-break-before: always; }
  h1:first-of-type { page-break-before: avoid; }
}
`
  writeFileSync(cssPath, css, 'utf8')
  console.log(`  Wrote ${basename(cssPath)}`)
}

function main() {
  logHeader('Procurea Lead Magnet Builder')

  if (!existsSync(DOWNLOADS_DIR)) {
    console.error(`✗ Directory not found: ${DOWNLOADS_DIR}`)
    console.error('  Run the Lead Magnet Content Writer agent first.')
    process.exit(1)
  }

  // Always write guide + CSS (idempotent)
  logHeader('Writing conversion assets')
  writeConversionGuide()
  writeLeadMagnetCSS()

  const mdFiles = findFiles(DOWNLOADS_DIR, '.md').filter(
    f => !basename(f).match(/^(README|CONVERSION-GUIDE|INSTRUCTIONS)/i)
  )
  const csvFiles = findFiles(DOWNLOADS_DIR, '.csv')

  logHeader(`Found ${mdFiles.length} Markdown files and ${csvFiles.length} CSV files`)

  if (!PANDOC_AVAILABLE) {
    console.log('\n⚠  pandoc not installed — PDF conversion skipped.')
    console.log('   Install: brew install pandoc && brew install --cask wkhtmltopdf')
    console.log('   Or: use VS Code "Markdown PDF" extension per CONVERSION-GUIDE.md')
  } else {
    logHeader('Converting Markdown → PDF')
    let ok = 0
    for (const md of mdFiles) {
      if (convertMdToPdf(md)) ok++
    }
    console.log(`\n  ${ok}/${mdFiles.length} PDFs generated`)
  }

  if (csvFiles.length) {
    console.log('\n  CSV files detected — convert to XLSX manually in Excel (add formulas per README.md)')
    for (const csv of csvFiles) {
      console.log(`    • ${csv.replace(ROOT, '.')}`)
    }
  }

  logHeader('Done')
  console.log('\nNext steps:')
  console.log('  1. If pandoc installed: PDFs ready at public/resources/downloads/')
  console.log('  2. If not: open each .md in VS Code with "Markdown PDF" extension')
  console.log('  3. Convert .csv to .xlsx in Excel (add formulas per folder README.md)')
  console.log('  4. Verify downloads resolve: curl -I https://procurea.io/resources/downloads/<file>')
}

main()
