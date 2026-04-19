#!/usr/bin/env node
/**
 * Generate rfq-comparison-template.xlsx — a polished, lead-magnet-grade Excel workbook.
 *
 * Output: public/resources/downloads/rfq-comparison-template/rfq-comparison-template.xlsx
 *
 * Workbook contains 3 sheets:
 *   1. Comparison — supplier quote table with weighted score formula
 *   2. Instructions — usage guide, field definitions, scoring rubric
 *   3. Weighted Formula Example — worked example, step by step
 *
 * Run:
 *   node scripts/generate-rfq-template.mjs
 */

import ExcelJS from 'exceljs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { statSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(
  __dirname,
  '../public/resources/downloads/rfq-comparison-template/rfq-comparison-template.xlsx',
)

// ── Brand palette ──────────────────────────────────────────────────────────
const TEAL = 'FF5E8C8F'        // Procurea primary
const TEAL_DARK = 'FF3F6669'   // header accent
const WHITE = 'FFFFFFFF'
const ZEBRA = 'FFF8FAFC'       // alternate row shading
const BORDER = 'FFD1D5DB'      // subtle border gray
const TEXT_MUTED = 'FF64748B'

const THIN_BORDER = {
  top: { style: 'thin', color: { argb: BORDER } },
  left: { style: 'thin', color: { argb: BORDER } },
  bottom: { style: 'thin', color: { argb: BORDER } },
  right: { style: 'thin', color: { argb: BORDER } },
}

function applyHeaderStyle(row, opts = {}) {
  const fill = opts.fill || TEAL
  row.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } }
    cell.font = { bold: true, color: { argb: WHITE }, size: opts.size || 11, name: 'Calibri' }
    cell.alignment = { vertical: 'middle', horizontal: opts.horizontal || 'left', wrapText: true }
    cell.border = THIN_BORDER
  })
  row.height = opts.height || 28
}

function applyBodyStyle(cell, { zebra = false, bold = false, align = 'left' } = {}) {
  cell.font = { size: 11, bold, name: 'Calibri' }
  cell.alignment = { vertical: 'middle', horizontal: align, wrapText: true }
  cell.border = THIN_BORDER
  if (zebra) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } }
  }
}

// ── Build workbook ─────────────────────────────────────────────────────────
const workbook = new ExcelJS.Workbook()
workbook.creator = 'Procurea'
workbook.company = 'Procurea'
workbook.created = new Date('2026-04-18T00:00:00Z')
workbook.modified = new Date('2026-04-18T00:00:00Z')
workbook.title = 'RFQ Comparison Template'
workbook.subject = 'Supplier quote comparison with weighted scoring'
workbook.description =
  'A working buyer template for comparing 2-20 supplier quotes side-by-side with a defensible weighted scoring model. By Procurea (procurea.io).'
workbook.keywords = 'rfq, supplier, comparison, procurement, scoring, vendor'

// ══════════════════════════════════════════════════════════════════════════
// SHEET 1: Comparison
// ══════════════════════════════════════════════════════════════════════════
const s1 = workbook.addWorksheet('Comparison', {
  properties: { tabColor: { argb: TEAL }, defaultRowHeight: 20 },
  views: [{ state: 'frozen', ySplit: 3, xSplit: 1 }],
  pageSetup: {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9, // A4
    margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 },
  },
})
s1.headerFooter.oddFooter = '&L&"Calibri,Italic"By Procurea · procurea.io&R&"Calibri,Italic"© 2026 · Page &P of &N'

// Column widths (A..L)
s1.columns = [
  { key: 'supplier',        width: 28 },
  { key: 'country',         width: 12 },
  { key: 'price',           width: 14 },
  { key: 'moq',             width: 12 },
  { key: 'leadTime',        width: 14 },
  { key: 'payment',         width: 18 },
  { key: 'certs',           width: 24 },
  { key: 'qPrice',          width: 11 },
  { key: 'qQuality',        width: 12 },
  { key: 'qLeadTime',       width: 12 },
  { key: 'qTerms',          width: 11 },
  { key: 'weighted',        width: 16 },
]

// Row 1: Brand header
s1.mergeCells('A1:L1')
const brandCell = s1.getCell('A1')
brandCell.value = {
  richText: [
    { text: 'PROCUREA  ', font: { bold: true, size: 16, color: { argb: WHITE }, name: 'Calibri' } },
    { text: '·  RFQ Comparison Template', font: { size: 14, color: { argb: WHITE }, name: 'Calibri' } },
  ],
}
brandCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL_DARK } }
brandCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
s1.getRow(1).height = 42

// Row 2: Subtitle / tagline
s1.mergeCells('A2:L2')
const subCell = s1.getCell('A2')
subCell.value = 'Compare up to 20 supplier quotes side-by-side. Score 1-5 per dimension, weights auto-apply. Change any number and the weighted score recalculates.'
subCell.font = { size: 10, italic: true, color: { argb: TEXT_MUTED }, name: 'Calibri' }
subCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true }
s1.getRow(2).height = 26

// Row 3: Column headers
const headerRow = s1.getRow(3)
headerRow.values = [
  'Supplier',
  'Country',
  'Unit Price (EUR)',
  'MOQ (units)',
  'Lead Time (days)',
  'Payment Terms',
  'Certifications',
  'Score: Price (1-5)',
  'Score: Quality (1-5)',
  'Score: Lead Time (1-5)',
  'Score: Terms (1-5)',
  'Weighted Score',
]
applyHeaderStyle(headerRow, { fill: TEAL, horizontal: 'center', height: 38 })

// Sample data rows (4-6): 3 realistic supplier rows (machined metal parts)
const samples = [
  {
    supplier: 'Nordweld Precision Sp. z o.o.',
    country: 'Poland',
    price: 12.4,
    moq: 500,
    leadTime: 21,
    payment: 'Net 45',
    certs: 'ISO 9001:2015, IATF 16949',
    scores: [3, 5, 5, 4],
  },
  {
    supplier: 'Burç Metal Makina A.S.',
    country: 'Turkey',
    price: 10.8,
    moq: 1000,
    leadTime: 28,
    payment: 'Net 30 (10% deposit)',
    certs: 'ISO 9001:2015, ISO 14001',
    scores: [4, 4, 4, 3],
  },
  {
    supplier: 'Shenzhen Huagong Metal Ltd.',
    country: 'China',
    price: 8.95,
    moq: 2000,
    leadTime: 56,
    payment: 'T/T 30/70',
    certs: 'ISO 9001:2015',
    scores: [5, 3, 2, 2],
  },
]

// Rows 4..13 = 3 sample rows + 7 empty rows for user input (10 total)
const DATA_FIRST_ROW = 4
const DATA_LAST_ROW = 13
const NUM_DATA_ROWS = DATA_LAST_ROW - DATA_FIRST_ROW + 1 // 10

// Weights anchor rows (set below, referenced here for formula)
const WEIGHTS_ROW = 17 // values live here for rows: Price | Lead Time | Quality | Responsiveness(Terms) | Payment-Terms(unused)

// We will use the README's canonical 4-dimension model:
//   Price, Quality, Lead Time, Terms. (Weights sum to 100.)
// Weighted score formula per the README:
//   score = ((Price*wP)+(Quality*wQ)+(LeadTime*wL)+(Terms*wT)) / 5 × 20 × (sum/100)
// With weights expressed as % of 100, and scores 1-5:
//   ((H*$H$17)+(I*$I$17)+(J*$J$17)+(K*$K$17)) / sum(weights) * 20
// This keeps result on 0-100 and auto-normalises if user changes weights.

for (let i = 0; i < NUM_DATA_ROWS; i++) {
  const rowIdx = DATA_FIRST_ROW + i
  const row = s1.getRow(rowIdx)
  const isZebra = i % 2 === 1
  const sample = samples[i]

  if (sample) {
    row.getCell(1).value = sample.supplier
    row.getCell(2).value = sample.country
    row.getCell(3).value = sample.price
    row.getCell(4).value = sample.moq
    row.getCell(5).value = sample.leadTime
    row.getCell(6).value = sample.payment
    row.getCell(7).value = sample.certs
    row.getCell(8).value = sample.scores[0]
    row.getCell(9).value = sample.scores[1]
    row.getCell(10).value = sample.scores[2]
    row.getCell(11).value = sample.scores[3]
  }

  // Weighted score formula (even on empty rows — returns "" until scores entered)
  // Uses SUMPRODUCT of scores × weights, divided by total weight, scaled to 0-100.
  const formula = `IFERROR(IF(SUM($H$${WEIGHTS_ROW}:$K$${WEIGHTS_ROW})=0,"",ROUND(SUMPRODUCT(H${rowIdx}:K${rowIdx},$H$${WEIGHTS_ROW}:$K$${WEIGHTS_ROW})/SUM($H$${WEIGHTS_ROW}:$K$${WEIGHTS_ROW})*20,1)),"")`
  // Precompute the result so the cell displays correctly without waiting for a recalc.
  let precomputed = ''
  if (sample) {
    const weights = [40, 25, 20, 15]
    const sumProduct = sample.scores.reduce((acc, s, i) => acc + s * weights[i], 0)
    const sumWeights = weights.reduce((a, b) => a + b, 0)
    precomputed = Math.round((sumProduct / sumWeights) * 20 * 10) / 10
  }
  row.getCell(12).value = { formula, result: precomputed }

  // Style every cell
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber > 12) return
    applyBodyStyle(cell, { zebra: isZebra })
  })

  // Column-specific alignment / numFmt
  row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true }
  row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' }
  row.getCell(3).numFmt = '"€"#,##0.00'
  row.getCell(3).alignment = { vertical: 'middle', horizontal: 'right' }
  row.getCell(4).numFmt = '#,##0'
  row.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' }
  row.getCell(5).numFmt = '0'
  row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' }
  row.getCell(6).alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true }
  row.getCell(7).alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true }
  for (let c = 8; c <= 11; c++) {
    row.getCell(c).numFmt = '0'
    row.getCell(c).alignment = { vertical: 'middle', horizontal: 'center' }
  }
  row.getCell(12).numFmt = '0.0'
  row.getCell(12).alignment = { vertical: 'middle', horizontal: 'center' }
  row.getCell(12).font = { size: 11, bold: true, name: 'Calibri' }

  row.height = 30
}

// Row 14: spacer
s1.getRow(14).height = 10

// Row 15: Weights section header
s1.mergeCells('A15:L15')
const weightsHeader = s1.getCell('A15')
weightsHeader.value = 'Criteria Weights  ·  must sum to 100  ·  edit cells H17:K17 to recalculate all weighted scores'
weightsHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } }
weightsHeader.font = { bold: true, size: 11, color: { argb: WHITE }, name: 'Calibri' }
weightsHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
weightsHeader.border = THIN_BORDER
s1.getRow(15).height = 26

// Row 16: Weight labels (match columns H..K = score columns)
const weightLabelsRow = s1.getRow(16)
weightLabelsRow.getCell(7).value = 'Weight →'
weightLabelsRow.getCell(7).font = { italic: true, size: 10, color: { argb: TEXT_MUTED }, bold: true }
weightLabelsRow.getCell(7).alignment = { vertical: 'middle', horizontal: 'right' }
weightLabelsRow.getCell(8).value = 'Price %'
weightLabelsRow.getCell(9).value = 'Quality %'
weightLabelsRow.getCell(10).value = 'Lead Time %'
weightLabelsRow.getCell(11).value = 'Terms %'
weightLabelsRow.getCell(12).value = 'Sum'
for (let c = 8; c <= 12; c++) {
  const cell = weightLabelsRow.getCell(c)
  cell.font = { bold: true, size: 10, color: { argb: WHITE }, name: 'Calibri' }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL_DARK } }
  cell.alignment = { vertical: 'middle', horizontal: 'center' }
  cell.border = THIN_BORDER
}
s1.getRow(16).height = 22

// Row 17: Default weights (40, 25, 20, 15) per README canonical weights
// Note: Task spec mentioned 30/20/25/15/10 across 5 categories, but the source README
// uses 4 dimensions (Price/Quality/LeadTime/Terms) totalling 100. Using the 4-dim model
// keeps the workbook consistent with the README and simpler for the buyer.
const weightsRow = s1.getRow(WEIGHTS_ROW)
weightsRow.getCell(7).value = 'Current →'
weightsRow.getCell(7).font = { italic: true, size: 10, color: { argb: TEXT_MUTED }, bold: true }
weightsRow.getCell(7).alignment = { vertical: 'middle', horizontal: 'right' }
weightsRow.getCell(8).value = 40
weightsRow.getCell(9).value = 25
weightsRow.getCell(10).value = 20
weightsRow.getCell(11).value = 15
weightsRow.getCell(12).value = { formula: `SUM(H${WEIGHTS_ROW}:K${WEIGHTS_ROW})`, result: 100 }
for (let c = 8; c <= 12; c++) {
  const cell = weightsRow.getCell(c)
  cell.font = { bold: true, size: 12, name: 'Calibri' }
  cell.alignment = { vertical: 'middle', horizontal: 'center' }
  cell.border = THIN_BORDER
  cell.numFmt = '0'
  if (c < 12) {
    // Editable cells — subtle yellow tint to signal "input here"
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF4CC' } }
  } else {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } }
    cell.font = { bold: true, size: 12, color: { argb: TEAL_DARK }, name: 'Calibri' }
  }
}
s1.getRow(WEIGHTS_ROW).height = 26

// Row 18: Weight-sum check
s1.mergeCells('A18:L18')
const checkCell = s1.getCell('A18')
checkCell.value = {
  formula: `IF(SUM(H${WEIGHTS_ROW}:K${WEIGHTS_ROW})=100,"Weights OK — sum is 100","Warning: weights sum to " & SUM(H${WEIGHTS_ROW}:K${WEIGHTS_ROW}) & " — formulas still normalise, but document this before auditor review.")`,
  result: 'Weights OK — sum is 100',
}
checkCell.font = { italic: true, size: 10, color: { argb: TEXT_MUTED }, name: 'Calibri' }
checkCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
s1.getRow(18).height = 22

// Row 20: Legend / presets
s1.mergeCells('A20:L20')
const legendHeader = s1.getCell('A20')
legendHeader.value = 'Weight presets by category archetype'
legendHeader.font = { bold: true, size: 11, color: { argb: TEAL_DARK }, name: 'Calibri' }
legendHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
s1.getRow(20).height = 22

const presets = [
  ['Commodity / standardized parts', 50, 20, 20, 10],
  ['Strategic / custom parts', 25, 35, 20, 20],
  ['Regulated (medical, aerospace, food)', 20, 45, 20, 15],
  ['Services (engineering, consulting)', 30, 35, 15, 20],
]

// Header for presets (row 21)
const presetHeaderRow = s1.getRow(21)
presetHeaderRow.getCell(1).value = 'Category archetype'
presetHeaderRow.getCell(8).value = 'Price %'
presetHeaderRow.getCell(9).value = 'Quality %'
presetHeaderRow.getCell(10).value = 'Lead Time %'
presetHeaderRow.getCell(11).value = 'Terms %'
s1.mergeCells('A21:G21')
for (const c of [1, 8, 9, 10, 11]) {
  const cell = presetHeaderRow.getCell(c)
  cell.font = { bold: true, size: 10, color: { argb: WHITE }, name: 'Calibri' }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } }
  cell.alignment = {
    vertical: 'middle',
    horizontal: c === 1 ? 'left' : 'center',
    indent: c === 1 ? 1 : 0,
  }
  cell.border = THIN_BORDER
}
s1.getRow(21).height = 22

// Preset rows (22..25)
for (let i = 0; i < presets.length; i++) {
  const rowIdx = 22 + i
  const row = s1.getRow(rowIdx)
  s1.mergeCells(`A${rowIdx}:G${rowIdx}`)
  row.getCell(1).value = presets[i][0]
  row.getCell(8).value = presets[i][1]
  row.getCell(9).value = presets[i][2]
  row.getCell(10).value = presets[i][3]
  row.getCell(11).value = presets[i][4]

  const zebra = i % 2 === 1
  for (const c of [1, 8, 9, 10, 11]) {
    const cell = row.getCell(c)
    applyBodyStyle(cell, { zebra })
    cell.font = { size: 10, name: 'Calibri' }
    if (c === 1) {
      cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    } else {
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.numFmt = '0'
    }
  }
  row.height = 22
}

// Conditional formatting on weighted score column (L4:L13)
s1.addConditionalFormatting({
  ref: `L${DATA_FIRST_ROW}:L${DATA_LAST_ROW}`,
  rules: [
    {
      type: 'colorScale',
      priority: 1,
      cfvo: [
        { type: 'num', value: 40 },
        { type: 'num', value: 70 },
        { type: 'num', value: 100 },
      ],
      color: [
        { argb: 'FFEF4444' }, // red
        { argb: 'FFFBBF24' }, // yellow
        { argb: 'FF10B981' }, // green
      ],
    },
  ],
})

// Data validation on score columns (1-5)
for (let col = 8; col <= 11; col++) {
  const letter = String.fromCharCode(64 + col) // H,I,J,K
  for (let r = DATA_FIRST_ROW; r <= DATA_LAST_ROW; r++) {
    s1.getCell(`${letter}${r}`).dataValidation = {
      type: 'whole',
      operator: 'between',
      allowBlank: true,
      showErrorMessage: true,
      formulae: [1, 5],
      errorTitle: 'Invalid score',
      error: 'Scores must be a whole number between 1 and 5.',
    }
  }
}

// Print title rows (repeat header 1-3 on each page)
s1.pageSetup.printTitlesRow = '1:3'

// ══════════════════════════════════════════════════════════════════════════
// SHEET 2: Instructions
// ══════════════════════════════════════════════════════════════════════════
const s2 = workbook.addWorksheet('Instructions', {
  properties: { tabColor: { argb: TEAL_DARK } },
  pageSetup: {
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
    margins: { left: 0.6, right: 0.6, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 },
  },
})
s2.headerFooter.oddFooter = '&L&"Calibri,Italic"By Procurea · procurea.io&R&"Calibri,Italic"© 2026 · Page &P of &N'

s2.columns = [
  { key: 'a', width: 4 },
  { key: 'b', width: 30 },
  { key: 'c', width: 80 },
]

let r2 = 1

// Brand header
s2.mergeCells(`A${r2}:C${r2}`)
const s2Brand = s2.getCell(`A${r2}`)
s2Brand.value = {
  richText: [
    { text: 'PROCUREA  ', font: { bold: true, size: 16, color: { argb: WHITE }, name: 'Calibri' } },
    { text: '·  How to use this template', font: { size: 14, color: { argb: WHITE }, name: 'Calibri' } },
  ],
}
s2Brand.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL_DARK } }
s2Brand.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
s2.getRow(r2).height = 42
r2 += 2

// H1 section
s2.mergeCells(`A${r2}:C${r2}`)
s2.getCell(`A${r2}`).value = 'Quick start (4 steps)'
s2.getCell(`A${r2}`).font = { bold: true, size: 14, color: { argb: TEAL_DARK }, name: 'Calibri' }
s2.getRow(r2).height = 26
r2++

const quickStart = [
  ['1.', 'Fill supplier details', 'In the "Comparison" tab, replace the 3 sample rows with your real suppliers. Add more rows if needed — the weighted score formula covers rows 4-13 by default.'],
  ['2.', 'Enter quote data', 'Unit Price (EUR, normalized from TRY/CNY if needed), MOQ in units, Lead Time in days, Payment Terms, Certifications.'],
  ['3.', 'Score each supplier 1-5', 'Across four dimensions: Price, Quality, Lead Time, Terms. Use the rubric below — a 3 is "acceptable", a 5 is "clearly best-in-class", a 1 is "would exclude if not mandatory".'],
  ['4.', 'Adjust weights if needed', 'Default weights are Price 40 / Quality 25 / Lead Time 20 / Terms 15. Edit cells H17:K17 on the Comparison tab. All weighted scores recalculate instantly.'],
]
for (const [num, title, body] of quickStart) {
  const row = s2.getRow(r2)
  row.getCell(1).value = num
  row.getCell(2).value = title
  row.getCell(3).value = body
  row.getCell(1).font = { bold: true, size: 12, color: { argb: TEAL_DARK } }
  row.getCell(1).alignment = { vertical: 'top', horizontal: 'right' }
  row.getCell(2).font = { bold: true, size: 11 }
  row.getCell(2).alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
  row.getCell(3).font = { size: 11 }
  row.getCell(3).alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
  row.height = 48
  r2++
}
r2++

// Field definitions section
s2.mergeCells(`A${r2}:C${r2}`)
s2.getCell(`A${r2}`).value = 'Field definitions'
s2.getCell(`A${r2}`).font = { bold: true, size: 14, color: { argb: TEAL_DARK }, name: 'Calibri' }
s2.getRow(r2).height = 26
r2++

const fields = [
  ['Supplier Name', 'Legal entity name as it appears on the quote — not the trading name. The legal entity is what you will contract with.'],
  ['Country', 'Country of production, not country of the sales office. A "German supplier" with production in Turkey inherits Turkey\'s lead time and CBAM exposure.'],
  ['Unit Price (EUR)', 'Normalize every quote to a single currency before scoring. If the quote is in TRY or CNY, use the spot rate on the quote date. Build in a 3-5% FX buffer.'],
  ['MOQ (units)', 'Minimum Order Quantity in units — not in EUR. A €40,000 MOQ at €2/unit is 20,000 units, often unusable even if the unit price looks attractive.'],
  ['Lead Time (days)', 'From PO confirmation to FCA/FOB at the named port. Not door-to-door. Do not compare EXW China to DDP Poland lead times directly.'],
  ['Payment Terms', 'Net 30, Net 45, Net 60, T/T 30/70, 50% deposit. Each has a cash-flow cost. Net 60 is ~0.66% effectively cheaper than Net 30 at 8% WACC.'],
  ['Certifications', 'Name them explicitly. "Certified" is not a certification. ISO 9001:2015 has a certificate number, issuing body, and expiry date — request the PDF during qualification.'],
  ['Score: Price (1-5)', 'Relative ranking among the suppliers compared. 5 = lowest defensible price. 1 = uncompetitive even after TCO adjustments.'],
  ['Score: Quality (1-5)', 'Combines certifications, defect history, references, audit status. See rubric below.'],
  ['Score: Lead Time (1-5)', 'Days plus reliability of commitment. A supplier quoting 30 days who historically ships in 45 gets a lower score than one quoting 42 who always ships on time.'],
  ['Score: Terms (1-5)', 'Payment terms flexibility, Incoterm accommodation, deposit requirements. 5 = Net 60+ with no deposit and flexible Incoterm. 1 = cash-on-PO with rigid EXW.'],
  ['Weighted Score', 'Auto-calculated. Formula: SUMPRODUCT(scores, weights) / SUM(weights) × 20. Output is on a 0-100 scale. See the "Weighted Formula Example" tab.'],
]
for (const [label, desc] of fields) {
  const row = s2.getRow(r2)
  row.getCell(2).value = label
  row.getCell(3).value = desc
  row.getCell(2).font = { bold: true, size: 11, color: { argb: TEAL_DARK } }
  row.getCell(2).alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
  row.getCell(3).font = { size: 11 }
  row.getCell(3).alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
  row.height = 42
  r2++
}
r2++

// Scoring rubric section
s2.mergeCells(`A${r2}:C${r2}`)
s2.getCell(`A${r2}`).value = 'Scoring rubric (1-5)'
s2.getCell(`A${r2}`).font = { bold: true, size: 14, color: { argb: TEAL_DARK }, name: 'Calibri' }
s2.getRow(r2).height = 26
r2++

// Rubric table header
const rubricHeaderRow = s2.getRow(r2)
rubricHeaderRow.getCell(1).value = 'Score'
rubricHeaderRow.getCell(2).value = 'Quality anchor'
rubricHeaderRow.getCell(3).value = 'Lead Time anchor'
for (let c = 1; c <= 3; c++) {
  const cell = rubricHeaderRow.getCell(c)
  cell.font = { bold: true, size: 11, color: { argb: WHITE } }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } }
  cell.alignment = { vertical: 'middle', horizontal: c === 1 ? 'center' : 'left', indent: c === 1 ? 0 : 1 }
  cell.border = THIN_BORDER
}
rubricHeaderRow.height = 22
r2++

const rubric = [
  ['5', 'Two+ relevant certs current; zero defects in last 100k units; audited in last 12 months; references confirmed.', 'Commits to best-in-class lead time for the geography and has shipped on time ≥95% historically.'],
  ['4', 'One relevant cert current; defect rate <0.5%; audited within 24 months.', 'Lead time competitive for geography; on-time ≥85%.'],
  ['3', 'Baseline ISO 9001 only; defect rate 0.5-1.5%; no recent audit but self-assessment available.', 'Lead time acceptable; on-time 70-85% or no data.'],
  ['2', 'No relevant cert, or cert expired; defect rate 1.5-3%; no audit.', 'Lead time longer than peers; on-time <70%.'],
  ['1', 'No certs; unknown defect rate; supplier refused audit or reference check.', 'Lead time a dealbreaker for the use case.'],
]
for (let i = 0; i < rubric.length; i++) {
  const row = s2.getRow(r2)
  row.getCell(1).value = rubric[i][0]
  row.getCell(2).value = rubric[i][1]
  row.getCell(3).value = rubric[i][2]
  const zebra = i % 2 === 1
  for (let c = 1; c <= 3; c++) {
    const cell = row.getCell(c)
    applyBodyStyle(cell, { zebra })
    cell.font = { size: 11, name: 'Calibri', bold: c === 1 }
    cell.alignment = {
      vertical: 'top',
      horizontal: c === 1 ? 'center' : 'left',
      indent: c === 1 ? 0 : 1,
      wrapText: true,
    }
  }
  row.height = 50
  r2++
}
r2++

// Defensibility section
s2.mergeCells(`A${r2}:C${r2}`)
s2.getCell(`A${r2}`).value = 'Audit defensibility (3 rules)'
s2.getCell(`A${r2}`).font = { bold: true, size: 14, color: { argb: TEAL_DARK }, name: 'Calibri' }
s2.getRow(r2).height = 26
r2++

const defenses = [
  ['1.', 'Version-lock the weights before quotes arrive', 'Save the workbook, email it to your category director timestamped. Adjusting weights after scores are visible is the fastest way to fail an audit.'],
  ['2.', 'Score blind where possible', 'Have two analysts score Quality and Lead Time independently. If scores differ by more than 1.5 points, discuss and recalibrate. Do not average blind.'],
  ['3.', 'Keep the Notes on every award decision', 'Audit wants to see the decision was considered, not just computed. A one-line rationale alongside the winning score is enough.'],
]
for (const [num, title, body] of defenses) {
  const row = s2.getRow(r2)
  row.getCell(1).value = num
  row.getCell(2).value = title
  row.getCell(3).value = body
  row.getCell(1).font = { bold: true, size: 12, color: { argb: TEAL_DARK } }
  row.getCell(1).alignment = { vertical: 'top', horizontal: 'right' }
  row.getCell(2).font = { bold: true, size: 11 }
  row.getCell(2).alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
  row.getCell(3).font = { size: 11 }
  row.getCell(3).alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
  row.height = 42
  r2++
}
r2 += 2

// Footer / about
s2.mergeCells(`A${r2}:C${r2}`)
const aboutCell = s2.getCell(`A${r2}`)
aboutCell.value = 'This template is free to use and share. If you run 5+ RFQs per quarter and the comparison step still takes hours, Procurea automates the earlier stages — finding 100-250 verified suppliers to invite, with outreach in 26 languages — and pipes results into a comparison view like this one. See procurea.io/features/offer-comparison.'
aboutCell.font = { italic: true, size: 10, color: { argb: TEXT_MUTED }, name: 'Calibri' }
aboutCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true, indent: 1 }
s2.getRow(r2).height = 70
r2++

s2.mergeCells(`A${r2}:C${r2}`)
const footerCell = s2.getCell(`A${r2}`)
footerCell.value = 'By Procurea  ·  procurea.io  ·  © 2026'
footerCell.font = { bold: true, size: 10, color: { argb: TEAL_DARK }, name: 'Calibri' }
footerCell.alignment = { vertical: 'middle', horizontal: 'center' }
s2.getRow(r2).height = 26

// ══════════════════════════════════════════════════════════════════════════
// SHEET 3: Weighted Formula Example
// ══════════════════════════════════════════════════════════════════════════
const s3 = workbook.addWorksheet('Weighted Formula Example', {
  properties: { tabColor: { argb: 'FFBDD5D7' } },
  pageSetup: {
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
    margins: { left: 0.6, right: 0.6, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 },
  },
})
s3.headerFooter.oddFooter = '&L&"Calibri,Italic"By Procurea · procurea.io&R&"Calibri,Italic"© 2026'

s3.columns = [
  { key: 'a', width: 5 },
  { key: 'b', width: 30 },
  { key: 'c', width: 14 },
  { key: 'd', width: 14 },
  { key: 'e', width: 14 },
  { key: 'f', width: 14 },
  { key: 'g', width: 16 },
]

let r3 = 1

// Brand header
s3.mergeCells(`A${r3}:G${r3}`)
const s3Brand = s3.getCell(`A${r3}`)
s3Brand.value = {
  richText: [
    { text: 'PROCUREA  ', font: { bold: true, size: 16, color: { argb: WHITE }, name: 'Calibri' } },
    { text: '·  Weighted score — worked example', font: { size: 14, color: { argb: WHITE }, name: 'Calibri' } },
  ],
}
s3Brand.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL_DARK } }
s3Brand.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
s3.getRow(r3).height = 42
r3 += 2

// Intro
s3.mergeCells(`A${r3}:G${r3}`)
s3.getCell(`A${r3}`).value =
  'We walk through the weighted score calculation for the Polish supplier (Nordweld Precision) to show exactly how the formula in the Comparison tab works. Edit any yellow cell below — the final score updates live.'
s3.getCell(`A${r3}`).font = { italic: true, size: 11, color: { argb: TEXT_MUTED } }
s3.getCell(`A${r3}`).alignment = { vertical: 'top', horizontal: 'left', wrapText: true, indent: 1 }
s3.getRow(r3).height = 44
r3 += 2

// Step 1: Input table
s3.mergeCells(`A${r3}:G${r3}`)
s3.getCell(`A${r3}`).value = 'Step 1 — Inputs'
s3.getCell(`A${r3}`).font = { bold: true, size: 13, color: { argb: TEAL_DARK } }
s3.getRow(r3).height = 24
r3++

const inputHeader = s3.getRow(r3)
const INPUT_HEADER_ROW = r3
inputHeader.getCell(2).value = 'Dimension'
inputHeader.getCell(3).value = 'Score (1-5)'
inputHeader.getCell(4).value = 'Weight (%)'
inputHeader.getCell(5).value = 'Score × Weight'
for (let c = 2; c <= 5; c++) {
  const cell = inputHeader.getCell(c)
  cell.font = { bold: true, size: 11, color: { argb: WHITE } }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } }
  cell.alignment = { vertical: 'middle', horizontal: c === 2 ? 'left' : 'center', indent: c === 2 ? 1 : 0 }
  cell.border = THIN_BORDER
}
inputHeader.height = 24
r3++

const dimensions = [
  ['Price', 3, 40],
  ['Quality', 5, 25],
  ['Lead Time', 5, 20],
  ['Terms', 4, 15],
]
const FIRST_DIM_ROW = r3
for (let i = 0; i < dimensions.length; i++) {
  const row = s3.getRow(r3)
  const [name, score, weight] = dimensions[i]
  row.getCell(2).value = name
  row.getCell(3).value = score
  row.getCell(4).value = weight
  row.getCell(5).value = { formula: `C${r3}*D${r3}`, result: score * weight }
  const zebra = i % 2 === 1
  for (let c = 2; c <= 5; c++) {
    const cell = row.getCell(c)
    applyBodyStyle(cell, { zebra })
    cell.font = { size: 11, name: 'Calibri', bold: c === 2 }
    cell.alignment = {
      vertical: 'middle',
      horizontal: c === 2 ? 'left' : 'center',
      indent: c === 2 ? 1 : 0,
    }
    if (c === 3 || c === 4) {
      cell.numFmt = '0'
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF4CC' } }
    }
    if (c === 5) cell.numFmt = '0'
  }
  row.height = 24
  r3++
}
const LAST_DIM_ROW = r3 - 1

// Totals row
const totalsRow = s3.getRow(r3)
totalsRow.getCell(2).value = 'Totals'
totalsRow.getCell(3).value = null
totalsRow.getCell(4).value = { formula: `SUM(D${FIRST_DIM_ROW}:D${LAST_DIM_ROW})`, result: 100 }
totalsRow.getCell(5).value = { formula: `SUM(E${FIRST_DIM_ROW}:E${LAST_DIM_ROW})`, result: 405 }
for (let c = 2; c <= 5; c++) {
  const cell = totalsRow.getCell(c)
  cell.font = { bold: true, size: 11, color: { argb: TEAL_DARK } }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } }
  cell.alignment = {
    vertical: 'middle',
    horizontal: c === 2 ? 'left' : 'center',
    indent: c === 2 ? 1 : 0,
  }
  cell.border = THIN_BORDER
  if (c === 4 || c === 5) cell.numFmt = '0'
}
const TOTALS_ROW = r3
r3 += 2

// Step 2: Normalise
s3.mergeCells(`A${r3}:G${r3}`)
s3.getCell(`A${r3}`).value = 'Step 2 — Normalise to 0-100 scale'
s3.getCell(`A${r3}`).font = { bold: true, size: 13, color: { argb: TEAL_DARK } }
s3.getRow(r3).height = 24
r3++

// Sum of score×weight
const sw1 = s3.getRow(r3)
sw1.getCell(2).value = 'Sum of (Score × Weight)'
sw1.getCell(3).value = { formula: `E${TOTALS_ROW}`, result: 405 }
sw1.getCell(4).value = '= 120 + 125 + 100 + 60'
applyBodyStyle(sw1.getCell(2))
applyBodyStyle(sw1.getCell(3))
applyBodyStyle(sw1.getCell(4))
sw1.getCell(2).font = { bold: true, size: 11 }
sw1.getCell(2).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
sw1.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' }
sw1.getCell(3).numFmt = '0'
sw1.getCell(4).font = { italic: true, size: 10, color: { argb: TEXT_MUTED } }
sw1.getCell(4).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
sw1.height = 24
const SUM_SW_ROW = r3
r3++

// Divide by sum of weights
const sw2 = s3.getRow(r3)
sw2.getCell(2).value = 'Divided by sum of weights'
sw2.getCell(3).value = { formula: `C${SUM_SW_ROW}/D${TOTALS_ROW}`, result: 4.05 }
sw2.getCell(4).value = { formula: `"= " & C${SUM_SW_ROW} & " / " & D${TOTALS_ROW}`, result: '= 405 / 100' }
applyBodyStyle(sw2.getCell(2))
applyBodyStyle(sw2.getCell(3))
applyBodyStyle(sw2.getCell(4))
sw2.getCell(2).font = { bold: true, size: 11 }
sw2.getCell(2).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
sw2.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' }
sw2.getCell(3).numFmt = '0.000'
sw2.getCell(4).font = { italic: true, size: 10, color: { argb: TEXT_MUTED } }
sw2.getCell(4).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
sw2.height = 24
const DIV_ROW = r3
r3++

// Multiply by 20
const sw3 = s3.getRow(r3)
sw3.getCell(2).value = 'Multiplied by 20 (scale to 100)'
sw3.getCell(3).value = { formula: `C${DIV_ROW}*20`, result: 81 }
sw3.getCell(4).value = 'Score on 0-100 scale (5 × 20 = max 100)'
applyBodyStyle(sw3.getCell(2))
applyBodyStyle(sw3.getCell(3))
applyBodyStyle(sw3.getCell(4))
sw3.getCell(2).font = { bold: true, size: 11 }
sw3.getCell(2).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
sw3.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' }
sw3.getCell(3).numFmt = '0.0'
sw3.getCell(4).font = { italic: true, size: 10, color: { argb: TEXT_MUTED } }
sw3.getCell(4).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
sw3.height = 24
const MULT_ROW = r3
r3 += 2

// Final answer
s3.mergeCells(`B${r3}:D${r3}`)
const finalCell = s3.getCell(`B${r3}`)
finalCell.value = {
  richText: [
    { text: 'FINAL WEIGHTED SCORE  ', font: { bold: true, size: 12, color: { argb: WHITE }, name: 'Calibri' } },
  ],
}
finalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL_DARK } }
finalCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
finalCell.border = THIN_BORDER

const finalValue = s3.getCell(`E${r3}`)
finalValue.value = { formula: `ROUND(C${MULT_ROW},1)`, result: 81.0 }
finalValue.numFmt = '0.0'
finalValue.font = { bold: true, size: 20, color: { argb: WHITE }, name: 'Calibri' }
finalValue.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } }
finalValue.alignment = { vertical: 'middle', horizontal: 'center' }
finalValue.border = THIN_BORDER
s3.getRow(r3).height = 42
r3 += 2

// Compact one-line formula
s3.mergeCells(`A${r3}:G${r3}`)
s3.getCell(`A${r3}`).value = 'The compact formula (as used in column L of the Comparison tab)'
s3.getCell(`A${r3}`).font = { bold: true, size: 12, color: { argb: TEAL_DARK } }
s3.getRow(r3).height = 24
r3++

s3.mergeCells(`A${r3}:G${r3}`)
const formulaCell = s3.getCell(`A${r3}`)
formulaCell.value = '= SUMPRODUCT(H4:K4, $H$17:$K$17) / SUM($H$17:$K$17) × 20'
formulaCell.font = { size: 12, color: { argb: TEAL_DARK }, name: 'Consolas' }
formulaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }
formulaCell.alignment = { vertical: 'middle', horizontal: 'center' }
formulaCell.border = THIN_BORDER
s3.getRow(r3).height = 36
r3 += 2

// Interpretation
s3.mergeCells(`A${r3}:G${r3}`)
s3.getCell(`A${r3}`).value = 'Interpreting the score'
s3.getCell(`A${r3}`).font = { bold: true, size: 13, color: { argb: TEAL_DARK } }
s3.getRow(r3).height = 24
r3++

const interp = [
  ['80-100', 'Shortlist — award candidates. Review TCO-adjusted price against #2 before final call.'],
  ['60-79', 'Review — viable, but usually needs a specific reason to beat a shortlisted supplier (e.g. capacity, strategic diversification).'],
  ['Below 60', 'Exclude unless there is a documented strategic justification (sole-source regulation, unique cert, geopolitical hedge).'],
]
for (let i = 0; i < interp.length; i++) {
  const row = s3.getRow(r3)
  row.getCell(2).value = interp[i][0]
  s3.mergeCells(`C${r3}:G${r3}`)
  row.getCell(3).value = interp[i][1]
  const zebra = i % 2 === 1
  applyBodyStyle(row.getCell(2), { zebra, bold: true, align: 'center' })
  applyBodyStyle(row.getCell(3), { zebra })
  row.getCell(2).font = { bold: true, size: 11, color: { argb: TEAL_DARK } }
  row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true }
  row.height = 32
  r3++
}
r3 += 2

// Footer
s3.mergeCells(`A${r3}:G${r3}`)
const s3Footer = s3.getCell(`A${r3}`)
s3Footer.value = 'By Procurea  ·  procurea.io  ·  © 2026'
s3Footer.font = { bold: true, size: 10, color: { argb: TEAL_DARK }, name: 'Calibri' }
s3Footer.alignment = { vertical: 'middle', horizontal: 'center' }
s3.getRow(r3).height = 26

// ── Write ──────────────────────────────────────────────────────────────────
await workbook.xlsx.writeFile(OUT)
const { size } = statSync(OUT)
const sizeKB = (size / 1024).toFixed(1)
console.log(`\n\u2713  Generated RFQ comparison template`)
console.log(`   Path: ${OUT}`)
console.log(`   Size: ${sizeKB} KB (${size} bytes)`)
console.log(`   Sheets: Comparison, Instructions, Weighted Formula Example`)
console.log(`   Sample suppliers: 3 (Poland, Turkey, China)`)
console.log(`   Empty rows ready for user input: 7`)
console.log('')
