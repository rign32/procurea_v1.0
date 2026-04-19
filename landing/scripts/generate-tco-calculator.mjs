#!/usr/bin/env node
/**
 * Generate the TCO Calculator XLSX lead magnet.
 *
 * Builds a 3-tab workbook:
 *   1. Cost Categories — reference sheet with 10 cost categories + intro
 *   2. Comparison      — the live calculator (5 suppliers × 10 categories, SUM formulas,
 *                        conditional-format winner highlight)
 *   3. Sensitivity     — 10 stress scenarios driven by named ranges and INDEX/MATCH pulls
 *                        from the Comparison tab
 *
 * Usage:
 *   node scripts/generate-tco-calculator.mjs
 */

import ExcelJS from 'exceljs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, statSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'public/resources/downloads/tco-calculator')
const OUT_PATH = join(OUT_DIR, 'tco-calculator.xlsx')

mkdirSync(OUT_DIR, { recursive: true })

// ----- Brand tokens --------------------------------------------------------
const TEAL = 'FF5E8C8F' // Procurea teal
const TEAL_DARK = 'FF3F6366'
const TEAL_LIGHT = 'FFD8E5E6'
const YELLOW_INPUT = 'FFFFF4C7' // light yellow for input cells
const WHITE = 'FFFFFFFF'
const GREEN_WINNER = 'FFB8E0B8' // emerald-ish green for winning TCO
const ZEBRA = 'FFF6F8F8'
const BORDER_GREY = 'FFB8C2C4'

const thin = { style: 'thin', color: { argb: BORDER_GREY } }
const medium = { style: 'medium', color: { argb: TEAL_DARK } }

const fontHeaderWhite = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
const fontTitle = { name: 'Calibri', size: 20, bold: true, color: { argb: TEAL_DARK } }
const fontSubtitle = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FF6B7A7C' } }
const fontBody = { name: 'Calibri', size: 11, color: { argb: 'FF1E2A2B' } }
const fontBold = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1E2A2B' } }
const fontSmall = { name: 'Calibri', size: 10, color: { argb: 'FF6B7A7C' } }

// ----- Workbook ------------------------------------------------------------
const wb = new ExcelJS.Workbook()
wb.creator = 'Procurea'
wb.lastModifiedBy = 'Procurea'
wb.created = new Date()
wb.modified = new Date()
wb.company = 'Procurea'
wb.title = 'TCO Calculator — Beat the Lowest-Price Trap'
wb.subject = 'Total Cost of Ownership Calculator'
wb.keywords = 'TCO, procurement, total cost of ownership, supplier comparison'

// ---------------------------------------------------------------------------
// SHEET 1 — Cost Categories (reference + intro)
// ---------------------------------------------------------------------------
const s1 = wb.addWorksheet('Cost Categories', {
  views: [{ state: 'frozen', ySplit: 9, xSplit: 1 }],
  pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
})

s1.columns = [
  { width: 30 },
  { width: 48 },
  { width: 36 },
  { width: 18 },
  { width: 14 },
]

// Brand bar
s1.mergeCells('A1:E1')
s1.getCell('A1').value = 'PROCUREA  ·  TCO Calculator'
s1.getCell('A1').font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
s1.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } }
s1.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
s1.getRow(1).height = 26

// Title
s1.mergeCells('A2:E2')
s1.getCell('A2').value = 'Beat the Lowest-Price Trap'
s1.getCell('A2').font = fontTitle
s1.getRow(2).height = 30

// Intro paragraph
s1.mergeCells('A3:E6')
s1.getCell('A3').value =
  'Total Cost of Ownership (TCO) reveals what a supplier really costs you — not just the unit price on the quote, ' +
  'but freight, duties, CBAM, carrying cost on extended lead times, quality failures, payment-terms drag, tooling amortisation, ' +
  'single-source risk premium and FX hedging. In ~60% of cross-border sourcing decisions the cheapest unit price is NOT the cheapest TCO. ' +
  'Use this workbook to quantify that gap. Edit yellow cells only — white cells are formulas.'
s1.getCell('A3').font = fontBody
s1.getCell('A3').alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
s1.getRow(3).height = 18
s1.getRow(4).height = 18
s1.getRow(5).height = 18
s1.getRow(6).height = 18

// Published by
s1.mergeCells('A7:E7')
s1.getCell('A7').value =
  'Maintained by Procurea (procurea.io). Published April 2026 — revised quarterly as assumptions (CBAM, WACC, carrying rates) evolve.'
s1.getCell('A7').font = fontSmall
s1.getCell('A7').alignment = { vertical: 'middle', horizontal: 'left' }
s1.getRow(7).height = 18

// Spacer
s1.getRow(8).height = 8

// Table header row (row 9)
const s1Header = ['Category', 'Description', 'Default Calculation Basis', 'Example Value (EUR/unit)', 'Typical % of TCO']
s1.getRow(9).values = s1Header
s1.getRow(9).eachCell((cell) => {
  cell.font = fontHeaderWhite
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } }
  cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 }
  cell.border = { top: medium, bottom: medium, left: thin, right: thin }
})
s1.getRow(9).height = 28

// The 10 cost categories
const categories = [
  {
    name: 'Unit Price',
    desc: 'Base price quoted by supplier per unit. Normalize all quotes to EUR using spot rate on quote date + FX buffer for volatile currencies.',
    basis: 'Direct from quote (normalized to EUR)',
    example: 8.95,
    pct: 0.77,
  },
  {
    name: 'Freight Inbound',
    desc: 'Cost to move goods from supplier FCA/FOB point to your receiving dock. Include demurrage allowance 2-4% for sea freight.',
    basis: 'Total shipping cost / units shipped',
    example: 0.75,
    pct: 0.065,
  },
  {
    name: 'Duties & Tariffs',
    desc: 'Customs duties applied at country of entry (HTS/CN code). Verify with customs broker. Section 301 / anti-dumping adds significantly for covered categories.',
    basis: 'HTS rate × declared value',
    example: 0.54,
    pct: 0.045,
  },
  {
    name: 'CBAM Adjustment',
    desc: 'EU Carbon Border Adjustment Mechanism for imports of iron/steel, aluminium, cement, fertilisers, electricity, hydrogen from non-EU origin.',
    basis: 'Embedded CO2 × CBAM certificate price (€30-50/t CO2 in 2026)',
    example: 0.42,
    pct: 0.036,
  },
  {
    name: 'Inventory Carrying Cost',
    desc: 'Cost of holding inventory during extended lead time (capital + storage + insurance + obsolescence). 18-25% annual is typical.',
    basis: 'Unit price × carrying rate × (lead time days / 365)',
    example: 0.31,
    pct: 0.027,
  },
  {
    name: 'Defect / Quality Cost',
    desc: 'Cost of quality failures: rework, scrap, customer returns. Rework multiplier: 3× for reworkable, 10× for scrap, 30× for field-failure recall.',
    basis: '(PPM / 1,000,000) × rework multiplier × unit price',
    example: 0.13,
    pct: 0.011,
  },
  {
    name: 'Payment Terms Cost',
    desc: 'Cost of capital implication when supplier terms differ from your target. Positive if you accept shorter terms than target.',
    basis: '((Target terms − Actual terms) / 365) × unit price × WACC',
    example: 0.09,
    pct: 0.008,
  },
  {
    name: 'Switching / Tooling Amortization',
    desc: 'One-time cost of changing supplier spread over first-year volume. Set to 0 if tooling is already amortised with incumbent.',
    basis: '(Tooling + audit + qualification labour) / first-year units',
    example: 0.18,
    pct: 0.015,
  },
  {
    name: 'Risk Premium (Single-Source)',
    desc: 'Implicit cost of no dual-source option. Ask: if this supplier failed next quarter, what is your 90-day fallback cost?',
    basis: 'Unit price × (0-5%) depending on single-source exposure',
    example: 0.22,
    pct: 0.019,
  },
  {
    name: 'Currency Hedging Cost',
    desc: 'Cost of forward contracts / options to lock FX rate. Standard practice: hedge 50-70% of exposure for non-EUR quotes over €250k.',
    basis: '≈ 0.5-1.5% of contract value for 12-month hedge',
    example: 0.05,
    pct: 0.004,
  },
]

categories.forEach((c, i) => {
  const rowIdx = 10 + i
  const row = s1.getRow(rowIdx)
  row.values = [c.name, c.desc, c.basis, c.example, c.pct]
  row.height = 42
  row.getCell(1).font = fontBold
  row.getCell(2).font = fontBody
  row.getCell(3).font = fontBody
  row.getCell(4).font = fontBody
  row.getCell(5).font = fontBody
  row.getCell(4).numFmt = '€#,##0.00'
  row.getCell(5).numFmt = '0.0%'
  row.eachCell((cell, colNumber) => {
    cell.alignment = {
      vertical: 'middle',
      horizontal: colNumber >= 4 ? 'right' : 'left',
      wrapText: true,
      indent: colNumber >= 4 ? 0 : 1,
    }
    cell.border = { top: thin, bottom: thin, left: thin, right: thin }
    if (i % 2 === 1) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } }
    }
  })
})

// Totals row
const totalsRow = 10 + categories.length
s1.getRow(totalsRow).values = [
  'Total TCO per unit',
  'Sum of all categories above — the true cost you pay the supplier over the life of the commitment.',
  '= SUM(categories)',
  { formula: `SUM(D10:D${totalsRow - 1})` },
  { formula: `SUM(E10:E${totalsRow - 1})` },
]
s1.getRow(totalsRow).height = 28
s1.getRow(totalsRow).eachCell((cell, colNumber) => {
  cell.font = { ...fontBold, color: { argb: 'FFFFFFFF' } }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL_DARK } }
  cell.alignment = {
    vertical: 'middle',
    horizontal: colNumber >= 4 ? 'right' : 'left',
    wrapText: true,
    indent: colNumber >= 4 ? 0 : 1,
  }
  cell.border = { top: medium, bottom: medium, left: thin, right: thin }
})
s1.getCell(`D${totalsRow}`).numFmt = '€#,##0.00'
s1.getCell(`E${totalsRow}`).numFmt = '0.0%'

// How to use note
const noteRow = totalsRow + 2
s1.mergeCells(`A${noteRow}:E${noteRow + 1}`)
s1.getCell(`A${noteRow}`).value =
  'How to use: Open the Comparison tab to compare up to 5 suppliers side-by-side. Edit yellow cells. ' +
  'Open the Sensitivity tab to stress-test the winner against FX shocks, tariffs, CBAM escalation, Red Sea disruption and quality cost hits.'
s1.getCell(`A${noteRow}`).font = fontSubtitle
s1.getCell(`A${noteRow}`).alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
s1.getRow(noteRow).height = 20
s1.getRow(noteRow + 1).height = 20

// ---------------------------------------------------------------------------
// SHEET 2 — Comparison (the calculator)
// ---------------------------------------------------------------------------
const s2 = wb.addWorksheet('Comparison', {
  views: [{ state: 'frozen', ySplit: 6, xSplit: 3 }],
  pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
})

s2.columns = [
  { width: 36 }, // A: category
  { width: 12 }, // B: unit
  { width: 10 }, // C: ref/typical
  { width: 14 }, // D: China
  { width: 14 }, // E: Turkey
  { width: 14 }, // F: Poland
  { width: 14 }, // G: Portugal
  { width: 14 }, // H: Romania
]

// Brand bar
s2.mergeCells('A1:H1')
s2.getCell('A1').value = 'PROCUREA  ·  Supplier TCO Comparison'
s2.getCell('A1').font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
s2.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } }
s2.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
s2.getRow(1).height = 26

// Scenario description
s2.mergeCells('A2:H2')
s2.getCell('A2').value =
  'Scenario: 50,000 units/year of a machined metal component. Yellow cells = editable inputs. White cells = read-only formulas.'
s2.getCell('A2').font = fontSubtitle
s2.getCell('A2').alignment = { vertical: 'middle', horizontal: 'left' }
s2.getRow(2).height = 22

// Legend
s2.getCell('A3').value = 'Input (edit)'
s2.getCell('A3').font = fontSmall
s2.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: YELLOW_INPUT } }
s2.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' }
s2.getCell('A3').border = { top: thin, bottom: thin, left: thin, right: thin }

s2.getCell('B3').value = 'Formula'
s2.getCell('B3').font = fontSmall
s2.getCell('B3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } }
s2.getCell('B3').alignment = { vertical: 'middle', horizontal: 'center' }
s2.getCell('B3').border = { top: thin, bottom: thin, left: thin, right: thin }

s2.getCell('C3').value = 'Winner'
s2.getCell('C3').font = { ...fontSmall, bold: true }
s2.getCell('C3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_WINNER } }
s2.getCell('C3').alignment = { vertical: 'middle', horizontal: 'center' }
s2.getCell('C3').border = { top: thin, bottom: thin, left: thin, right: thin }

s2.getRow(3).height = 18

// Spacer
s2.getRow(4).height = 8

// Supplier header row (row 5)
s2.getCell('A5').value = 'Cost Category'
s2.getCell('B5').value = 'Unit'
s2.getCell('C5').value = 'Ref.'
s2.getCell('D5').value = 'Supplier A\nChina'
s2.getCell('E5').value = 'Supplier B\nTurkey'
s2.getCell('F5').value = 'Supplier C\nPoland'
s2.getCell('G5').value = 'Supplier D\nPortugal'
s2.getCell('H5').value = 'Supplier E\nRomania'
s2.getRow(5).height = 36
s2.getRow(5).eachCell((cell) => {
  cell.font = fontHeaderWhite
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } }
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
  cell.border = { top: medium, bottom: medium, left: thin, right: thin }
})
// left-align label column
s2.getCell('A5').alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }

// Spacer
s2.getRow(6).height = 6

// Cost category rows (rows 7..16)
// [label, unit, China, Turkey, Poland, Portugal, Romania]
const costRows = [
  ['Unit Price',                              'EUR/unit', 8.95, 10.80, 12.40, 11.75, 11.20],
  ['Freight Inbound',                         'EUR/unit', 0.75, 0.28, 0.12, 0.22, 0.19],
  ['Duties & Tariffs',                        'EUR/unit', 0.54, 0.00, 0.00, 0.00, 0.00],
  ['CBAM Adjustment',                         'EUR/unit', 0.42, 0.18, 0.00, 0.00, 0.00],
  ['Inventory Carrying Cost',                 'EUR/unit', 0.31, 0.14, 0.08, 0.12, 0.11],
  ['Defect / Quality Cost',                   'EUR/unit', 0.13, 0.08, 0.05, 0.06, 0.07],
  ['Payment Terms Cost',                      'EUR/unit', 0.09, 0.04, 0.00, 0.02, 0.03],
  ['Switching / Tooling Amortization',        'EUR/unit', 0.18, 0.18, 0.18, 0.18, 0.18],
  ['Risk Premium (Single-Source)',            'EUR/unit', 0.22, 0.11, 0.00, 0.08, 0.10],
  ['Currency Hedging Cost',                   'EUR/unit', 0.05, 0.08, 0.00, 0.00, 0.00],
]

const FIRST_COST_ROW = 7
const LAST_COST_ROW = FIRST_COST_ROW + costRows.length - 1 // 16
costRows.forEach((r, i) => {
  const rowIdx = FIRST_COST_ROW + i
  const row = s2.getRow(rowIdx)
  row.values = [r[0], r[1], '', r[2], r[3], r[4], r[5], r[6]]
  row.height = 20
  // Labels
  row.getCell(1).font = fontBody
  row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  row.getCell(2).font = fontSmall
  row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' }
  row.getCell(3).font = fontSmall
  row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' }
  // Supplier cells (D..H) — editable yellow inputs
  for (let col = 4; col <= 8; col++) {
    const cell = row.getCell(col)
    cell.numFmt = '€#,##0.00'
    cell.font = fontBody
    cell.alignment = { vertical: 'middle', horizontal: 'right' }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: YELLOW_INPUT } }
    cell.border = { top: thin, bottom: thin, left: thin, right: thin }
  }
  // Label + unit borders
  row.getCell(1).border = { top: thin, bottom: thin, left: thin, right: thin }
  row.getCell(2).border = { top: thin, bottom: thin, left: thin, right: thin }
  row.getCell(3).border = { top: thin, bottom: thin, left: thin, right: thin }
  if (i % 2 === 1) {
    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } }
    row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } }
    row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } }
  }
})

// Totals row (row 17)
const TOTAL_ROW = LAST_COST_ROW + 1 // 17
const totalRow = s2.getRow(TOTAL_ROW)
totalRow.getCell(1).value = 'TOTAL TCO per Unit'
totalRow.getCell(2).value = 'EUR/unit'
totalRow.getCell(3).value = ''
for (let col = 4; col <= 8; col++) {
  const colLetter = String.fromCharCode(64 + col)
  totalRow.getCell(col).value = {
    formula: `SUM(${colLetter}${FIRST_COST_ROW}:${colLetter}${LAST_COST_ROW})`,
  }
  totalRow.getCell(col).numFmt = '€#,##0.00'
}
totalRow.height = 26
totalRow.eachCell((cell) => {
  cell.font = { ...fontBold, color: { argb: 'FFFFFFFF' } }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL_DARK } }
  cell.alignment = { vertical: 'middle', horizontal: 'right' }
  cell.border = { top: medium, bottom: medium, left: thin, right: thin }
})
totalRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }

// Delta vs Unit Price (row 18)
const DELTA_ROW = TOTAL_ROW + 1
const deltaRow = s2.getRow(DELTA_ROW)
deltaRow.getCell(1).value = 'Delta vs Unit Price (%)'
deltaRow.getCell(2).value = '%'
for (let col = 4; col <= 8; col++) {
  const colLetter = String.fromCharCode(64 + col)
  deltaRow.getCell(col).value = {
    formula: `(${colLetter}${TOTAL_ROW}-${colLetter}${FIRST_COST_ROW})/${colLetter}${FIRST_COST_ROW}`,
  }
  deltaRow.getCell(col).numFmt = '0.0%'
}
deltaRow.height = 20
deltaRow.eachCell((cell) => {
  cell.font = fontBold
  cell.alignment = { vertical: 'middle', horizontal: 'right' }
  cell.border = { top: thin, bottom: thin, left: thin, right: thin }
})
deltaRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }

// Annual demand (row 19) — input
const DEMAND_ROW = DELTA_ROW + 1
const demandRow = s2.getRow(DEMAND_ROW)
demandRow.getCell(1).value = 'Annual Demand (units)'
demandRow.getCell(2).value = 'units'
for (let col = 4; col <= 8; col++) {
  demandRow.getCell(col).value = 50000
  demandRow.getCell(col).numFmt = '#,##0'
  demandRow.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: YELLOW_INPUT } }
  demandRow.getCell(col).border = { top: thin, bottom: thin, left: thin, right: thin }
  demandRow.getCell(col).alignment = { vertical: 'middle', horizontal: 'right' }
}
demandRow.getCell(1).font = fontBody
demandRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
demandRow.getCell(1).border = { top: thin, bottom: thin, left: thin, right: thin }
demandRow.getCell(2).font = fontSmall
demandRow.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' }
demandRow.getCell(2).border = { top: thin, bottom: thin, left: thin, right: thin }
demandRow.height = 20

// Annual TCO (row 20) — formula = demand × TCO
const ANNUAL_ROW = DEMAND_ROW + 1
const annualRow = s2.getRow(ANNUAL_ROW)
annualRow.getCell(1).value = 'Annual TCO (EUR)'
annualRow.getCell(2).value = 'EUR/yr'
for (let col = 4; col <= 8; col++) {
  const colLetter = String.fromCharCode(64 + col)
  annualRow.getCell(col).value = {
    formula: `${colLetter}${DEMAND_ROW}*${colLetter}${TOTAL_ROW}`,
  }
  annualRow.getCell(col).numFmt = '€#,##0'
  annualRow.getCell(col).alignment = { vertical: 'middle', horizontal: 'right' }
  annualRow.getCell(col).border = { top: thin, bottom: thin, left: thin, right: thin }
}
annualRow.getCell(1).font = fontBold
annualRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
annualRow.getCell(1).border = { top: thin, bottom: thin, left: thin, right: thin }
annualRow.getCell(2).font = fontSmall
annualRow.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' }
annualRow.getCell(2).border = { top: thin, bottom: thin, left: thin, right: thin }
annualRow.height = 22

// Lead time (row 21) — input
const LEAD_ROW = ANNUAL_ROW + 1
const leadRow = s2.getRow(LEAD_ROW)
leadRow.getCell(1).value = 'Lead Time (days)'
leadRow.getCell(2).value = 'days'
const leadTimes = [56, 28, 21, 30, 25]
for (let col = 4; col <= 8; col++) {
  leadRow.getCell(col).value = leadTimes[col - 4]
  leadRow.getCell(col).numFmt = '0'
  leadRow.getCell(col).alignment = { vertical: 'middle', horizontal: 'right' }
  leadRow.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: YELLOW_INPUT } }
  leadRow.getCell(col).border = { top: thin, bottom: thin, left: thin, right: thin }
}
leadRow.getCell(1).font = fontBody
leadRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
leadRow.getCell(1).border = { top: thin, bottom: thin, left: thin, right: thin }
leadRow.getCell(2).font = fontSmall
leadRow.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' }
leadRow.getCell(2).border = { top: thin, bottom: thin, left: thin, right: thin }
leadRow.height = 20

// Rank (row 22) — formula
const RANK_ROW = LEAD_ROW + 1
const rankRow = s2.getRow(RANK_ROW)
rankRow.getCell(1).value = 'Rank by TCO (1 = best)'
rankRow.getCell(2).value = '#'
for (let col = 4; col <= 8; col++) {
  const colLetter = String.fromCharCode(64 + col)
  rankRow.getCell(col).value = {
    formula: `RANK(${colLetter}${TOTAL_ROW},$D$${TOTAL_ROW}:$H$${TOTAL_ROW},1)`,
  }
  rankRow.getCell(col).numFmt = '0'
  rankRow.getCell(col).alignment = { vertical: 'middle', horizontal: 'center' }
  rankRow.getCell(col).border = { top: thin, bottom: thin, left: thin, right: thin }
  rankRow.getCell(col).font = fontBold
}
rankRow.getCell(1).font = fontBold
rankRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
rankRow.getCell(1).border = { top: thin, bottom: thin, left: thin, right: thin }
rankRow.getCell(2).font = fontSmall
rankRow.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' }
rankRow.getCell(2).border = { top: thin, bottom: thin, left: thin, right: thin }
rankRow.height = 22

// Conditional formatting — highlight minimum TOTAL TCO cell green + bold
s2.addConditionalFormatting({
  ref: `D${TOTAL_ROW}:H${TOTAL_ROW}`,
  rules: [
    {
      type: 'cellIs',
      operator: 'equal',
      priority: 1,
      formulae: [`MIN($D$${TOTAL_ROW}:$H$${TOTAL_ROW})`],
      style: {
        font: { bold: true, color: { argb: 'FF1E2A2B' } },
        fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: GREEN_WINNER } },
      },
    },
  ],
})

// Also highlight the winning Annual TCO (same supplier)
s2.addConditionalFormatting({
  ref: `D${ANNUAL_ROW}:H${ANNUAL_ROW}`,
  rules: [
    {
      type: 'cellIs',
      operator: 'equal',
      priority: 1,
      formulae: [`MIN($D$${ANNUAL_ROW}:$H$${ANNUAL_ROW})`],
      style: {
        font: { bold: true, color: { argb: 'FF1E2A2B' } },
        fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: GREEN_WINNER } },
      },
    },
  ],
})

// Highlight rank 1
s2.addConditionalFormatting({
  ref: `D${RANK_ROW}:H${RANK_ROW}`,
  rules: [
    {
      type: 'cellIs',
      operator: 'equal',
      priority: 1,
      formulae: [1],
      style: {
        font: { bold: true, color: { argb: 'FF1E2A2B' } },
        fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: GREEN_WINNER } },
      },
    },
  ],
})

// Bold border around the input zone (D7:H16 + demand/lead inputs)
const inputRanges = [
  [FIRST_COST_ROW, LAST_COST_ROW, 4, 8],
  [DEMAND_ROW, DEMAND_ROW, 4, 8],
  [LEAD_ROW, LEAD_ROW, 4, 8],
]
inputRanges.forEach(([r1, r2, c1, c2]) => {
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      const cell = s2.getRow(r).getCell(c)
      const border = { ...(cell.border || {}) }
      if (r === r1) border.top = medium
      if (r === r2) border.bottom = medium
      if (c === c1) border.left = medium
      if (c === c2) border.right = medium
      cell.border = border
    }
  }
})

// Footer note
const FOOTER_ROW = RANK_ROW + 2
s2.mergeCells(`A${FOOTER_ROW}:H${FOOTER_ROW + 2}`)
s2.getCell(`A${FOOTER_ROW}`).value =
  'Reading: Supplier A (China) wins on unit price by ~28% (€8.95 vs ~€11.85 avg for Europe), but loses on TCO to the runner-up by a thin margin. ' +
  'Any single 2026 stressor (Red Sea, USD +5%, CBAM escalation) flips the ranking. See the Sensitivity tab to test it. ' +
  'Rule of thumb: if your TCO winner only beats the runner-up by <3%, the decision is FRAGILE — run Sensitivity before signing.'
s2.getCell(`A${FOOTER_ROW}`).font = fontSubtitle
s2.getCell(`A${FOOTER_ROW}`).alignment = { vertical: 'top', horizontal: 'left', wrapText: true }
s2.getRow(FOOTER_ROW).height = 18
s2.getRow(FOOTER_ROW + 1).height = 18
s2.getRow(FOOTER_ROW + 2).height = 18

// ---------------------------------------------------------------------------
// SHEET 3 — Sensitivity Analysis
// ---------------------------------------------------------------------------
const s3 = wb.addWorksheet('Sensitivity', {
  views: [{ state: 'frozen', ySplit: 12, xSplit: 1 }],
  pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
})

s3.columns = [
  { width: 42 }, // A: scenario
  { width: 12 }, // B: FX
  { width: 14 }, // C: lead time
  { width: 16 }, // D: tariff adj
  { width: 14 }, // E: CBAM adj
  { width: 14 }, // F: China TCO
  { width: 14 }, // G: Turkey TCO
  { width: 14 }, // H: Poland TCO
  { width: 16 }, // I: Winner
  { width: 40 }, // J: Note
]

// Brand bar
s3.mergeCells('A1:J1')
s3.getCell('A1').value = 'PROCUREA  ·  Sensitivity Analysis'
s3.getCell('A1').font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
s3.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } }
s3.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
s3.getRow(1).height = 26

s3.mergeCells('A2:J2')
s3.getCell('A2').value =
  'Edit the yellow base-rate cells below — all scenarios recalculate. Scenarios multiply the stressor on top of Comparison tab values.'
s3.getCell('A2').font = fontSubtitle
s3.getCell('A2').alignment = { vertical: 'middle', horizontal: 'left' }
s3.getRow(2).height = 22

// ----- Base rates block (rows 3..6) ----------------------------------------
// We will set named ranges here for editability.
s3.getCell('A3').value = 'Base rate'
s3.getCell('B3').value = 'Value'
s3.getCell('C3').value = 'Notes'
s3.mergeCells('C3:J3')
s3.getRow(3).eachCell((cell) => {
  cell.font = fontHeaderWhite
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL_DARK } }
  cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  cell.border = { top: thin, bottom: thin, left: thin, right: thin }
})
s3.getRow(3).height = 22

const baseRates = [
  ['FX_rate',        'USD/EUR spot (affects China quote)', 1.08, 'Default: 1.08. Stress up (+5% / +10%) to see USD strengthening effect on China quote.'],
  ['CBAM_per_tonne', 'CBAM certificate price €/tonne CO2', 60,   'Default: €60/t. 2026 forecast range €30-75/t. Applies to iron/steel imports from non-EU origin.'],
  ['Tariff_rate',    'Tariff rate on China origin (%)',     0.06, 'Default: 6% MFN. Stress +15% (Section 301 expansion) or +25% (punitive).'],
  ['WACC',           'Cost of capital (WACC)',              0.08, 'Default: 8%. Finance team typically uses 6-12%.'],
]

baseRates.forEach((r, i) => {
  const rowIdx = 4 + i
  const row = s3.getRow(rowIdx)
  row.getCell(1).value = r[1]
  row.getCell(2).value = r[2]
  s3.mergeCells(`C${rowIdx}:J${rowIdx}`)
  row.getCell(3).value = r[3]

  row.getCell(1).font = fontBody
  row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  row.getCell(1).border = { top: thin, bottom: thin, left: thin, right: thin }

  row.getCell(2).font = fontBold
  row.getCell(2).alignment = { vertical: 'middle', horizontal: 'right' }
  row.getCell(2).border = { top: medium, bottom: medium, left: medium, right: medium }
  row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: YELLOW_INPUT } }
  // number formats
  if (r[0] === 'FX_rate') row.getCell(2).numFmt = '0.0000'
  if (r[0] === 'CBAM_per_tonne') row.getCell(2).numFmt = '€#,##0'
  if (r[0] === 'Tariff_rate' || r[0] === 'WACC') row.getCell(2).numFmt = '0.00%'

  row.getCell(3).font = fontSmall
  row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 }
  row.getCell(3).border = { top: thin, bottom: thin, left: thin, right: thin }
  row.height = 22

  // Named range
  wb.definedNames.add(`Sensitivity!$B$${rowIdx}`, r[0])
})

// Spacer
s3.getRow(8).height = 10

// ----- Baseline TCOs pulled from Comparison tab (rows 9..10) --------------
// Using named references to make sensitivity formulas readable.
s3.getCell('A9').value = 'Baseline TCOs (from Comparison tab)'
s3.getCell('A9').font = { ...fontBold, color: { argb: 'FFFFFFFF' } }
s3.getCell('A9').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL_DARK } }
s3.getCell('A9').alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
s3.mergeCells('A9:J9')
s3.getRow(9).height = 22

// Row 10: baseline values
s3.getCell('A10').value = 'Baseline (no stress)'
s3.getCell('A10').font = fontBold
s3.getCell('A10').alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
s3.getCell('A10').border = { top: thin, bottom: thin, left: thin, right: thin }

// Pull Unit Price, Duties, CBAM, Carrying, Total etc from Comparison tab for
// clarity AND easier formulas. We define named ranges for each supplier's
// unit price and total.
const SUPPLIER_COLS = { China: 'D', Turkey: 'E', Poland: 'F' }
// Define named ranges on Comparison tab
const compRef = (col, row) => `Comparison!$${col}$${row}`
wb.definedNames.add(compRef('D', FIRST_COST_ROW), 'China_UnitPrice')
wb.definedNames.add(compRef('E', FIRST_COST_ROW), 'Turkey_UnitPrice')
wb.definedNames.add(compRef('F', FIRST_COST_ROW), 'Poland_UnitPrice')
wb.definedNames.add(compRef('D', FIRST_COST_ROW + 2), 'China_Duties')
wb.definedNames.add(compRef('E', FIRST_COST_ROW + 2), 'Turkey_Duties')
wb.definedNames.add(compRef('D', FIRST_COST_ROW + 3), 'China_CBAM')
wb.definedNames.add(compRef('E', FIRST_COST_ROW + 3), 'Turkey_CBAM')
wb.definedNames.add(compRef('D', FIRST_COST_ROW + 4), 'China_Carrying')
wb.definedNames.add(compRef('E', FIRST_COST_ROW + 4), 'Turkey_Carrying')
wb.definedNames.add(compRef('F', FIRST_COST_ROW + 4), 'Poland_Carrying')
wb.definedNames.add(compRef('D', FIRST_COST_ROW + 5), 'China_Quality')
wb.definedNames.add(compRef('E', FIRST_COST_ROW + 5), 'Turkey_Quality')
wb.definedNames.add(compRef('F', FIRST_COST_ROW + 5), 'Poland_Quality')
wb.definedNames.add(compRef('D', TOTAL_ROW), 'China_TCO')
wb.definedNames.add(compRef('E', TOTAL_ROW), 'Turkey_TCO')
wb.definedNames.add(compRef('F', TOTAL_ROW), 'Poland_TCO')

// Sensitivity table header (row 12)
const S_HEADER_ROW = 12
s3.getCell(`A${S_HEADER_ROW}`).value = 'Scenario'
s3.getCell(`B${S_HEADER_ROW}`).value = 'FX shift'
s3.getCell(`C${S_HEADER_ROW}`).value = 'Lead Δ (d)'
s3.getCell(`D${S_HEADER_ROW}`).value = 'Tariff +'
s3.getCell(`E${S_HEADER_ROW}`).value = 'CBAM ×'
s3.getCell(`F${S_HEADER_ROW}`).value = 'China TCO'
s3.getCell(`G${S_HEADER_ROW}`).value = 'Turkey TCO'
s3.getCell(`H${S_HEADER_ROW}`).value = 'Poland TCO'
s3.getCell(`I${S_HEADER_ROW}`).value = 'Winner'
s3.getCell(`J${S_HEADER_ROW}`).value = 'Note'
s3.getRow(S_HEADER_ROW).eachCell((cell) => {
  cell.font = fontHeaderWhite
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } }
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
  cell.border = { top: medium, bottom: medium, left: thin, right: thin }
})
s3.getCell(`A${S_HEADER_ROW}`).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
s3.getCell(`J${S_HEADER_ROW}`).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
s3.getRow(S_HEADER_ROW).height = 30

// Scenarios (10)
// Column layout: A name | B FX delta | C lead delta days | D tariff delta | E CBAM multiplier | F..H formulas | I winner | J note
//
// Formula structure for each scenario's TCOs:
// China TCO  = China_TCO
//   + China_UnitPrice * FX_delta                      (USD strengthening makes quote more expensive)
//   + China_UnitPrice * tariff_delta                  (extra tariff)
//   + China_CBAM * (cbam_mult - 1)                    (CBAM escalation)
//   + China_UnitPrice * 0.20 * (lead_delta/365)       (extra carrying for extended lead)
//   + China_Quality * quality_mult_extra              (quality stress - not in every scenario)
//
// Turkey TCO = Turkey_TCO + Turkey_CBAM*(cbam_mult-1) + Turkey_UnitPrice*tryFX
// Poland TCO = Poland_TCO (EU, no FX/tariff/CBAM exposure)
// Lead delta is China-only for Red Sea scenarios.

const scenarios = [
  {
    name: 'Baseline',
    fx: 0, lead: 0, tariff: 0, cbam: 1, qualityMult: 1, tryFx: 0,
    note: 'Baseline assumptions. Starting reference for all other scenarios.',
  },
  {
    name: 'USD strengthens +5% (China)',
    fx: 0.05, lead: 0, tariff: 0, cbam: 1, qualityMult: 1, tryFx: 0,
    note: 'USD +5% makes China EUR-equivalent quote more expensive. Typical quarterly FX move.',
  },
  {
    name: 'USD strengthens +10% (China)',
    fx: 0.10, lead: 0, tariff: 0, cbam: 1, qualityMult: 1, tryFx: 0,
    note: 'Decisive FX move — flips ranking if China had a slim TCO lead.',
  },
  {
    name: 'TRY weakens -15% (Turkey wins)',
    fx: 0, lead: 0, tariff: 0, cbam: 1, qualityMult: 1, tryFx: -0.05,
    note: 'TRY volatility is structural. EUR-quoted Turkish suppliers often cut price 3-5% after local devaluation.',
  },
  {
    name: 'Red Sea +14d (China lead time)',
    fx: 0, lead: 14, tariff: 0, cbam: 1, qualityMult: 1, tryFx: 0,
    note: 'Extended sea routing around Africa adds 14 days + carrying cost. Turkey remains 28d.',
  },
  {
    name: 'Compound: Red Sea + USD +5%',
    fx: 0.05, lead: 14, tariff: 0, cbam: 1, qualityMult: 1, tryFx: 0,
    note: 'Two likely 2026 stressors stacked. Compound effects typically flip rankings decisively.',
  },
  {
    name: 'Tariff shock +15% (Section 301 expansion)',
    fx: 0, lead: 0, tariff: 0.15, cbam: 1, qualityMult: 1, tryFx: 0,
    note: 'Hypothetical +15% tariff on China-origin for US buyers. Poland becomes defensible winner.',
  },
  {
    name: 'Tariff shock +25% (punitive)',
    fx: 0, lead: 0, tariff: 0.25, cbam: 1, qualityMult: 1, tryFx: 0,
    note: 'Punitive tariff scenario. All non-EU options become uncompetitive.',
  },
  {
    name: 'CBAM steps up to €75/tonne',
    fx: 0, lead: 0, tariff: 0, cbam: 1.25, qualityMult: 1, tryFx: 0,
    note: 'CBAM escalation from €60 → €75/t. Squeezes Chinese and Turkish steel imports equally.',
  },
  {
    name: 'Freight spike +50% (China)',
    fx: 0, lead: 0, tariff: 0, cbam: 1, qualityMult: 1, tryFx: 0, freightMult: 1.5,
    note: 'Container rate spike — Q4 2024 levels. China FOB freight grows 50% while nearshore stays flat.',
  },
  {
    name: 'Quality cost +20% (China)',
    fx: 0, lead: 0, tariff: 0, cbam: 1, qualityMult: 1.2, tryFx: 0,
    note: 'China quality escalation after PPM drift. +20% on defect cost line.',
  },
  {
    name: 'Quality cost +40% (China)',
    fx: 0, lead: 0, tariff: 0, cbam: 1, qualityMult: 1.4, tryFx: 0,
    note: 'Severe quality crisis: multiple field returns. China defect cost +40%.',
  },
  {
    name: 'All-in bad case (Red Sea + USD +10% + CBAM €75)',
    fx: 0.10, lead: 14, tariff: 0, cbam: 1.25, qualityMult: 1, tryFx: 0,
    note: 'Realistic worst case combining the three most likely 2026 stressors.',
  },
]

const S_FIRST_ROW = S_HEADER_ROW + 1
scenarios.forEach((sc, i) => {
  const r = S_FIRST_ROW + i
  const row = s3.getRow(r)
  row.getCell(1).value = sc.name
  row.getCell(2).value = sc.fx
  row.getCell(3).value = sc.lead
  row.getCell(4).value = sc.tariff
  row.getCell(5).value = sc.cbam

  // China TCO formula
  const freightMultiplier = sc.freightMult ?? 1
  const freightExtra = freightMultiplier !== 1
    ? `+${compRef('D', FIRST_COST_ROW + 1)}*${freightMultiplier - 1}`
    : ''
  row.getCell(6).value = {
    formula:
      `China_TCO` +
      ` + China_UnitPrice*B${r}` +
      ` + China_UnitPrice*D${r}` +
      ` + China_CBAM*(E${r}-1)` +
      ` + China_UnitPrice*0.20*(C${r}/365)` +
      ` + China_Quality*(${sc.qualityMult ?? 1}-1)` +
      freightExtra,
  }

  // Turkey TCO formula — TRY FX affects Turkey unit price; CBAM escalation hits Turkey too
  row.getCell(7).value = {
    formula:
      `Turkey_TCO` +
      ` + Turkey_UnitPrice*${sc.tryFx}` +
      ` + Turkey_CBAM*(E${r}-1)`,
  }

  // Poland TCO formula — pure EU, only CBAM escalation affects it marginally (0 baseline, so 0 anyway).
  row.getCell(8).value = { formula: `Poland_TCO` }

  // Winner — INDEX/MATCH on min of F..H
  row.getCell(9).value = {
    formula: `INDEX({"China","Turkey","Poland"},MATCH(MIN(F${r}:H${r}),F${r}:H${r},0))`,
  }

  row.getCell(10).value = sc.note

  // Styling
  row.height = 22
  row.getCell(1).font = fontBody
  row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true }

  // Stressor cells
  row.getCell(2).numFmt = '+0.0%;-0.0%;0%'
  row.getCell(3).numFmt = '+0;-0;0'
  row.getCell(4).numFmt = '+0.0%;-0.0%;0%'
  row.getCell(5).numFmt = '0.00"×"'

  ;[2, 3, 4, 5].forEach((col) => {
    const cell = row.getCell(col)
    cell.font = fontSmall
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  })

  // TCO cells
  ;[6, 7, 8].forEach((col) => {
    const cell = row.getCell(col)
    cell.numFmt = '€#,##0.00'
    cell.font = fontBody
    cell.alignment = { vertical: 'middle', horizontal: 'right' }
  })

  row.getCell(9).font = fontBold
  row.getCell(9).alignment = { vertical: 'middle', horizontal: 'center' }

  row.getCell(10).font = fontSmall
  row.getCell(10).alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true }

  row.eachCell((cell) => {
    cell.border = { top: thin, bottom: thin, left: thin, right: thin }
    if (i % 2 === 1) {
      if (!cell.fill || cell.fill?.fgColor?.argb !== YELLOW_INPUT) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } }
      }
    }
  })

  // Baseline row bolded
  if (i === 0) {
    row.getCell(1).font = fontBold
  }
})

const S_LAST_ROW = S_FIRST_ROW + scenarios.length - 1

// Conditional formatting — green the winning TCO per scenario row
for (let r = S_FIRST_ROW; r <= S_LAST_ROW; r++) {
  s3.addConditionalFormatting({
    ref: `F${r}:H${r}`,
    rules: [
      {
        type: 'cellIs',
        operator: 'equal',
        priority: 1,
        formulae: [`MIN($F$${r}:$H$${r})`],
        style: {
          font: { bold: true, color: { argb: 'FF1E2A2B' } },
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: GREEN_WINNER } },
        },
      },
    ],
  })
}

// Summary / how-to-read block
const READ_ROW = S_LAST_ROW + 2
s3.mergeCells(`A${READ_ROW}:J${READ_ROW}`)
s3.getCell(`A${READ_ROW}`).value = 'How to read this table'
s3.getCell(`A${READ_ROW}`).font = { ...fontBold, color: { argb: 'FFFFFFFF' } }
s3.getCell(`A${READ_ROW}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL_DARK } }
s3.getCell(`A${READ_ROW}`).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
s3.getRow(READ_ROW).height = 22

s3.mergeCells(`A${READ_ROW + 1}:J${READ_ROW + 4}`)
s3.getCell(`A${READ_ROW + 1}`).value =
  'Count how many scenarios your baseline winner LOSES. If 0-1 → robust choice. If 2-4 → fragile, consider the runner-up. ' +
  'If 5+ → your winner wins on unit price, not on resilience.\n' +
  '\n' +
  'Rule of thumb used by the Procurea beta cohort: prefer the supplier that wins the baseline AND at least 7 of 10 scenarios. ' +
  'A TCO gap of less than 3% between #1 and #2 is within model error — treat it as a tie and pick the more resilient option.'
s3.getCell(`A${READ_ROW + 1}`).font = fontBody
s3.getCell(`A${READ_ROW + 1}`).alignment = { vertical: 'top', horizontal: 'left', wrapText: true, indent: 1 }
s3.getRow(READ_ROW + 1).height = 20
s3.getRow(READ_ROW + 2).height = 20
s3.getRow(READ_ROW + 3).height = 20
s3.getRow(READ_ROW + 4).height = 20

// Bold border on base-rate input zone (B4:B7)
for (let r = 4; r <= 7; r++) {
  const cell = s3.getRow(r).getCell(2)
  cell.border = { top: medium, bottom: medium, left: medium, right: medium }
}

// ---------------------------------------------------------------------------
// Write file
// ---------------------------------------------------------------------------
await wb.xlsx.writeFile(OUT_PATH)

const stats = statSync(OUT_PATH)
const sizeKB = (stats.size / 1024).toFixed(1)
console.log(`\nGenerated: ${OUT_PATH}`)
console.log(`Size:      ${sizeKB} KB`)
console.log(`Sheets:    Cost Categories, Comparison, Sensitivity`)
console.log(`\nDone.`)
