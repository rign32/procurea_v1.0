# Procurea Lead Magnets — Source Files

This directory contains the five flagship lead magnets for procurea.io / procurea.pl, in source form. Each lead magnet lives in its own subdirectory with:

- The core content (Markdown for PDF-destined magnets, CSV for XLSX-destined magnets)
- A `README.md` explaining structure, formulas, and usage
- `INSTRUCTIONS-TO-CONVERT.md` (where applicable) with conversion recipe for the production format
- Design briefs for covers where relevant

## Files inventory

```
downloads/
├── README.md                                  ← this file
│
├── rfq-comparison-template/                   ← Magnet 1 (XLSX + Notion, TOFU, P2)
│   ├── rfq-comparison-template.csv
│   ├── rfq-comparison-template-notion.md
│   ├── README.md
│   └── INSTRUCTIONS-TO-CONVERT.md
│
├── supplier-risk-checklist-2026/              ← Magnet 2 (PDF 6 pages, MOFU, P1)
│   ├── supplier-risk-checklist-2026.md
│   └── cover-design-brief.md
│
├── tco-calculator/                            ← Magnet 3 (XLSX 3 tabs, MOFU, Mixed)
│   ├── tco-calculator-tab1-categories.csv
│   ├── tco-calculator-tab2-comparison.csv
│   ├── tco-calculator-tab3-sensitivity.csv
│   └── README.md
│
├── vendor-scoring-framework/                  ← Magnet 4 (PDF 8 pages, TOFU, P2)
│   └── vendor-scoring-framework.md
│
└── nearshore-migration-playbook/              ← Magnet 5 (PDF 14 pages, MOFU, P1)
    └── nearshore-migration-playbook.md
```

Total: 14 content files across 5 magnets.

## Conversion: Markdown → PDF

Three production routes. All produce acceptable results; choose based on team tooling.

### Route A: pandoc + LaTeX (highest quality, technical setup)

```bash
# Install pandoc and a LaTeX engine (macTeX on macOS, TeX Live on Linux)
brew install pandoc
brew install --cask mactex

# Convert
cd downloads/supplier-risk-checklist-2026
pandoc supplier-risk-checklist-2026.md \
  -o supplier-risk-checklist-2026.pdf \
  --pdf-engine=xelatex \
  -V geometry:"margin=15mm" \
  -V fontsize=10pt \
  -V mainfont="Inter" \
  -V monofont="JetBrains Mono" \
  --toc \
  --number-sections
```

### Route B: Typora or Obsidian Export (easy, good quality)

1. Open the `.md` file in Typora (typora.io) or Obsidian with the Obsidian Export plugin.
2. Typora: File → Export → PDF. Pick a theme (the `GitHub` theme works well for this content).
3. Obsidian: use the Pandoc or Obsidian Enhancing Export plugin for PDF output.

### Route C: Browser print-to-PDF (fastest, acceptable)

1. Open the `.md` file in any Markdown preview (GitHub, VS Code preview, MarkText).
2. Cmd+P → "Save as PDF" in the print dialog.
3. This is fine for internal use; for download-quality output use Route A or B.

## Conversion: CSV → XLSX with formulas

1. Open the CSV in Excel or Google Sheets.
2. Save As → Excel Workbook (.xlsx).
3. Follow the per-magnet `INSTRUCTIONS-TO-CONVERT.md` or `README.md` for formulas, tabs, charts, and protection settings.

The CSVs intentionally ship with values (not formulas) so they survive CSV's lossy format. Formulas are defined in the instruction files.

## Estimated final page counts

| Magnet | Source Markdown lines | Estimated PDF pages (Inter 10pt, A4) | Matches brief? |
|---|---|---|---|
| RFQ Comparison Template | n/a (CSV + short MD) | n/a (Excel-based) | Yes |
| Supplier Risk Checklist | ~460 | 10-12 (target 6 with 2-col layout) | Exceeds, designer to compress via layout |
| TCO Calculator | n/a (CSV + README) | n/a (Excel-based) | Yes |
| Vendor Scoring Framework | ~430 | 8-10 | Matches brief |
| Nearshore Migration Playbook | ~730 | 14-16 | Matches brief |

The Supplier Risk Checklist Markdown is intentionally denser than 6 pages worth of loose text; the cover design brief instructs the graphic designer to use two-column layouts and condensed tables to hit the 6-page target while keeping the full content.

## Workflow for shipping

1. Review Markdown content — wordsmithing, factual check, legal review if needed.
2. For each magnet, commission design from the brief (cover-design-brief.md where available).
3. Convert to production format (PDF or XLSX) via the recipes above.
4. QA: open the output on a fresh machine, print one page, check selectable text, verify hyperlinks.
5. Place production files in `/landing/public/resources/downloads/` with stable filenames that match `gatedDownloadUrl` in `resources.ts`.
6. Test the download flow end-to-end on staging (enter email, receive magnet).

## File naming convention for production

```
rfq-comparison-template.zip     (bundles .xlsx + .md Notion + README.pdf)
supplier-risk-checklist-2026.pdf
tco-calculator.xlsx
vendor-scoring-framework.pdf
nearshore-migration-playbook.pdf
```

These filenames match the `gatedDownloadUrl` values in `landing/src/content/resources.ts`.

## Content ownership and review cadence

- Content author: Procurea founder + marketing team
- Review cadence: every 6 months (next: October 2026)
- Feedback channel: hello@procurea.io
- Version tracking: each magnet has a "version" and "next revision" date on the final page
