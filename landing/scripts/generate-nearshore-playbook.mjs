#!/usr/bin/env node
/**
 * Nearshore Migration Playbook — PDF generator
 *
 * Generates a styled 14+ page PDF using @react-pdf/renderer.
 * Source content lives in public/resources/downloads/nearshore-migration-playbook/nearshore-migration-playbook.md
 *
 * Usage:
 *   node scripts/generate-nearshore-playbook.mjs
 */

import { createElement as h, Fragment } from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Rect,
  Line,
  Circle,
  G,
  renderToFile,
  Font,
} from '@react-pdf/renderer'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, statSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'resources', 'downloads', 'nearshore-migration-playbook')
const OUT_FILE = join(OUT_DIR, 'nearshore-migration-playbook.pdf')

mkdirSync(OUT_DIR, { recursive: true })

// ---------------------------------------------------------------------------
// Colors (Procurea brand)
// ---------------------------------------------------------------------------
const C = {
  teal: '#5E8C8F',
  tealDark: '#2A5C5D',
  tealDeep: '#1F4748',
  tealInk: '#0F2E2F',
  sage: '#8AA8A5',
  sageLight: '#D8E4E2',
  bg: '#F6F9F9',
  bgAlt: '#EEF4F3',
  ink: '#0F172B',
  body: '#1E293B',
  muted: '#475569',
  faint: '#94A3B8',
  line: '#E2E8F0',
  lineStrong: '#CBD5E1',
  white: '#FFFFFF',
  amber: '#C98A2E',
  amberBg: '#FDF4E3',
  emerald: '#2F7D5B',
  emeraldBg: '#E7F3EC',
  rose: '#B04554',
  roseBg: '#FAE8EB',
  indigo: '#3A5BA0',
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 52,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.body,
    lineHeight: 1.55,
  },
  pageCover: {
    padding: 0,
    color: C.white,
    fontFamily: 'Helvetica',
  },
  headerBar: {
    position: 'absolute',
    top: 22,
    left: 52,
    right: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  headerLeft: { fontSize: 8.5, color: C.muted, letterSpacing: 0.4, textTransform: 'uppercase' },
  headerRight: { fontSize: 8.5, color: C.teal, letterSpacing: 0.6, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold' },
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 52,
    right: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: C.line,
    fontSize: 8,
    color: C.faint,
  },
  h1: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: C.tealDark,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: C.tealDark,
    marginTop: 14,
    marginBottom: 6,
  },
  h3: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: C.teal,
    marginTop: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eyebrow: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: C.teal,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  lead: {
    fontSize: 11,
    color: C.ink,
    lineHeight: 1.55,
    marginBottom: 8,
  },
  p: {
    fontSize: 10,
    color: C.body,
    lineHeight: 1.55,
    marginBottom: 6,
  },
  strong: { fontFamily: 'Helvetica-Bold', color: C.tealDark },
  small: { fontSize: 8.5, color: C.muted, lineHeight: 1.5 },
  divider: { height: 1, backgroundColor: C.line, marginVertical: 10 },
  // Tables
  th: {
    backgroundColor: C.teal,
    color: C.white,
    padding: 5,
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
  },
  td: {
    padding: 5,
    fontSize: 8.5,
    color: C.body,
    borderBottomWidth: 0.5,
    borderBottomColor: C.line,
  },
  // Callouts
  callout: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 7,
    paddingRight: 10,
    marginVertical: 6,
  },
  calloutTeal: { borderLeftColor: C.teal, backgroundColor: C.bgAlt },
  calloutAmber: { borderLeftColor: C.amber, backgroundColor: C.amberBg },
  calloutEmerald: { borderLeftColor: C.emerald, backgroundColor: C.emeraldBg },
  calloutRose: { borderLeftColor: C.rose, backgroundColor: C.roseBg },
})

// ---------------------------------------------------------------------------
// Helpers / Primitives
// ---------------------------------------------------------------------------
const T = (text, style) => h(Text, { style }, text)
const V = (style, ...kids) => h(View, { style }, ...kids)

/**
 * Inline rich text: accepts array of { text, bold?, color?, italic? } segments.
 */
function RichText(segments, baseStyle = {}) {
  return h(
    Text,
    { style: baseStyle },
    ...segments.map((s, i) => {
      if (typeof s === 'string') return h(Text, { key: i }, s)
      const style = {}
      if (s.bold) style.fontFamily = 'Helvetica-Bold'
      if (s.italic) style.fontFamily = 'Helvetica-Oblique'
      if (s.color) style.color = s.color
      if (s.size) style.fontSize = s.size
      return h(Text, { key: i, style }, s.text)
    })
  )
}

function Header(opts = {}) {
  const { section = 'Nearshore Migration Playbook' } = opts
  return V(
    styles.headerBar,
    T(section, styles.headerLeft),
    T('procurea.io', styles.headerRight)
  )
}

function Footer(opts = {}) {
  const { pageNum, totalPages = 14 } = opts
  return V(
    styles.footer,
    T(`© 2026 Procurea · Nearshore Migration Playbook v1.0`, { fontSize: 8, color: C.faint }),
    T(`Page ${pageNum} of ${totalPages}`, { fontSize: 8, color: C.faint })
  )
}

function Bullet(text, color = C.teal) {
  return V(
    { flexDirection: 'row', marginBottom: 3, paddingLeft: 2 },
    V({ width: 10, paddingTop: 4 },
      h(Svg, { width: 6, height: 6 },
        h(Circle, { cx: 3, cy: 3, r: 2.5, fill: color })
      )
    ),
    V({ flex: 1 },
      typeof text === 'string' ? T(text, styles.p) : text
    )
  )
}

function CheckItem(text) {
  return V(
    { flexDirection: 'row', marginBottom: 4, paddingLeft: 2 },
    V({ width: 14, paddingTop: 3 },
      h(Svg, { width: 9, height: 9, viewBox: '0 0 10 10' },
        h(Rect, { x: 0.5, y: 0.5, width: 9, height: 9, rx: 1.5, stroke: C.teal, strokeWidth: 0.8, fill: 'none' }),
        h(Path, { d: 'M 2 5 L 4 7 L 8 2.5', stroke: C.teal, strokeWidth: 1.2, fill: 'none' })
      )
    ),
    V({ flex: 1 },
      typeof text === 'string' ? T(text, styles.p) : text
    )
  )
}

function Callout(variant, title, body) {
  const variantStyle = {
    teal: styles.calloutTeal,
    amber: styles.calloutAmber,
    emerald: styles.calloutEmerald,
    rose: styles.calloutRose,
  }[variant] || styles.calloutTeal
  const labelColor = {
    teal: C.teal,
    amber: C.amber,
    emerald: C.emerald,
    rose: C.rose,
  }[variant] || C.teal
  return V(
    [styles.callout, variantStyle],
    T(title, { fontSize: 9, fontFamily: 'Helvetica-Bold', color: labelColor, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }),
    typeof body === 'string'
      ? T(body, { fontSize: 9.5, color: C.body, lineHeight: 1.5 })
      : body
  )
}

/** Table: headers is array of {label, flex?}. rows is array of array (strings or {text, bold, color}). */
function Table({ headers, rows, zebra = true, compact = false, cellStyle }) {
  const flexes = headers.map(hd => hd.flex || 1)
  const totalFlex = flexes.reduce((a, b) => a + b, 0)
  const pad = compact ? 3.5 : 5
  const fz = compact ? 7.8 : 8.5
  return V(
    { marginVertical: 6, borderRadius: 3, overflow: 'hidden', borderWidth: 0.5, borderColor: C.line },
    V(
      { flexDirection: 'row', backgroundColor: C.teal },
      ...headers.map((hd, i) =>
        V(
          { flex: flexes[i] / totalFlex, padding: pad },
          T(hd.label, { color: C.white, fontSize: fz, fontFamily: 'Helvetica-Bold' })
        )
      )
    ),
    ...rows.map((row, ri) =>
      V(
        {
          flexDirection: 'row',
          backgroundColor: zebra && ri % 2 === 1 ? C.bg : C.white,
          borderBottomWidth: 0.5,
          borderBottomColor: C.line,
        },
        ...row.map((cell, ci) => {
          const content =
            typeof cell === 'string'
              ? T(cell, { fontSize: fz, color: C.body, lineHeight: 1.4 })
              : Array.isArray(cell)
                ? RichText(cell, { fontSize: fz, color: C.body, lineHeight: 1.4 })
                : T(cell.text, {
                    fontSize: fz,
                    color: cell.color || C.body,
                    fontFamily: cell.bold ? 'Helvetica-Bold' : 'Helvetica',
                    lineHeight: 1.4,
                  })
          return V({ flex: flexes[ci] / totalFlex, padding: pad, ...(cellStyle || {}) }, content)
        })
      )
    )
  )
}

/** Horizontal bar for simple comparisons — label left, bar + value. */
function HBar({ label, value, max, suffix = '', color = C.teal, width = 140 }) {
  const pct = Math.max(3, Math.min(100, (value / max) * 100))
  return V(
    { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    V({ width: 70 }, T(label, { fontSize: 9, color: C.body })),
    V({ width, height: 10, backgroundColor: C.bgAlt, borderRadius: 2 },
      V({ width: `${pct}%`, height: 10, backgroundColor: color, borderRadius: 2 })
    ),
    V({ marginLeft: 8 }, T(`${value}${suffix}`, { fontSize: 9, color: C.tealDark, fontFamily: 'Helvetica-Bold' }))
  )
}

function StatTile({ value, label, color = C.teal, width = '32%' }) {
  return V(
    { width, padding: 10, backgroundColor: C.bgAlt, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: color, marginRight: 6 },
    T(value, { fontSize: 18, fontFamily: 'Helvetica-Bold', color, marginBottom: 2, letterSpacing: -0.5 }),
    T(label, { fontSize: 8.5, color: C.muted, lineHeight: 1.3 })
  )
}

function LogoMark({ size = 22, color = C.white }) {
  // A Procurea-inspired "P" mark
  return h(Svg, { width: size, height: size, viewBox: '0 0 40 40' },
    h(Circle, { cx: 20, cy: 20, r: 18, stroke: color, strokeWidth: 2, fill: 'none' }),
    h(Path, { d: 'M 14 12 L 14 30 M 14 12 L 22 12 Q 28 12 28 18 Q 28 24 22 24 L 14 24', stroke: color, strokeWidth: 2.2, fill: 'none' })
  )
}

function Wordmark({ color = C.white, size = 18 }) {
  return V(
    { flexDirection: 'row', alignItems: 'center' },
    V({ marginRight: 8 }, LogoMark({ size: size + 4, color })),
    T('Procurea', { fontSize: size, fontFamily: 'Helvetica-Bold', color, letterSpacing: -0.3 })
  )
}

// Standard page wrapper
function StandardPage(pageNum, totalPages, section, children) {
  return h(Page, { size: 'A4', style: styles.page },
    Header({ section }),
    ...children,
    Footer({ pageNum, totalPages })
  )
}

// ---------------------------------------------------------------------------
// PAGE 1 — Cover
// ---------------------------------------------------------------------------
function CoverPage() {
  return h(Page, { size: 'A4', style: styles.pageCover },
    // Background fill
    V({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.tealDeep }),
    // Decorative SVG gradient-ish layers
    h(Svg, { style: { position: 'absolute', top: 0, left: 0 }, width: 595, height: 842 },
      h(Rect, { x: 0, y: 0, width: 595, height: 842, fill: C.tealDeep }),
      h(Rect, { x: 0, y: 0, width: 595, height: 500, fill: C.tealDark, opacity: 0.55 }),
      h(Rect, { x: 0, y: 0, width: 595, height: 280, fill: C.teal, opacity: 0.35 }),
      // Soft arcs
      h(Circle, { cx: 540, cy: 90, r: 180, fill: C.sage, opacity: 0.12 }),
      h(Circle, { cx: 60, cy: 720, r: 240, fill: C.sage, opacity: 0.08 }),
      h(Circle, { cx: 500, cy: 620, r: 140, fill: C.teal, opacity: 0.18 }),
      // Watermark big "P"
      h(G, { opacity: 0.05 },
        h(Path, { d: 'M 250 400 L 250 700 M 250 400 L 390 400 Q 500 400 500 500 Q 500 600 390 600 L 250 600', stroke: C.white, strokeWidth: 18, fill: 'none' })
      )
    ),
    // Header mark
    V({ position: 'absolute', top: 44, left: 52, flexDirection: 'row', alignItems: 'center' },
      Wordmark({ color: C.white, size: 14 })
    ),
    V({ position: 'absolute', top: 46, right: 52 },
      T('Playbook · Edition 1.0', { fontSize: 9, color: C.sageLight, letterSpacing: 1.2, textTransform: 'uppercase' })
    ),
    // Eyebrow
    V({ position: 'absolute', top: 220, left: 52, right: 52 },
      V({ flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
        V({ width: 24, height: 2, backgroundColor: C.sageLight, marginRight: 10 }),
        T('China+1 Strategy · 2026 Edition', { fontSize: 10, color: C.sageLight, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold' })
      ),
      T('Nearshore', { fontSize: 54, color: C.white, fontFamily: 'Helvetica-Bold', letterSpacing: -1.5, lineHeight: 1 }),
      T('Migration', { fontSize: 54, color: C.white, fontFamily: 'Helvetica-Bold', letterSpacing: -1.5, lineHeight: 1 }),
      T('Playbook', { fontSize: 54, color: C.sage, fontFamily: 'Helvetica-Bold', letterSpacing: -1.5, lineHeight: 1, marginBottom: 22 }),
      T('China+1 Made Practical — EU, Turkey, Mexico', {
        fontSize: 16,
        color: C.white,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 10,
        letterSpacing: -0.2,
      }),
      T(
        'The operator\'s playbook for diversifying supply chain. Six-country comparison, category-specific guidance, a 90-day sequencing plan, and a board-ready business case with worked ROI.',
        { fontSize: 11.5, color: C.sageLight, lineHeight: 1.55, maxWidth: 420 }
      )
    ),
    // Mid divider
    V({ position: 'absolute', top: 600, left: 52, right: 52, height: 1, backgroundColor: C.sage, opacity: 0.35 }),
    // Key facts strip
    V({ position: 'absolute', top: 620, left: 52, right: 52, flexDirection: 'row' },
      V({ width: '33%' },
        T('6', { fontSize: 34, fontFamily: 'Helvetica-Bold', color: C.sage, letterSpacing: -1 }),
        T('Nearshore countries\ncompared, head to head', { fontSize: 9, color: C.sageLight, lineHeight: 1.4 })
      ),
      V({ width: '33%' },
        T('4', { fontSize: 34, fontFamily: 'Helvetica-Bold', color: C.sage, letterSpacing: -1 }),
        T('Categories with\nspecific guidance', { fontSize: 9, color: C.sageLight, lineHeight: 1.4 })
      ),
      V({ width: '33%' },
        T('90', { fontSize: 34, fontFamily: 'Helvetica-Bold', color: C.sage, letterSpacing: -1 }),
        T('Day pilot execution\nplan, week-by-week', { fontSize: 9, color: C.sageLight, lineHeight: 1.4 })
      )
    ),
    // Footer
    V({ position: 'absolute', bottom: 40, left: 52, right: 52, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
      V({},
        T('Published April 2026 · Procurea', { fontSize: 8.5, color: C.sageLight, letterSpacing: 1, textTransform: 'uppercase' }),
        T('Next revision: October 2026', { fontSize: 8.5, color: C.sage, marginTop: 2 })
      ),
      V({ alignItems: 'flex-end' },
        T('procurea.io', { fontSize: 11, color: C.white, fontFamily: 'Helvetica-Bold' }),
        T('hello@procurea.io', { fontSize: 9, color: C.sageLight, marginTop: 1 })
      )
    )
  )
}

// ---------------------------------------------------------------------------
// PAGE 2 — Executive Summary
// ---------------------------------------------------------------------------
function ExecutiveSummaryPage() {
  return StandardPage(2, 14, 'Executive Summary', [
    T('01 · Executive Summary', styles.eyebrow),
    T('Why this playbook, why now', styles.h1),
    T(
      'A board directive has landed on your desk, a supply disruption cost you a quarter, or both. This playbook answers the "now what?" question for procurement and supply chain leaders at companies with €50M–€1B in annual spend who source 40%+ from a single country.',
      styles.lead
    ),
    // Stats tiles row
    V({ flexDirection: 'row', marginTop: 6, marginBottom: 10 },
      StatTile({ value: '60–90d', label: 'China lead time\n(Asia → EU, sea)', color: C.rose }),
      StatTile({ value: '15–30d', label: 'Europe lead time\n(road, nearshore)', color: C.emerald }),
      StatTile({ value: '8–12%', label: 'Post-2023 Red Sea\nfreight surcharge', color: C.amber, width: '32%' })
    ),
    T('What you\'ll get from this playbook', styles.h3),
    Bullet('A six-country comparison matrix (Poland, Turkey, Portugal, Romania, Hungary, Czechia) benchmarked on labour cost, lead time, English fluency, CBAM exposure, and category depth.'),
    Bullet('Category-specific recommendations for textiles, electronics, metals, and plastics — with typical unit costs and certification maps.'),
    Bullet('A 90-day pilot plan, week by week, with named deliverables and decision gates.'),
    Bullet('A board-ready business case template, plus a worked ROI example on a real machined-part scenario.'),
    Bullet('Three beta-cohort composite stories — what worked, what partially worked, and one that failed.'),
    // TL;DR
    Callout('teal', '30-second TL;DR',
      V({},
        T(
          'Diversification costs money in year 1 and saves money in year 2–5 under most scenarios — but it guarantees optionality against tail-risk events single-country strategies do not survive. The Ukraine war, Covid, the Red Sea, and the 2025 tariff round cost specific companies 3–12% of revenue; firms with nearshore options absorbed the shock.',
          { fontSize: 9.5, color: C.body, marginBottom: 5, lineHeight: 1.5 }
        ),
        T(
          'The question is not whether to diversify, but which policy and how much. This playbook gives you a defensible shortlist by category, a staged execution plan, and the numbers your CFO will ask for.',
          { fontSize: 9.5, color: C.body, lineHeight: 1.5 }
        )
      )
    ),
    T('Five shifts since 2020 changed the math', styles.h3),
    Bullet(RichText([{ text: 'Freight volatility is structural, not cyclical. ', bold: true, color: C.tealDark }, 'Red Sea routing adds 10–14 days and 15–25% cost to Asia–Europe trade.'], { fontSize: 9.5, color: C.body, lineHeight: 1.5 })),
    Bullet(RichText([{ text: 'Tariffs are a permanent variable. ', bold: true, color: C.tealDark }, 'US Section 301 expanded in 2024 and 2025; EU anti-subsidy duties on Chinese EVs and PV.'], { fontSize: 9.5, color: C.body, lineHeight: 1.5 })),
    Bullet(RichText([{ text: 'CBAM is live. ', bold: true, color: C.tealDark }, 'Chinese steel adds €30–50/tonne in 2026, rising to €80–150/tonne when fully implemented 2027–28.'], { fontSize: 9.5, color: C.body, lineHeight: 1.5 })),
    Bullet(RichText([{ text: 'Nearshore cost gaps are narrowing. ', bold: true, color: C.tealDark }, 'Chinese labour inflated 8–12% annually 2020–24; lira depreciation made Turkish labour cheaper in EUR.'], { fontSize: 9.5, color: C.body, lineHeight: 1.5 })),
    Bullet(RichText([{ text: 'Multi-language supplier discovery is newly feasible. ', bold: true, color: C.tealDark }, 'AI-native discovery compresses first-stage qualification from 30 hours to under 1 hour.'], { fontSize: 9.5, color: C.body, lineHeight: 1.5 })),
  ])
}

// ---------------------------------------------------------------------------
// PAGE 3 — Six Candidate Countries (overview + matrix pt.1)
// ---------------------------------------------------------------------------
function Page3_Countries() {
  return StandardPage(3, 14, 'Country Comparison', [
    T('02 · Country Matrix', styles.eyebrow),
    T('The six candidate countries', styles.h1),
    T(
      'No country wins on every dimension. A textile buyer picking Turkey accepts non-EU CBAM friction in exchange for the world\'s strongest textile ecosystem and lira advantage. A machining buyer picking Czechia pays 15–20% more to get precision and automation maturity. The trap: picking a country because it wins on labour cost without checking category fit.',
      styles.p
    ),
    Table({
      headers: [
        { label: 'Dimension', flex: 1.6 },
        { label: 'Poland', flex: 1 },
        { label: 'Turkey', flex: 1 },
        { label: 'Portugal', flex: 1 },
        { label: 'Romania', flex: 1 },
        { label: 'Hungary', flex: 1 },
        { label: 'Czechia', flex: 1 },
      ],
      compact: true,
      rows: [
        [{ text: 'EU member (2026)', bold: true }, 'Yes', 'Customs Union', 'Yes', 'Yes', 'Yes', 'Yes'],
        [{ text: 'Currency', bold: true }, 'PLN', 'TRY', 'EUR', 'RON', 'HUF', 'CZK'],
        [{ text: 'Labour €/hr (mfg)', bold: true }, '€10–13', '€5–8', '€9–12', '€7–9', '€9–11', '€11–14'],
        [{ text: 'vs. Germany (€45)', bold: true }, '25%', '12%', '23%', '18%', '23%', '28%'],
        [{ text: 'vs. China (€6–9)', bold: true }, '135%', '80%', '125%', '100%', '120%', '150%'],
        [{ text: 'English (commercial)', bold: true }, 'High', 'Med–High', 'High', 'Medium', 'Medium', 'Med–High'],
        [{ text: 'Road lead to W. EU', bold: true }, '2–4 d', '6–8 d', '4–6 d', '4–6 d', '2–4 d', '1–3 d'],
        [{ text: 'CBAM exposure', bold: true }, 'None', { text: 'Medium', color: C.amber, bold: true }, 'None', 'None', 'None', 'None'],
        [{ text: 'ISO 9001 adoption', bold: true }, 'High', 'Med–High', 'High', 'Medium', 'High', 'High'],
        [{ text: 'Machining / metals', bold: true }, { text: 'Very strong', color: C.emerald, bold: true }, 'Strong', 'Moderate', 'Strong', 'Strong', { text: 'Very strong', color: C.emerald, bold: true }],
        [{ text: 'Textiles / apparel', bold: true }, 'Moderate', { text: 'Very strong', color: C.emerald, bold: true }, 'Strong', 'Moderate', 'Limited', 'Limited'],
        [{ text: 'Electronics', bold: true }, 'Strong', 'Moderate', 'Moderate', 'Moderate', 'Strong', 'Strong'],
        [{ text: 'Plastics / packaging', bold: true }, 'Strong', 'Strong', 'Moderate', 'Moderate', 'Strong', 'Strong'],
        [{ text: 'Political stability (5y)', bold: true }, 'High', 'Medium', 'High', 'Med–High', 'Medium', 'High'],
      ],
    }),
    Callout('teal', 'How to read this matrix',
      'Column 1 (labour cost) is the default lens, but it is almost never decisive. Start by checking the category row that matches your primary spend — metals, textiles, or electronics — and shortlist countries rated Strong or Very strong there. Then filter by lead-time constraint, CBAM exposure, and political stability. Only then compare labour cost inside the remaining candidates.'
    ),
  ])
}

// ---------------------------------------------------------------------------
// PAGE 4 — Heatmap
// ---------------------------------------------------------------------------
function Page4_Heatmap() {
  const score = (v) => {
    if (v >= 5) return { c: '#2F7D5B', label: 'Very strong' }
    if (v === 4) return { c: '#5FA977', label: 'Strong' }
    if (v === 3) return { c: '#C4B456', label: 'Moderate' }
    if (v === 2) return { c: '#D18A44', label: 'Limited' }
    return { c: '#B04554', label: 'Weak' }
  }
  const categories = [
    ['Metals / machining', 5, 4, 3, 4, 4, 5],
    ['Textiles / apparel', 3, 5, 4, 3, 2, 2],
    ['Electronics / EMS', 4, 3, 3, 3, 4, 4],
    ['Plastics / packaging', 4, 4, 3, 3, 4, 4],
    ['Automotive tier-2', 5, 3, 2, 4, 5, 5],
    ['Leather / footwear', 2, 4, 5, 2, 2, 2],
    ['Aluminium / extrusions', 3, 5, 2, 2, 3, 3],
    ['Precision tooling', 5, 3, 2, 3, 4, 5],
    ['Labour cost advantage', 3, 5, 3, 4, 3, 2],
    ['Lead time to W. EU', 5, 2, 4, 4, 5, 5],
    ['English in commercial', 5, 4, 5, 3, 3, 4],
    ['IATF 16949 density', 5, 3, 3, 4, 5, 5],
  ]
  const countries = ['Poland', 'Turkey', 'Portugal', 'Romania', 'Hungary', 'Czechia']

  return StandardPage(4, 14, 'Country Comparison', [
    T('02 · Heatmap view', styles.eyebrow),
    T('Category fit at a glance', styles.h1),
    T(
      'Same data as page 3, colour-coded by category fit. Use this sheet when briefing stakeholders who prefer visual over tabular summaries — it surfaces clusters (e.g. Poland/Czechia for metals + tooling, Turkey for textiles + aluminium) that the matrix layout obscures.',
      styles.p
    ),
    // Header row
    V({ flexDirection: 'row', marginTop: 12, marginBottom: 4 },
      V({ width: 130 }, T('Category', { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 })),
      ...countries.map(cn =>
        V({ flex: 1, alignItems: 'center' },
          T(cn, { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.tealDark })
        )
      )
    ),
    // Heatmap rows
    ...categories.map(([label, ...vals]) =>
      V({ flexDirection: 'row', marginBottom: 3, alignItems: 'center' },
        V({ width: 130, paddingRight: 4 }, T(label, { fontSize: 8.5, color: C.body })),
        ...vals.map((v) => {
          const s = score(v)
          return V(
            { flex: 1, paddingHorizontal: 2 },
            V({ height: 22, backgroundColor: s.c, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
              T(String(v), { fontSize: 10, color: C.white, fontFamily: 'Helvetica-Bold' })
            )
          )
        })
      )
    ),
    // Legend
    V({ flexDirection: 'row', marginTop: 14, alignItems: 'center', justifyContent: 'center' },
      ...[
        ['5 · Very strong', '#2F7D5B'],
        ['4 · Strong', '#5FA977'],
        ['3 · Moderate', '#C4B456'],
        ['2 · Limited', '#D18A44'],
        ['1 · Weak', '#B04554'],
      ].map(([lbl, col]) =>
        V({ flexDirection: 'row', alignItems: 'center', marginRight: 14 },
          V({ width: 10, height: 10, backgroundColor: col, borderRadius: 2, marginRight: 4 }),
          T(lbl, { fontSize: 7.5, color: C.muted })
        )
      )
    ),
    Callout('emerald', 'Quick-read clusters',
      V({},
        T('• Metals + tooling cluster: Poland, Czechia (both Very strong on machining, tooling, IATF).', { fontSize: 9.5, color: C.body, marginBottom: 2 }),
        T('• Textile cluster: Turkey (denim, home textiles), Portugal (leather, premium fashion).', { fontSize: 9.5, color: C.body, marginBottom: 2 }),
        T('• Automotive electronics cluster: Hungary (OEM density), Czechia (precision + automation), Poland (breadth).', { fontSize: 9.5, color: C.body, marginBottom: 2 }),
        T('• Value cluster: Romania (lowest EU labour), Turkey (lira advantage) — but invest more in qualification rigour.', { fontSize: 9.5, color: C.body })
      )
    ),
  ])
}

// ---------------------------------------------------------------------------
// PAGE 5 — Red Flags by Country
// ---------------------------------------------------------------------------
function Page5_RedFlags() {
  return StandardPage(5, 14, 'Country Comparison', [
    T('02 · Risk by geography', styles.eyebrow),
    T('Red flags by country', styles.h1),
    T(
      'Every geography has a characteristic supplier-risk profile. These are the patterns we see repeatedly across beta-cohort qualification work — the failure modes that burn time when you discover them at audit stage, but are cheap to screen for in week 4.',
      styles.p
    ),
    Table({
      headers: [
        { label: 'Country', flex: 1 },
        { label: 'Characteristic red flags', flex: 3.5 },
        { label: 'Screening remedy', flex: 2.5 },
      ],
      rows: [
        [
          { text: 'Poland', bold: true, color: C.tealDark },
          'Supplier at >75% utilisation deprioritises new customers; labour cost inflation 7–10%/yr compresses advantage; family ownership transitions can disrupt continuity.',
          'Ask for utilisation %; request 3-year labour cost trend; verify succession plan if family-owned.',
        ],
        [
          { text: 'Turkey', bold: true, color: C.tealDark },
          'TRY volatility triggers mid-contract "adjusted material cost" renegotiations; quality variance between multinational vs. family workshop; non-EU = CBAM on steel/aluminium.',
          'Insist on EUR-denominated quotes; qualify on who does the work, not org name; calculate CBAM exposure per SKU.',
        ],
        [
          { text: 'Portugal', bold: true, color: C.tealDark },
          'Capacity constraint — good suppliers booked 3–6 months; ageing workforce + emigration; higher floor on labour cost than RO/BG.',
          'Start relationship-building 6 months before first PO; qualify capacity growth plan; expect waitlist.',
        ],
        [
          { text: 'Romania', bold: true, color: C.tealDark },
          'Quality variance wider than Poland (qualification rigour matters more); language mix variable (EN/DE/FR depending on region); tier-2 capacity absorbed by Dacia/Bosch.',
          'Mandatory on-site audit for strategic categories; confirm communication language up front; check supplier customer concentration.',
        ],
        [
          { text: 'Hungary', bold: true, color: C.tealDark },
          'Suppliers often have single OEM customer taking priority; politics-business interface less predictable; wage convergence with PL/CZ without matching mid-market density.',
          'Confirm your order sequence vs. OEM releases; verify supplier has diversified customer base (<50% single customer).',
        ],
        [
          { text: 'Czechia', bold: true, color: C.tealDark },
          'Highest labour cost of the six (€11–14/hr); "good" suppliers booked 3–6 months ahead; price discipline weak — precision niche priced accordingly.',
          'Plan 4–6 months ahead for slot; negotiate terms/service rather than unit price; benchmark against Polish alternatives.',
        ],
      ],
    }),
    Callout('amber', 'Cross-country pattern',
      'The single most common disqualifier we observe, across all six countries: supplier customer concentration above 60%. A supplier with one anchor customer will deprioritise you under any capacity squeeze — regardless of contractual language. Ask for customer distribution (top-5 share of revenue) in the RFQ itself, and disqualify anything above 60% concentration unless you can be the anchor.'
    ),
    T('When to walk away at audit', styles.h3),
    Bullet('Cannot produce a current IATF 16949 / ISO 9001 certificate (not "in progress", not "expired in 2024") for regulated categories.'),
    Bullet('Refuses or delays a facility visit beyond 4 weeks — indicates either capacity issue or something on the shop floor they\'d rather you not see.'),
    Bullet('Reference customers are all local / domestic — you want at least 1 reference customer in a demanding Western market who will take a call from you.'),
    Bullet('Financial opacity — if you cannot get a current balance sheet or credit report, treat as pre-insolvency risk.'),
  ])
}

// ---------------------------------------------------------------------------
// PAGE 6 — Textiles + Electronics
// ---------------------------------------------------------------------------
function Page6_TextilesElectronics() {
  return StandardPage(6, 14, 'Category Recommendations', [
    T('03 · Category playbook', styles.eyebrow),
    T('Textiles & Electronics', styles.h1),
    // Two-column layout
    V({ flexDirection: 'row', marginTop: 6 },
      // Left column: Textiles
      V({ flex: 1, paddingRight: 10 },
        V({ flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
          V({ width: 22, height: 22, backgroundColor: C.teal, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
            h(Svg, { width: 12, height: 12, viewBox: '0 0 12 12' },
              h(Path, { d: 'M 2 3 L 6 1 L 10 3 L 10 10 L 2 10 Z M 2 3 L 6 5 L 10 3 M 6 5 L 6 10', stroke: C.white, strokeWidth: 1.2, fill: 'none' })
            )
          ),
          T('Textiles & apparel', { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.tealDark })
        ),
        T('Country ranking: TR > PT > PL > RO', { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.teal, marginBottom: 6 }),
        T('Turkey\'s textile industry is structurally different — vertically integrated from yarn through dyeing within 100km of Istanbul or Denizli. A Turkish t-shirt lead-times at 21 days; Portugal equivalent is 35–45 days because weaving is often imported anyway.', { fontSize: 9, color: C.body, marginBottom: 6, lineHeight: 1.45 }),
        T('CMT cost benchmarks (2026)', styles.h3),
        V({ marginBottom: 6 },
          HBar({ label: 'Turkey basic', value: 1.35, max: 3, suffix: ' €/min', color: '#5FA977', width: 90 }),
          HBar({ label: 'Poland tech', value: 1.8, max: 3, suffix: ' €/min', color: C.teal, width: 90 }),
          HBar({ label: 'Portugal prem', value: 2.2, max: 3, suffix: ' €/min', color: C.indigo, width: 90 }),
          HBar({ label: 'China ref', value: 0.8, max: 3, suffix: ' €/min', color: C.rose, width: 90 })
        ),
        T('Certifications & MOQ', styles.h3),
        Bullet('GOTS & OEKO-TEX prevalence: TR (very high), PT (high), PL (moderate — technical/workwear only).'),
        Bullet('Typical MOQ: TR 300–1,000 pc/style, PT 150–500 pc/style (lower for premium), PL 500–2,000 pc/style (workwear).'),
        Bullet('Social compliance (SMETA/BSCI) audit in last 18 months is non-negotiable — no buyer with ESG exposure should skip.'),
        Callout('amber', 'Origin fraud risk',
          'Transshipment (Chinese fabric finished in Portugal/Turkey, sold as EU origin) is a real audit item. Verify origin on the fabric itself, not just the garment label — request mill certificates and yarn origin.'
        )
      ),
      // Right column: Electronics
      V({ flex: 1, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: C.line },
        V({ flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
          V({ width: 22, height: 22, backgroundColor: C.teal, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
            h(Svg, { width: 12, height: 12, viewBox: '0 0 12 12' },
              h(Rect, { x: 2, y: 2, width: 8, height: 8, stroke: C.white, strokeWidth: 1.2, fill: 'none' }),
              h(Circle, { cx: 4, cy: 4, r: 0.7, fill: C.white }),
              h(Circle, { cx: 8, cy: 4, r: 0.7, fill: C.white }),
              h(Circle, { cx: 4, cy: 8, r: 0.7, fill: C.white }),
              h(Circle, { cx: 8, cy: 8, r: 0.7, fill: C.white })
            )
          ),
          T('Electronics & EMS', { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.tealDark })
        ),
        T('Country ranking: HU ≈ CZ > PL > PT > RO', { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.teal, marginBottom: 6 }),
        T('EMS in Europe is concentrated in Hungary, Czechia, and Poland — driven by the automotive OEM cluster. A Hungarian PCBA operation matches Chinese quality and scale at a 15–30% premium, offset by ~35 days of freight savings.', { fontSize: 9, color: C.body, marginBottom: 6, lineHeight: 1.45 }),
        T('SMT line rate (€/hr, 2026)', styles.h3),
        V({ marginBottom: 6 },
          HBar({ label: 'Hungary', value: 62, max: 90, suffix: ' €/hr', color: C.teal, width: 90 }),
          HBar({ label: 'Poland', value: 57, max: 90, suffix: ' €/hr', color: C.teal, width: 90 }),
          HBar({ label: 'Czechia', value: 70, max: 90, suffix: ' €/hr', color: C.teal, width: 90 }),
          HBar({ label: 'Portugal', value: 52, max: 90, suffix: ' €/hr', color: C.sage, width: 90 }),
          HBar({ label: 'China ref', value: 32, max: 90, suffix: ' €/hr', color: C.rose, width: 90 })
        ),
        T('Tier 1 vs Tier 2 strategy', styles.h3),
        Bullet('Tier-1 assembly (PCBA, box-build): Hungary, Czechia — IATF 16949 + PPAP fluency as table stakes.'),
        Bullet('Tier-2 components: still substantially Asian-sourced. Nearshoring does not eliminate geopolitical exposure, it splits it across tiers.'),
        Bullet('Certification focus: CE, RoHS, REACH — EU bases have native fluency; Chinese suppliers often need third-party verification.'),
        Callout('teal', 'Tooling timeline',
          'Custom PCB tooling: 6–10 weeks in Europe vs. 3–5 weeks in China. Factor into pilot start date — do not expect parity on first-article by week 8.'
        )
      )
    ),
  ])
}

// ---------------------------------------------------------------------------
// PAGE 7 — Metals + Plastics
// ---------------------------------------------------------------------------
function Page7_MetalsPlastics() {
  return StandardPage(7, 14, 'Category Recommendations', [
    T('03 · Category playbook (cont.)', styles.eyebrow),
    T('Metals & Plastics', styles.h1),
    V({ flexDirection: 'row', marginTop: 6 },
      // Metals
      V({ flex: 1, paddingRight: 10 },
        V({ flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
          V({ width: 22, height: 22, backgroundColor: C.teal, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
            h(Svg, { width: 12, height: 12, viewBox: '0 0 12 12' },
              h(Path, { d: 'M 2 9 L 6 2 L 10 9 Z M 4.5 9 L 6 6 L 7.5 9', stroke: C.white, strokeWidth: 1.2, fill: 'none' })
            )
          ),
          T('Metals & machining', { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.tealDark })
        ),
        T('Country ranking: PL (breadth) · CZ (precision) · TR (cost + aluminium)', { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.teal, marginBottom: 6 }),
        T('CEE machining has 40 years of continuous industrial history. Poland\'s clusters in Rzeszów (aviation), Upper Silesia (heavy industry), and Łódź (machine tools) scale from single-lathe artisan to 500-machine corporate operations.', { fontSize: 9, color: C.body, marginBottom: 6, lineHeight: 1.45 }),
        T('Machined steel part, 500 u/yr (€/unit)', styles.h3),
        V({ marginBottom: 6 },
          HBar({ label: 'Poland', value: 11, max: 18, suffix: ' €', color: C.teal, width: 90 }),
          HBar({ label: 'Czechia', value: 13, max: 18, suffix: ' €', color: C.teal, width: 90 }),
          HBar({ label: 'Turkey', value: 8, max: 18, suffix: ' €', color: '#5FA977', width: 90 }),
          HBar({ label: 'Romania', value: 9.5, max: 18, suffix: ' €', color: C.sage, width: 90 }),
          HBar({ label: 'Hungary', value: 11.5, max: 18, suffix: ' €', color: C.teal, width: 90 }),
          HBar({ label: 'China + CBAM', value: 6.8, max: 18, suffix: ' €', color: C.rose, width: 90 })
        ),
        T('When China loses the unit-cost game', styles.h3),
        Bullet('Low volume (<1,000 units/yr): tooling amortisation dominates.'),
        Bullet('Tight tolerance (below ±0.05mm): precision premium narrows gap.'),
        Bullet('Complex tool (multi-cavity, multi-action): Chinese tool cost nearly equals European.'),
        Bullet('Regulated sector (medical, aerospace): certification work neutralises cost.'),
        Callout('amber', 'CBAM note',
          'CBAM applies to steel and aluminium from non-EU origins — Turkey included. For iron/steel from Turkey in 2026, exposure is modest (€0.08–0.18/kg typical), but escalates 2027–28.'
        )
      ),
      // Plastics
      V({ flex: 1, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: C.line },
        V({ flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
          V({ width: 22, height: 22, backgroundColor: C.teal, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
            h(Svg, { width: 12, height: 12, viewBox: '0 0 12 12' },
              h(Path, { d: 'M 6 1 Q 10 3 10 7 Q 10 11 6 11 Q 2 11 2 7 Q 2 3 6 1', stroke: C.white, strokeWidth: 1.2, fill: 'none' })
            )
          ),
          T('Plastics & packaging', { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.tealDark })
        ),
        T('Country ranking: PL · CZ · TR (tied primary)', { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.teal, marginBottom: 6 }),
        T('Mold tooling is the critical path. A Polish or Czech toolmaker takes 10–14 weeks for a production-ready mold; a Chinese toolmaker takes 6–10 weeks — but add 4–6 weeks sea freight on the mold itself and the gap closes.', { fontSize: 9, color: C.body, marginBottom: 6, lineHeight: 1.45 }),
        T('Injection part 50g, 100k u/yr (€/unit)', styles.h3),
        V({ marginBottom: 6 },
          HBar({ label: 'Poland', value: 0.30, max: 0.5, suffix: ' €', color: C.teal, width: 90 }),
          HBar({ label: 'Czechia', value: 0.34, max: 0.5, suffix: ' €', color: C.teal, width: 90 }),
          HBar({ label: 'Turkey', value: 0.25, max: 0.5, suffix: ' €', color: '#5FA977', width: 90 }),
          HBar({ label: 'Romania', value: 0.26, max: 0.5, suffix: ' €', color: C.sage, width: 90 }),
          HBar({ label: 'China ref', value: 0.19, max: 0.5, suffix: ' €', color: C.rose, width: 90 })
        ),
        T('Volume thresholds & tooling', styles.h3),
        Bullet('Below 50k u/yr: tooling amortisation dominates. Europe competitive even at 30% higher unit cost.'),
        Bullet('50k–500k u/yr: unit cost delta matters; freight + CBAM + lead-time cut the China advantage to 5–15%.'),
        Bullet('Above 500k u/yr: China retains unit-cost edge unless policy (PPWR, freight, tariffs) intervenes.'),
        Callout('teal', 'PPWR compliance',
          'EU Packaging & Packaging Waste Regulation (in force 2026) drives material choices. EU suppliers are ahead of Chinese on PPWR-compliant monomaterials and recycled content. Factor into TCO for food/consumer packaging.'
        )
      )
    ),
  ])
}

// ---------------------------------------------------------------------------
// PAGE 8 — Sequencing Strategy
// ---------------------------------------------------------------------------
function Page8_Sequencing() {
  return StandardPage(8, 14, 'Sequencing Strategy', [
    T('04 · Execution framework', styles.eyebrow),
    T('Pilot → Parallel → Ramp', styles.h1),
    T(
      'Three things kill nearshoring programs: starting too big, not running parallel long enough, and no decision point. A staged sequence with pre-declared gates fixes all three. Do not skip stages — moving pilot → ramp (common in executive-led programs with aggressive timelines) almost always produces disruption you are not equipped to handle.',
      styles.p
    ),
    // Stage visual
    V({ flexDirection: 'row', marginVertical: 10, alignItems: 'stretch' },
      // Stage 1
      V({ flex: 1, marginRight: 4, padding: 10, backgroundColor: C.bgAlt, borderRadius: 4, borderTopWidth: 3, borderTopColor: C.teal },
        T('STAGE 1 · PILOT', { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.teal, letterSpacing: 1, marginBottom: 4 }),
        T('Months 0–4', { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginBottom: 6 }),
        T('1 category · 15–25% volume · 1–2 suppliers', { fontSize: 8.5, color: C.body, marginBottom: 6, lineHeight: 1.4 }),
        T('Prove operational mechanics: tooling, quality ramp, first 3 on-time deliveries.', { fontSize: 8.5, color: C.muted, lineHeight: 1.4 })
      ),
      V({ justifyContent: 'center', paddingHorizontal: 4 },
        h(Svg, { width: 14, height: 14, viewBox: '0 0 14 14' },
          h(Path, { d: 'M 2 7 L 11 7 M 8 4 L 11 7 L 8 10', stroke: C.teal, strokeWidth: 1.5, fill: 'none' })
        )
      ),
      V({ flex: 1, marginHorizontal: 4, padding: 10, backgroundColor: C.bgAlt, borderRadius: 4, borderTopWidth: 3, borderTopColor: C.teal },
        T('STAGE 2 · PARALLEL', { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.teal, letterSpacing: 1, marginBottom: 4 }),
        T('Months 4–10', { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginBottom: 6 }),
        T('Same cat to 40–60% · 2nd cat starts m.6', { fontSize: 8.5, color: C.body, marginBottom: 6, lineHeight: 1.4 }),
        T('Test volume scalability, seasonality, exception handling. Confirm business case on real data.', { fontSize: 8.5, color: C.muted, lineHeight: 1.4 })
      ),
      V({ justifyContent: 'center', paddingHorizontal: 4 },
        h(Svg, { width: 14, height: 14, viewBox: '0 0 14 14' },
          h(Path, { d: 'M 2 7 L 11 7 M 8 4 L 11 7 L 8 10', stroke: C.teal, strokeWidth: 1.5, fill: 'none' })
        )
      ),
      V({ flex: 1, marginLeft: 4, padding: 10, backgroundColor: C.bgAlt, borderRadius: 4, borderTopWidth: 3, borderTopColor: C.teal },
        T('STAGE 3 · RAMP', { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.teal, letterSpacing: 1, marginBottom: 4 }),
        T('Months 10–24', { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginBottom: 6 }),
        T('Scale to 70/30 or 80/20 · add categories', { fontSize: 8.5, color: C.body, marginBottom: 6, lineHeight: 1.4 }),
        T('Institutionalise the new supply base. Second-source within nearshore. LTAs.', { fontSize: 8.5, color: C.muted, lineHeight: 1.4 })
      )
    ),
    T('90-day pilot plan, week by week', styles.h2),
    Table({
      headers: [
        { label: 'Weeks', flex: 1 },
        { label: 'Phase', flex: 1.2 },
        { label: 'Key deliverables', flex: 4.5 },
      ],
      rows: [
        ['1–2', { text: 'Prepare', bold: true, color: C.teal }, 'Category selected & documented · success criteria (OTD, PPM, landed cost band) · kickoff meeting · baseline captured.'],
        ['3–4', { text: 'Source', bold: true, color: C.teal }, 'Shortlist 10–15 alternatives (AI discovery compresses 30h → 1h) · initial screening to 8–12 · RFQ sent with 10-day window.'],
        ['5–6', { text: 'Qualify', bold: true, color: C.teal }, 'Quotes scored (Vendor Scoring) · final 3 identified · virtual or on-site audits · 20-point risk checklist · final supplier selected with documented rationale.'],
        ['7–8', { text: 'Tool & prepare', bold: true, color: C.teal }, 'Tooling transferred/fabricated · quality plan aligned · commercial documents signed (supply, NDA, quality, logistics) · freight forwarder + customs broker in place.'],
        ['9–10', { text: 'First article + PPAP', bold: true, color: C.teal }, 'First article 10–50 units · quality sign-off (PPAP for regulated) · formal go/no-go decision documented.'],
        ['11–13', { text: 'Production', bold: true, color: C.teal }, 'PO for 15–25% of category volume · first batch delivered · measured against targets · 30-day in-production review teeing up month-4 stage gate.'],
      ],
    }),
    Callout('emerald', 'Outputs at end of 90 days',
      V({},
        T('1. One new nearshore supplier in production, delivering 15–25% of category volume.', { fontSize: 9, color: C.body, marginBottom: 2 }),
        T('2. Documented performance data (OTD, PPM, landed cost) vs. baseline.', { fontSize: 9, color: C.body, marginBottom: 2 }),
        T('3. Proven internal process (who does what, what the rhythm looks like).', { fontSize: 9, color: C.body, marginBottom: 2 }),
        T('4. Clear readiness signal to enter Parallel stage.', { fontSize: 9, color: C.body })
      )
    ),
  ])
}

// ---------------------------------------------------------------------------
// PAGE 9 — Phase Risk Register
// ---------------------------------------------------------------------------
function Page9_PhaseRisks() {
  return StandardPage(9, 14, 'Sequencing Strategy', [
    T('04 · Risk per phase', styles.eyebrow),
    T('Phase-level risk register', styles.h1),
    T(
      'Risks are not evenly distributed across the 90-day plan. The qualification phase (weeks 3–6) has the highest density of recoverable risks; the production phase (weeks 11–13) has the highest cost of missed risks. Assign a named owner per risk, not per phase.',
      styles.p
    ),
    T('Week 1–4 · Prepare & Source', styles.h3),
    Table({
      headers: [
        { label: 'Risk', flex: 2.5 },
        { label: 'Likelihood', flex: 1 },
        { label: 'Impact', flex: 1 },
        { label: 'Mitigation', flex: 3 },
      ],
      compact: true,
      rows: [
        ['Unclear category priority locks team in analysis', { text: 'Medium', color: C.amber }, { text: 'Medium', color: C.amber }, 'Time-box selection to 5 days; use RICE-style scoring (Reach × Impact × Confidence × Effort).'],
        ['Success criteria vague → no decision gate', { text: 'High', color: C.rose }, { text: 'High', color: C.rose }, 'Define OTD %, PPM, and landed-cost band in writing before shortlisting.'],
        ['Short-list too small (sole-source risk)', { text: 'Medium', color: C.amber }, { text: 'High', color: C.rose }, 'Minimum 3 qualified suppliers per category even if preferred emerges early.'],
      ],
    }),
    T('Week 5–8 · Qualify & Prepare', styles.h3),
    Table({
      headers: [
        { label: 'Risk', flex: 2.5 },
        { label: 'Likelihood', flex: 1 },
        { label: 'Impact', flex: 1 },
        { label: 'Mitigation', flex: 3 },
      ],
      compact: true,
      rows: [
        ['Remote audit misses floor-level red flags', { text: 'Medium', color: C.amber }, { text: 'High', color: C.rose }, 'Mandatory on-site for strategic categories; video walk-through minimum for commodity.'],
        ['Tooling transfer damage or delay', { text: 'Medium', color: C.amber }, { text: 'High', color: C.rose }, 'Prefer duplication over transfer; insure in transit; plan for 20% rework budget.'],
        ['Quality plan misaligned with supplier capability', { text: 'Medium', color: C.amber }, { text: 'Medium', color: C.amber }, 'Joint capability study before quality agreement signature; SPC limits agreed in writing.'],
        ['Commercial terms signed without legal review', { text: 'Low', color: C.emerald }, { text: 'High', color: C.rose }, 'Standard supply agreement template; 48h legal review SLA; no verbal side agreements.'],
      ],
    }),
    T('Week 9–13 · First article & Production', styles.h3),
    Table({
      headers: [
        { label: 'Risk', flex: 2.5 },
        { label: 'Likelihood', flex: 1 },
        { label: 'Impact', flex: 1 },
        { label: 'Mitigation', flex: 3 },
      ],
      compact: true,
      rows: [
        ['First article fails inspection', { text: 'High', color: C.rose }, { text: 'Medium', color: C.amber }, 'Plan for 2 iterations in timeline; escalation path named before PO.'],
        ['Logistics route immature (customs delays)', { text: 'Medium', color: C.amber }, { text: 'Medium', color: C.amber }, 'Dual-route for first 12 months; named backup freight forwarder; trial shipment before first PO.'],
        ['Exception handling reveals process gaps', { text: 'High', color: C.rose }, { text: 'Medium', color: C.amber }, 'Weekly standup with supplier in first 6 weeks; documented exception runbook.'],
        ['China supplier burns bridges prematurely', { text: 'High', color: C.rose }, { text: 'High', color: C.rose }, 'Keep China active through entire parallel stage; do not terminate until 3 consecutive clean months from nearshore.'],
      ],
    }),
    Callout('rose', 'Single biggest pilot killer',
      'Skipping the parallel stage and cutting over from China in one quarter. The beta cohort failure rate on cutover-style migrations is >40%; on staged migrations with 6+ month parallel, it drops below 10%. If executive pressure demands faster cutover, push back with the risk-weighted cost of line-down events vs. 6 months of parallel supply chain.'
    ),
  ])
}

// ---------------------------------------------------------------------------
// PAGE 10 — Business Case Template
// ---------------------------------------------------------------------------
function Page10_BusinessCase() {
  return StandardPage(10, 14, 'Board-Ready Business Case', [
    T('05 · CFO-ready template', styles.eyebrow),
    T('Board-ready business case', styles.h1),
    T(
      'Use this structure. Boards do not read 40-page documents — each section has a target length. The executive ask lives in one paragraph; the financial model is one page with a two-page backup appendix.',
      styles.p
    ),
    // Template 6-section layout
    V({ borderWidth: 0.5, borderColor: C.line, borderRadius: 4, marginTop: 6, padding: 12, backgroundColor: C.white },
      T('1 · Executive ask  (1 paragraph)', { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginBottom: 3 }),
      T(
        '"We propose to diversify [Category X] from 100% China to 60% nearshore ([Poland or Turkey]) over 18 months. Expected year-1 cost impact: +€[Y]. Expected year 2+ annual cost: +/-€[Z]. Primary benefit: risk-adjusted supply resilience against [listed scenarios]. Capital required: €[tooling + qualification]. Authorisation requested: [Yes/Limit]."',
        { fontSize: 9, color: C.muted, lineHeight: 1.5, fontFamily: 'Helvetica-Oblique', marginBottom: 10 }
      ),
      T('2 · Context & options  (1 page)', { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginBottom: 3 }),
      Bullet('Current state: supplier concentration, recent disruption exposure (Red Sea, tariffs, CBAM), peer benchmark.'),
      Bullet('Options considered: do-nothing · partial diversification (recommended) · aggressive reshoring.'),
      Bullet('Recommended path and why.'),
      V({ marginTop: 6 }),
      T('3 · Financial model  (1 page)', { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginBottom: 3 }),
      T('Summary table + two-page backup. Worked example on next page.', { fontSize: 9, color: C.muted, lineHeight: 1.5, marginBottom: 8 }),
      T('4 · Risks & mitigations  (1 page)', { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginBottom: 3 }),
      T('Top 5 risks with specific mitigations. Full 10-item register on page 14.', { fontSize: 9, color: C.muted, lineHeight: 1.5, marginBottom: 8 }),
      T('5 · Decision points & timeline  (1 page)', { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginBottom: 3 }),
      T('90-day pilot + 18-month ramp. Named gates at months 4, 10, 18. What triggers a stop.', { fontSize: 9, color: C.muted, lineHeight: 1.5, marginBottom: 8 }),
      T('6 · Backup  (appendices)', { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginBottom: 3 }),
      T('TCO model detail · supplier shortlist · country analysis · sensitivity analysis · reference customer calls log.', { fontSize: 9, color: C.muted, lineHeight: 1.5 })
    ),
    T('Current state vs. future state snapshot', styles.h3),
    Table({
      headers: [
        { label: 'Dimension', flex: 1.4 },
        { label: 'Current state', flex: 2 },
        { label: 'Future state (18m)', flex: 2 },
      ],
      rows: [
        ['Country mix', '100% China', '60% nearshore / 40% China'],
        ['Avg lead time', '56–75 days (sea + inland)', '21–28 days (road blended)'],
        ['Landed unit cost (ref SKU)', '€4.80', '€5.36 (blended)'],
        ['Disruption exposure', { text: 'Single-country (high tail risk)', color: C.rose, bold: true }, { text: 'Diversified (moderate)', color: C.emerald, bold: true }],
        ['CBAM exposure (covered)', 'Full on China portion', '40% residual (manageable)'],
        ['Working capital days', '70–90 days inventory', '30–45 days blended'],
      ],
    }),
    Callout('teal', 'Soft benefits that belong in the case',
      'Faster commercial cycle (enabled by shorter lead time) · ESG / CBAM compliance posture · supplier relationship depth (harder to build, easier to lose) · tax optimisation (EU-origin for EU customers) · resilience premium visible in customer contracts.'
    ),
  ])
}

// ---------------------------------------------------------------------------
// PAGE 11 — Worked ROI
// ---------------------------------------------------------------------------
function Page11_ROI() {
  return StandardPage(11, 14, 'Board-Ready Business Case', [
    T('05 · Worked example', styles.eyebrow),
    T('ROI model — machined steel component', styles.h1),
    T(
      'Category: machined steel component · 120,000 units/year · currently 100% from Shenzhen supplier at €4.80/unit landed (EUR). Proposal: diversify 60% to Polish supplier at €6.20/unit landed over 18 months.',
      styles.p
    ),
    // Stats
    V({ flexDirection: 'row', marginTop: 6, marginBottom: 6 },
      StatTile({ value: '120k', label: 'Annual units at risk\n(single-country supply)', color: C.rose }),
      StatTile({ value: '€99.9k', label: 'Year 1 diversification\nspend (one-time + differential)', color: C.amber }),
      StatTile({ value: '~€0', label: 'Year 2+ net annual cost\nin base case (break-even)', color: C.emerald, width: '32%' })
    ),
    T('Year 1 incremental cost (diversification investment)', styles.h3),
    Table({
      headers: [
        { label: 'Cost line', flex: 3 },
        { label: 'Amount', flex: 1.2 },
      ],
      compact: true,
      rows: [
        ['Tooling duplication (2 tools)', { text: '€35,000', bold: true }],
        ['Internal qualification (100h + travel)', { text: '€18,000', bold: true }],
        ['On-site audit (third party)', { text: '€4,500', bold: true }],
        ['First-article inspection', { text: '€3,000', bold: true }],
        ['Unit differential on pilot 20k × €1.40', { text: '€28,000', bold: true }],
        ['Safety stock (60 d × 20k × €4.80 × 20% WACC)', { text: '€6,400', bold: true }],
        ['Commercial / legal setup', { text: '€5,000', bold: true }],
        [{ text: 'Total Year 1 incremental', bold: true, color: C.tealDark }, { text: '€99,900', bold: true, color: C.tealDark }],
      ],
    }),
    // Two-column: premium + benefits
    V({ flexDirection: 'row', marginTop: 6 },
      V({ flex: 1, paddingRight: 8 },
        T('Year 2 steady-state premium', styles.h3),
        T('60% Poland / 40% China', { fontSize: 9, color: C.muted, marginBottom: 4 }),
        T('• Poland: 72k × €6.20 = €446,400', { fontSize: 9, color: C.body, marginBottom: 1 }),
        T('• China: 48k × €4.80 = €230,400', { fontSize: 9, color: C.body, marginBottom: 1 }),
        T('• Total Y2 blended: €676,800', { fontSize: 9, color: C.body, marginBottom: 1 }),
        T('• If 100% China Y2: €576,000', { fontSize: 9, color: C.body, marginBottom: 4 }),
        V({ padding: 6, backgroundColor: C.amberBg, borderRadius: 3 },
          T('Annual premium: €100,800 (+17.5%)', { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.amber })
        ),
      ),
      V({ flex: 1, paddingLeft: 8 },
        T('Year 2+ benefits (annualised)', styles.h3),
        T('• Lead-time reduction (inv. ↓35 d): +€4,800', { fontSize: 9, color: C.body, marginBottom: 1 }),
        T('• Freight saving (Poland vs. China): +€32,400', { fontSize: 9, color: C.body, marginBottom: 1 }),
        T('• CBAM avoidance on Poland portion: +€30,240', { fontSize: 9, color: C.body, marginBottom: 1 }),
        T('• Risk-adjusted disruption EV: +€18,000', { fontSize: 9, color: C.body, marginBottom: 4 }),
        V({ padding: 6, backgroundColor: C.emeraldBg, borderRadius: 3 },
          T('Total Y2+ benefit: €85k–€120k', { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.emerald })
        ),
      )
    ),
    T('Net position — base case and disruption scenarios', styles.h3),
    Table({
      headers: [
        { label: 'Scenario', flex: 2.2 },
        { label: 'Y1 impact', flex: 1 },
        { label: 'Y2 impact', flex: 1 },
        { label: 'Y3 impact', flex: 1 },
        { label: 'Notes', flex: 2.5 },
      ],
      compact: true,
      rows: [
        ['Base case (no disruption)', { text: '-€99.9k', color: C.amber, bold: true }, { text: '-€0.8k', color: C.muted, bold: true }, { text: '-€0.8k', color: C.muted, bold: true }, 'Near break-even year 2+; insurance value not monetised.'],
        ['Red Sea persists year 2–3', { text: '-€99.9k', color: C.amber, bold: true }, { text: '+€14k', color: C.emerald, bold: true }, { text: '+€14k', color: C.emerald, bold: true }, 'Nearshore portion shielded from incremental freight + WC.'],
        ['New US/EU tariff round (10%)', { text: '-€99.9k', color: C.amber, bold: true }, { text: '+€23k', color: C.emerald, bold: true }, { text: '+€23k', color: C.emerald, bold: true }, '10% tariff on China portion, entirely avoided on Poland.'],
        ['CBAM full phase-in 2028', { text: '-€99.9k', color: C.amber, bold: true }, '+€0.8k', { text: '+€45k', color: C.emerald, bold: true }, 'CBAM costs escalate 2027–28 on China-origin steel.'],
        [{ text: 'Combined scenarios (2-of-3)', bold: true, color: C.tealDark }, { text: '-€99.9k', color: C.amber, bold: true }, { text: '+€60k', color: C.emerald, bold: true }, { text: '+€82k', color: C.emerald, bold: true }, '2-year payback, positive NPV at 8% discount.'],
      ],
    }),
    Callout('emerald', 'The insurance framing',
      'In the base case, diversification is approximately cost-neutral after year 1 recovery. Under any of the three disruption scenarios rated >15% probability by 2026 consensus, diversification saves €30–80k annually. This is an insurance investment — the question is which policy, not whether.'
    ),
  ])
}

// ---------------------------------------------------------------------------
// PAGE 12 — Beta Cohort Success Story
// ---------------------------------------------------------------------------
function Page12_SuccessStory() {
  return StandardPage(12, 14, 'Beta Cohort Patterns', [
    T('06 · Pattern 1 of 3 · Success', styles.eyebrow),
    T('Automotive Tier-2: stampings China → Poland + Turkey', styles.h1),
    T(
      'Composite drawn from beta-cohort engagements 2025–2026. No individual company is identifiable; the scenario is a real pattern observed across multiple similar clients.',
      { ...styles.small, fontStyle: 'italic', marginBottom: 8 }
    ),
    // Context tiles
    V({ flexDirection: 'row', marginBottom: 8 },
      StatTile({ value: '€85M', label: 'Revenue, German\nautomotive tier-2', color: C.teal, width: '24%' }),
      StatTile({ value: '70%', label: 'Material from China +\nVietnam pre-migration', color: C.rose, width: '24%' }),
      StatTile({ value: '14 mo', label: 'Migration duration\n(staged, 3 categories)', color: C.sage, width: '24%' }),
      StatTile({ value: '18', label: 'Qualified alternatives\nsurfaced in 3 weeks', color: C.emerald, width: '24%' })
    ),
    T('Context', styles.h3),
    T(
      'A German automotive tier-2 stamping supplier with €85M revenue sourced 70% of raw material (mostly uncoated steel, some aluminium) from Chinese and Vietnamese mills. Red Sea disruption added 12 days and €180k to quarterly freight costs in Q1 2024. Board approved diversification.',
      styles.p
    ),
    T('How Procurea accelerated the process', styles.h3),
    Bullet('Week 1–3: AI-native supplier discovery surfaced 18 qualified alternatives across Poland, Turkey, and Romania (manual discovery would have taken 30 hours per category × 3 categories = 90 hours).'),
    Bullet('Week 4–6: Multilingual outreach (Polish, Turkish, Romanian) yielded 11 RFQ responses — compared to 2–3 typical from English-only outreach.'),
    Bullet('Week 7–12: Procurement team ran RFQ, audit, and qualification on the shortlist (human work — Procurea does not replace this stage).'),
    T('Sequenced migration across 14 months', styles.h3),
    Table({
      headers: [
        { label: 'Category', flex: 1.8 },
        { label: 'From', flex: 1 },
        { label: 'To', flex: 1 },
        { label: 'Unit cost delta', flex: 1.2 },
        { label: 'Offset mechanism', flex: 2.5 },
      ],
      compact: true,
      rows: [
        ['Mild steel stampings', 'China', 'Poland', { text: '€4.50 → €5.10 (+13%)', color: C.amber, bold: true }, '35-day lead time reduction · €28k/qtr freight saving · CBAM avoidance.'],
        ['Aluminium components', 'Vietnam', 'Turkey', { text: '€2.80 → €2.95 (+5%)', color: C.amber, bold: true }, 'EUR-denominated contract · CBAM avoided on Turkey origin (2026 exposure modest).'],
        ['Exotic alloys', 'China (retained)', 'China 30%', { text: 'Neutral', color: C.muted, bold: true }, 'Kept Chinese supplier as hedge at 30% of category volume.'],
      ],
    }),
    // Outcome
    V({ flexDirection: 'row', marginTop: 8 },
      V({ flex: 1, marginRight: 6, padding: 10, backgroundColor: C.amberBg, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: C.amber },
        T('YEAR 1 LANDED COST DELTA', { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.amber, letterSpacing: 1, marginBottom: 4 }),
        T('+€220k vs. baseline', { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.amber, marginBottom: 3 }),
        T('Tooling duplication + qualification + unit differential on pilot volumes.', { fontSize: 8.5, color: C.muted, lineHeight: 1.4 })
      ),
      V({ flex: 1, marginLeft: 6, padding: 10, backgroundColor: C.emeraldBg, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: C.emerald },
        T('YEAR 2 NET POSITION', { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.emerald, letterSpacing: 1, marginBottom: 4 }),
        T('-€40k net benefit', { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.emerald, marginBottom: 3 }),
        T('Freight saving + CBAM avoidance + working capital release.', { fontSize: 8.5, color: C.muted, lineHeight: 1.4 })
      )
    ),
    Callout('teal', 'Lesson learned — why staging mattered',
      'At month 8, the Polish supplier had a 3-month quality issue on one stamping family (coating adhesion). Because the team had deliberately retained 30% Chinese residual on exotic alloys, they could absorb the temporary gap with existing supply rather than a line-down event. The insurance frame paid out, exactly as the business case said it would.'
    ),
  ])
}

// ---------------------------------------------------------------------------
// PAGE 13 — Partial + Failure Stories
// ---------------------------------------------------------------------------
function Page13_PartialFailureStory() {
  return StandardPage(13, 14, 'Beta Cohort Patterns', [
    T('06 · Patterns 2 & 3 of 3 · Partial + failure', styles.eyebrow),
    T('What partially worked, and what did not', styles.h1),
    // Pattern 2
    V({ padding: 10, backgroundColor: C.bgAlt, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: C.teal, marginBottom: 10 },
      T('PATTERN 2 · PARTIAL SUCCESS', { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.teal, letterSpacing: 1, marginBottom: 4 }),
      T('D2C apparel brand: China → Turkey + Portugal', { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginBottom: 6 }),
      T(
        'Mid-market consumer apparel brand (€40M revenue, 120 SKUs) sourced 100% from Chinese CMT partners. 75-day total lead time (60-day CMT + 15-day shipping) was constraining fashion turn rate and driving overstock markdowns.',
        { fontSize: 9.5, color: C.body, lineHeight: 1.5, marginBottom: 8 }
      ),
      T('What worked', { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.emerald, marginBottom: 3 }),
      Bullet('12-month staged move: commodity basics → Turkish CMT (€0.90/min, 21-day lead); premium/design-led → Portuguese CMT (€2.20/min, 30-day lead).'),
      Bullet('Year 1 CMT premium: +€180k. Year 1 offset from reduced markdowns: -€300k. Eliminated air freight: -€80k.'),
      Bullet('Net year 1: €200k improvement — faster design-to-shelf cycle delivered unplanned commercial advantage.'),
      T('What did not work', { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.amber, marginTop: 8, marginBottom: 3 }),
      Bullet('Turkish partner had a minor SMETA finding on working hours — took 4 months to close out to the brand\'s own standard (vs. the partner\'s SMETA-accepted baseline). Overestimated the social-compliance tailwind.'),
      Bullet('MOQ flexibility was narrower than initial conversations suggested — had to consolidate 6 low-volume SKUs into 2 batched runs.'),
      T('Course correction', { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginTop: 8, marginBottom: 3 }),
      Bullet('Added third-party social compliance audit into qualification step (week 5) going forward — catches issues before PO rather than after.'),
      Bullet('Defined MOQ as a hard RFQ field with per-SKU breakdown, not an aggregate number. Disqualified 2 Turkish candidates in the second qualification round as a result.'),
    ),
    // Pattern 3
    V({ padding: 10, backgroundColor: C.roseBg, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: C.rose },
      T('PATTERN 3 · FAILURE → RECOVERY', { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.rose, letterSpacing: 1, marginBottom: 4 }),
      T('B2B electronics OEM: Shenzhen → Hungary (and back, then forward again)', { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginBottom: 6 }),
      T(
        '€150M B2B electronics OEM tried to move mid-complexity PCBA assembly from Shenzhen to Hungary in 6 months. Business case looked good on paper: lead-time reduction, no tariff risk, close to the OEM customer base. They moved too fast, committed 100% volume to one Hungarian supplier, and skipped the pilot stage entirely.',
        { fontSize: 9.5, color: C.body, lineHeight: 1.5, marginBottom: 8 }
      ),
      T('What broke', { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.rose, marginBottom: 3 }),
      Bullet('Supplier\'s ERP could not handle variant complexity (240 variants across 15 product lines).'),
      Bullet('Month 4 saw delivery failures on 30% of POs — direct impact on OEM customer commitments.'),
      Bullet('No China parallel supply: every missed PO was unrecoverable in that month.'),
      T('Recovery', { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginTop: 8, marginBottom: 3 }),
      Bullet('Paused the migration. Moved back to 70% China for critical SKUs — damaging the supplier relationship they had spent 4 months building.'),
      Bullet('Restarted with 30% Hungary on the 50 highest-volume variants only (not the long tail).'),
      Bullet('18 months later: steady state at 50/50, but with a 6-month delay and a €320k cost overrun vs. original business case.'),
      T('What this teaches', { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginTop: 8, marginBottom: 3 }),
      T(
        'The playbook sequencing (pilot 15–25% → parallel 40–60% → ramp 60–80%) is not a suggestion. Skipping the pilot stage is the most common failure mode in the beta cohort, and it is why the 90-day plan on page 8 exists. Variant complexity is the single most under-estimated parameter in electronics nearshoring.',
        { fontSize: 9.5, color: C.body, lineHeight: 1.5, fontFamily: 'Helvetica-Oblique' }
      )
    ),
  ])
}

// ---------------------------------------------------------------------------
// PAGE 14 — Procurea CTA + Next Steps
// ---------------------------------------------------------------------------
function Page14_CTA() {
  return h(Page, { size: 'A4', style: styles.page },
    Header({ section: 'Next Steps' }),
    T('07 · How Procurea accelerates this playbook', styles.eyebrow),
    T('Compress 30 hours into 30 minutes', styles.h1),
    T(
      'The qualification stage of this playbook (weeks 3–6) is where nearshoring programs traditionally stall. Manual supplier discovery across 6 countries × 26 languages takes 30 hours per category; by the time a buyer has a defensible short-list, the quarter is gone. Procurea is an AI-native supplier discovery and outreach platform built specifically for this stage.',
      styles.p
    ),
    // Three columns of differentiators
    V({ flexDirection: 'row', marginTop: 8, marginBottom: 10 },
      V({ flex: 1, marginRight: 6, padding: 12, backgroundColor: C.bgAlt, borderRadius: 4, borderTopWidth: 3, borderTopColor: C.teal },
        h(Svg, { width: 18, height: 18, viewBox: '0 0 20 20' },
          h(Circle, { cx: 8, cy: 8, r: 5, stroke: C.teal, strokeWidth: 1.5, fill: 'none' }),
          h(Path, { d: 'M 12 12 L 16 16', stroke: C.teal, strokeWidth: 1.5 })
        ),
        T('AI sourcing', { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginTop: 6, marginBottom: 4 }),
        T(
          '100–250 verified suppliers per campaign in 26 languages. Finds candidates your team would not surface manually — especially in Turkish, Polish, Romanian, Czech, Hungarian commercial directories.',
          { fontSize: 8.5, color: C.body, lineHeight: 1.5 }
        )
      ),
      V({ flex: 1, marginHorizontal: 6, padding: 12, backgroundColor: C.bgAlt, borderRadius: 4, borderTopWidth: 3, borderTopColor: C.teal },
        h(Svg, { width: 18, height: 18, viewBox: '0 0 20 20' },
          h(Path, { d: 'M 3 6 L 10 12 L 17 6 M 3 6 L 3 16 L 17 16 L 17 6', stroke: C.teal, strokeWidth: 1.5, fill: 'none' })
        ),
        T('Multilingual outreach', { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginTop: 6, marginBottom: 4 }),
        T(
          'Native-language initial contact improves response rate 3–5× vs. English-only outreach to nearshore suppliers. Templates tuned for commercial vs. technical decision-makers.',
          { fontSize: 8.5, color: C.body, lineHeight: 1.5 }
        )
      ),
      V({ flex: 1, marginLeft: 6, padding: 12, backgroundColor: C.bgAlt, borderRadius: 4, borderTopWidth: 3, borderTopColor: C.teal },
        h(Svg, { width: 18, height: 18, viewBox: '0 0 20 20' },
          h(Rect, { x: 3, y: 3, width: 14, height: 14, stroke: C.teal, strokeWidth: 1.5, fill: 'none' }),
          h(Path, { d: 'M 6 10 L 9 13 L 14 7', stroke: C.teal, strokeWidth: 1.5, fill: 'none' })
        ),
        T('Offer comparison', { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginTop: 6, marginBottom: 4 }),
        T(
          'Side-by-side scoring on capability, capacity, certifications, lead time, and landed cost. Outputs feed directly into the Vendor Scoring Framework and the business case.',
          { fontSize: 8.5, color: C.body, lineHeight: 1.5 }
        )
      )
    ),
    // Big CTA
    V({ padding: 20, backgroundColor: C.tealDeep, borderRadius: 6, marginTop: 4 },
      T('BOOK A 30-MINUTE NEARSHORING STRATEGY CALL', { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.sageLight, letterSpacing: 1.2, marginBottom: 6 }),
      T('Talk to a Procurea specialist about your first pilot category.', { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 4, letterSpacing: -0.3 }),
      T('We will pressure-test your country shortlist, flag obvious qualification risks, and show what 100–250 verified suppliers look like for your specific spend profile. No pitch — the call is useful whether you end up using Procurea or not.', { fontSize: 9.5, color: C.sageLight, lineHeight: 1.55, marginBottom: 10 }),
      V({ flexDirection: 'row', alignItems: 'center' },
        V({ flex: 1, paddingVertical: 9, paddingHorizontal: 14, backgroundColor: C.sage, borderRadius: 4, alignItems: 'center', marginRight: 10 },
          T('procurea.io/strategy-call', { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.tealDeep })
        ),
        // QR placeholder: stylised
        V({ width: 60, height: 60, backgroundColor: C.white, padding: 4, borderRadius: 3 },
          h(Svg, { width: 52, height: 52, viewBox: '0 0 10 10' },
            // corner squares
            h(Rect, { x: 0, y: 0, width: 3, height: 3, fill: C.tealDeep }),
            h(Rect, { x: 1, y: 1, width: 1, height: 1, fill: C.white }),
            h(Rect, { x: 7, y: 0, width: 3, height: 3, fill: C.tealDeep }),
            h(Rect, { x: 8, y: 1, width: 1, height: 1, fill: C.white }),
            h(Rect, { x: 0, y: 7, width: 3, height: 3, fill: C.tealDeep }),
            h(Rect, { x: 1, y: 8, width: 1, height: 1, fill: C.white }),
            // scattered dots to look QR-ish
            h(Rect, { x: 4, y: 1, width: 1, height: 1, fill: C.tealDeep }),
            h(Rect, { x: 5, y: 2, width: 1, height: 1, fill: C.tealDeep }),
            h(Rect, { x: 6, y: 4, width: 1, height: 1, fill: C.tealDeep }),
            h(Rect, { x: 4, y: 5, width: 1, height: 1, fill: C.tealDeep }),
            h(Rect, { x: 5, y: 6, width: 1, height: 1, fill: C.tealDeep }),
            h(Rect, { x: 7, y: 5, width: 1, height: 1, fill: C.tealDeep }),
            h(Rect, { x: 8, y: 7, width: 1, height: 1, fill: C.tealDeep }),
            h(Rect, { x: 4, y: 8, width: 1, height: 1, fill: C.tealDeep }),
            h(Rect, { x: 6, y: 9, width: 1, height: 1, fill: C.tealDeep }),
            h(Rect, { x: 8, y: 8, width: 1, height: 1, fill: C.tealDeep }),
            h(Rect, { x: 5, y: 4, width: 1, height: 1, fill: C.tealDeep }),
            h(Rect, { x: 3, y: 6, width: 1, height: 1, fill: C.tealDeep })
          )
        )
      )
    ),
    T('Also in the Procurea resource library', styles.h3),
    Bullet(RichText([{ text: 'Supplier Risk Checklist 2026 ', bold: true, color: C.tealDark }, '— the 20-point qualification audit used by the beta cohort.'], { fontSize: 9.5, color: C.body })),
    Bullet(RichText([{ text: 'RFQ Comparison Template ', bold: true, color: C.tealDark }, '— side-by-side offer scoring sheet (XLSX).'], { fontSize: 9.5, color: C.body })),
    Bullet(RichText([{ text: 'Vendor Scoring Framework ', bold: true, color: C.tealDark }, '— 10-criteria framework with sample scorecards.'], { fontSize: 9.5, color: C.body })),
    Bullet(RichText([{ text: 'TCO Calculator ', bold: true, color: C.tealDark }, '— landed-cost model with CBAM, freight, tariff inputs.'], { fontSize: 9.5, color: C.body })),
    V({ marginTop: 14, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: C.line, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
      V({},
        T('Feedback on this playbook', { fontSize: 8.5, color: C.muted, marginBottom: 2 }),
        T('hello@procurea.io', { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.tealDark })
      ),
      V({ alignItems: 'flex-end' },
        T('Next revision', { fontSize: 8.5, color: C.muted, marginBottom: 2 }),
        T('October 2026', { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.tealDark })
      )
    ),
    Footer({ pageNum: 14, totalPages: 14 })
  )
}

// ---------------------------------------------------------------------------
// PAGE 15 — Full Risk Register (appendix)
// ---------------------------------------------------------------------------
function Page15_RiskRegister() {
  return StandardPage(15, 16, 'Appendix · Risk Register', [
    T('Appendix A · Consolidated risk register', styles.eyebrow),
    T('Top 10 risks across the program', styles.h1),
    T(
      'Aggregate view of the risks flagged throughout the playbook. Assign a named owner per risk before Stage 1 kickoff. Review at each stage gate (months 4, 10, 24).',
      styles.p
    ),
    Table({
      headers: [
        { label: '#', flex: 0.4 },
        { label: 'Risk', flex: 3.2 },
        { label: 'Likelihood', flex: 1 },
        { label: 'Impact', flex: 1 },
        { label: 'Mitigation', flex: 4 },
      ],
      compact: true,
      rows: [
        ['1', 'New supplier quality ramp slower than planned', { text: 'High', color: C.rose }, { text: 'High', color: C.rose }, 'Keep China active through parallel stage (6+ months). Do not burn bridges until 3 consecutive clean months from nearshore.'],
        ['2', 'Tooling transfer damage or delay', { text: 'Medium', color: C.amber }, { text: 'High', color: C.rose }, 'Duplicate tools where possible rather than transfer. Insure in transit. Plan for 20% rework budget.'],
        ['3', 'Cost overrun in year 1', { text: 'High', color: C.rose }, { text: 'Medium', color: C.amber }, 'Use this playbook\'s ROI model honestly. CFO alignment on "insurance cost" framing. Stage gates prevent runaway spend.'],
        ['4', 'Nearshore supplier insolvency during ramp', { text: 'Low', color: C.emerald }, { text: 'High', color: C.rose }, 'Financial health check in qualification. Avoid suppliers with single-customer >60% concentration.'],
        ['5', 'Key person dependency at new supplier', { text: 'Medium', color: C.amber }, { text: 'Medium', color: C.amber }, 'Identify commercial lead + technical lead + escalation path before first PO.'],
        ['6', 'Currency volatility (TRY, PLN, HUF)', { text: 'Medium/High', color: C.amber }, { text: 'Medium', color: C.amber }, 'EUR-denominated quotes where supplier accepts. Hedge 12-month contracts. Forward contracts for large POs.'],
        ['7', 'Capacity constraints at preferred supplier', { text: 'Medium', color: C.amber }, { text: 'Medium', color: C.amber }, 'Qualify 2+ suppliers per category. Do not commit all volume to a single nearshore before proven.'],
        ['8', 'Labour cost inflation (Poland, Czechia)', { text: 'Medium', color: C.amber }, { text: 'Medium', color: C.amber }, 'Build 4–6% annual escalation into contracts. Revisit country mix in 3-year review.'],
        ['9', 'Logistics disruption specific to new route', { text: 'Low', color: C.emerald }, { text: 'Medium', color: C.amber }, 'Dual-route for first 12 months. Named backup freight forwarder. Trial shipment before first PO.'],
        ['10', 'Internal change fatigue (buyer + stakeholders)', { text: 'High', color: C.rose }, { text: 'Medium', color: C.amber }, 'Limit simultaneous pilots to 1–2. Celebrate wins explicitly. Resource qualification work with BAU backfill.'],
      ],
    }),
    T('Risk ownership template', styles.h3),
    Table({
      headers: [
        { label: 'Risk #', flex: 0.7 },
        { label: 'Owner (named)', flex: 1.5 },
        { label: 'Review cadence', flex: 1.2 },
        { label: 'Trigger for escalation', flex: 2.5 },
      ],
      compact: true,
      rows: [
        ['1, 2, 9', 'Category manager', 'Weekly (wks 1–13)', 'Any missed delivery or quality sign-off delay >5 days.'],
        ['3, 8', 'Procurement head + CFO', 'Monthly', 'Cumulative spend variance >15% vs. business case.'],
        ['4, 6', 'Procurement head', 'Quarterly', 'Supplier Days-Sales-Outstanding >90 or FX move >10%.'],
        ['5, 7', 'Category manager', 'Weekly', 'Supplier key person departure or capacity dropping <20% headroom.'],
        ['10', 'Supply chain director', 'Monthly', 'Buyer utilisation >85% sustained 4+ weeks.'],
      ],
    }),
    Callout('teal', 'Use this as a living document',
      'Update risk status colours at each stage gate. Risks do not disappear — they downgrade. A "mitigated" risk that drops off the register is usually a risk that re-emerges at a later stage.'
    ),
  ])
}

// ---------------------------------------------------------------------------
// PAGE 16 — Resources
// ---------------------------------------------------------------------------
function Page16_Resources() {
  return StandardPage(16, 16, 'Appendix · Resources', [
    T('Appendix B · Discovery resources', styles.eyebrow),
    T('Where to find verified nearshore suppliers', styles.h1),
    T(
      'The AI discovery tools (Procurea included) go broad; these directories and certification databases go deep. Use them for secondary verification after the shortlist is built.',
      styles.p
    ),
    T('Country-level supplier directories', styles.h3),
    Table({
      headers: [
        { label: 'Country', flex: 1 },
        { label: 'Directory', flex: 1.8 },
        { label: 'Best for', flex: 3 },
      ],
      rows: [
        ['Poland', 'panorama-firm.pl · polskieprzemysl.pl', 'General industrial + metals workshops in Upper Silesia, Podkarpacie (aviation), Wielkopolska.'],
        ['Germany adj.', 'WLW.de (Wer liefert was)', 'German-language DACH directory; includes Czech and Polish suppliers serving DACH.'],
        ['Turkey', 'sanayi.gov.tr · turkishexporter.net', 'Ministry registry + export-focused directory; strong for textiles, aluminium, white goods.'],
        ['Portugal', 'aicep.pt · anivec.com (textiles)', 'Trade agency registry + sector associations (ANIVEC for apparel, APICCAPS for footwear).'],
        ['Romania', 'listafirme.ro · anis.ro', 'Commercial registry + automotive supplier association (ANIS).'],
        ['Hungary', 'cegjegyzek.hu · mgksz.hu', 'Commercial registry + automotive industry association.'],
        ['Czechia', 'firmy.cz · avchip.cz', 'General directory + automotive association (Czech pendant to VDA).'],
      ],
    }),
    T('Certification & compliance databases', styles.h3),
    Table({
      headers: [
        { label: 'Database', flex: 1.4 },
        { label: 'Scope', flex: 3.6 },
      ],
      rows: [
        [{ text: 'IAF CertSearch', bold: true, color: C.tealDark }, 'Free global lookup for ISO 9001, ISO 14001, IATF 16949 certificates. Cross-check what suppliers claim.'],
        [{ text: 'OEKO-TEX Buying Guide', bold: true, color: C.tealDark }, 'Certified textile manufacturers by country, material, and OEKO-TEX standard.'],
        [{ text: 'GOTS Public Database', bold: true, color: C.tealDark }, 'Global Organic Textile Standard certified entities, filterable by country and product type.'],
        [{ text: 'SEDEX (SMETA audits)', bold: true, color: C.tealDark }, 'Social compliance audit database. Buyer-side access required — check with your ESG team.'],
        [{ text: 'EU Whoiswho (REACH/CE)', bold: true, color: C.tealDark }, 'ECHA register for REACH-compliant substances and manufacturers.'],
        [{ text: 'Creditreform / Dun & Bradstreet', bold: true, color: C.tealDark }, 'Financial health reports; essential for Risk #4 (supplier insolvency) due diligence.'],
      ],
    }),
    T('Further reading from the Procurea library', styles.h3),
    Bullet('European Nearshoring Guide 2026 — sector-by-sector deep dives published quarterly.'),
    Bullet('China+1 Strategy: When It Works, When It Does Not — 12 case studies across 4 industries.'),
    Bullet('Turkey vs. Poland vs. Portugal for Textiles — detailed head-to-head on fashion and technical textiles.'),
    Bullet('CBAM Practical Guide — exposure calculator + supplier data collection template.'),
    Bullet('Multilingual RFQ Templates — Turkish, Polish, Romanian, Czech, Hungarian, Portuguese variants.'),
    Callout('teal', 'A note on source reliability',
      'Directories capture what companies report about themselves. Certifications are verified by third parties but can be stale (check issue date). The only source of truth for supplier capability is an audit — directories tell you where to start looking, not where to commit.'
    ),
    V({ marginTop: 16, padding: 12, backgroundColor: C.bgAlt, borderRadius: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
      V({ flex: 1 },
        T('Thank you for reading.', { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.tealDark, marginBottom: 2 }),
        T('Send feedback, corrections, and field reports to hello@procurea.io. This playbook is revised every six months; reader input shapes what ships next.', { fontSize: 9, color: C.muted, lineHeight: 1.5 })
      ),
      V({ marginLeft: 14 }, Wordmark({ color: C.tealDark, size: 14 }))
    ),
  ])
}

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------
const MyDoc = h(
  Document,
  {
    title: 'Nearshore Migration Playbook — China+1 Made Practical',
    author: 'Procurea',
    subject: 'The operator\'s playbook for diversifying supply chain from single-country dependency.',
    keywords: 'nearshoring, china+1, supply chain, procurement, sourcing, europe, turkey, poland, czechia, hungary, romania, portugal',
    creator: 'Procurea',
    producer: 'Procurea / @react-pdf/renderer',
  },
  CoverPage(),
  ExecutiveSummaryPage(),
  Page3_Countries(),
  Page4_Heatmap(),
  Page5_RedFlags(),
  Page6_TextilesElectronics(),
  Page7_MetalsPlastics(),
  Page8_Sequencing(),
  Page9_PhaseRisks(),
  Page10_BusinessCase(),
  Page11_ROI(),
  Page12_SuccessStory(),
  Page13_PartialFailureStory(),
  Page14_CTA(),
  Page15_RiskRegister(),
  Page16_Resources()
)

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
async function main() {
  console.log('\n\x1b[1m\x1b[36mNearshore Migration Playbook — PDF Generator\x1b[0m')
  console.log('═'.repeat(50))
  console.log(`  Target: ${OUT_FILE}`)
  console.log('  Rendering…')

  const start = Date.now()
  await renderToFile(MyDoc, OUT_FILE)
  const dur = ((Date.now() - start) / 1000).toFixed(2)

  const { size } = statSync(OUT_FILE)
  const sizeKb = (size / 1024).toFixed(1)
  const sizeMb = (size / 1024 / 1024).toFixed(2)
  console.log(`  ✓ Rendered in ${dur}s`)
  console.log(`  ✓ File size: ${sizeKb} KB (${sizeMb} MB)`)
  console.log(`  ✓ Output:    ${OUT_FILE}`)
  console.log('\nDone.\n')
}

main().catch((err) => {
  console.error('\n✗ PDF generation failed:', err)
  process.exit(1)
})
