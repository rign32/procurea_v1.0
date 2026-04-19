# Lead Magnet Conversion Guide

The Markdown + CSV files in this folder are the SOURCE content for Procurea lead magnets.
To ship to users, convert them to PDF + XLSX.

## Option 1 — Pandoc (recommended)

```bash
# Install once
brew install pandoc
brew install --cask wkhtmltopdf

# Build all PDFs
node landing/scripts/build-lead-magnets.mjs
```

## Option 2 — VS Code extension (easiest)

1. Install "Markdown PDF" extension by yzane
2. Right-click any `.md` file → **Markdown PDF: Export (pdf)**
3. PDF appears next to the .md file

## Option 3 — Typora / Obsidian

1. Open `.md` in Typora or Obsidian
2. File → Export → PDF
3. Apply Procurea brand stylesheet (see `lead-magnet.css` below)

## CSV → XLSX

For the XLSX magnets (`rfq-comparison-template`, `tco-calculator`):

1. Open `.csv` in Microsoft Excel or Google Sheets
2. Add formulas per the `README.md` in each folder
3. **Save As** `.xlsx`

## Branding notes

Apply Procurea brand to PDFs:
- Font: Inter (body), Inter Tight (headings)
- Accent color: #5E8C8F (teal)
- Include Procurea logo on cover page + footer
- Page numbers bottom-center
- Header with magnet title (left) and Procurea wordmark (right)

## Output placement

After conversion, the PDFs and XLSX files should sit at:
- `landing/public/resources/downloads/rfq-comparison-template.xlsx`
- `landing/public/resources/downloads/supplier-risk-checklist-2026.pdf`
- `landing/public/resources/downloads/tco-calculator.xlsx`
- `landing/public/resources/downloads/vendor-scoring-framework.pdf`
- `landing/public/resources/downloads/nearshore-migration-playbook.pdf`

The `gatedDownloadUrl` field in `src/content/resources.ts` already points at these paths.
