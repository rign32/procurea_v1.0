#!/usr/bin/env node
/**
 * Generates the Vendor Scoring Framework PDF lead magnet.
 *
 * Usage:
 *   node scripts/generate-vendor-scoring-framework.mjs
 *
 * Output:
 *   public/resources/downloads/vendor-scoring-framework/vendor-scoring-framework.pdf
 */

import { createElement as h } from 'react'
import { Document, Page, Text, View, StyleSheet, pdf, Svg, Path, Circle, Rect, Line, G } from '@react-pdf/renderer'
import { writeFileSync, mkdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'public/resources/downloads/vendor-scoring-framework')
const OUT_FILE = join(OUT_DIR, 'vendor-scoring-framework.pdf')

// ============================================================
// Brand palette
// ============================================================
const COLORS = {
  teal: '#5E8C8F',
  tealDark: '#2A5C5D',
  tealLight: '#E8F0F0',
  ink: '#0F172B',
  body: '#1E293B',
  muted: '#64748B',
  border: '#E2E8F0',
  light: '#F8FAFC',
  rowAlt: '#F1F5F9',
  amber: '#F59E0B',
  amberBg: '#FEF3C7',
  emerald: '#10B981',
  emeraldBg: '#D1FAE5',
  rose: '#F43F5E',
  roseBg: '#FFE4E6',
  white: '#FFFFFF',
}

// ============================================================
// Stylesheet
// ============================================================
const styles = StyleSheet.create({
  // pages
  page: {
    paddingTop: 62,
    paddingBottom: 52,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.body,
    lineHeight: 1.5,
  },
  cover: {
    padding: 0,
    backgroundColor: COLORS.teal,
    color: COLORS.white,
    fontFamily: 'Helvetica',
  },

  // header/footer
  pageHeader: {
    position: 'absolute',
    top: 22,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    color: COLORS.muted,
    fontSize: 8,
  },
  pageHeaderTitle: {
    fontFamily: 'Helvetica-Bold',
    color: COLORS.tealDark,
    fontSize: 8.5,
  },
  pageHeaderRight: { color: COLORS.muted, fontSize: 8 },
  pageFooter: {
    position: 'absolute',
    bottom: 22,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: COLORS.muted,
  },

  // typography
  h1: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: COLORS.tealDark,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 15,
    color: COLORS.teal,
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11.5,
    color: COLORS.tealDark,
    marginTop: 8,
    marginBottom: 4,
  },
  p: {
    fontSize: 10,
    marginBottom: 6,
    color: COLORS.body,
    lineHeight: 1.55,
  },
  pSmall: { fontSize: 9, color: COLORS.body, lineHeight: 1.45 },
  bold: { fontFamily: 'Helvetica-Bold' },
  emphasis: { fontFamily: 'Helvetica-Bold', color: COLORS.tealDark },
  muted: { color: COLORS.muted, fontSize: 9 },

  // lists
  bullet: { flexDirection: 'row', marginBottom: 3, paddingLeft: 2 },
  bulletDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.teal,
    marginTop: 5,
    marginRight: 7,
  },
  bulletText: { flex: 1, fontSize: 10, color: COLORS.body, lineHeight: 1.5 },

  // callouts
  callout: {
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.teal,
    backgroundColor: COLORS.tealLight,
    marginVertical: 6,
    borderRadius: 3,
  },
  calloutAmber: {
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.amber,
    backgroundColor: COLORS.amberBg,
    marginVertical: 6,
    borderRadius: 3,
  },
  calloutEmerald: {
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.emerald,
    backgroundColor: COLORS.emeraldBg,
    marginVertical: 6,
    borderRadius: 3,
  },
  calloutLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: COLORS.tealDark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },

  // tables
  table: { marginVertical: 6, borderRadius: 3, overflow: 'hidden' },
  thead: {
    flexDirection: 'row',
    backgroundColor: COLORS.teal,
  },
  th: {
    color: COLORS.white,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tr: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  trAlt: { flexDirection: 'row', backgroundColor: COLORS.rowAlt, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  td: { paddingVertical: 5, paddingHorizontal: 6, fontSize: 9, color: COLORS.body },
})

// ============================================================
// Shared sub-components
// ============================================================
const Bullet = (text) =>
  h(View, { style: styles.bullet },
    h(View, { style: styles.bulletDot }),
    h(Text, { style: styles.bulletText }, text)
  )

const Callout = (label, text, variant = 'teal') => {
  const style =
    variant === 'amber' ? styles.calloutAmber :
    variant === 'emerald' ? styles.calloutEmerald :
    styles.callout
  return h(View, { style },
    h(Text, { style: styles.calloutLabel }, label),
    typeof text === 'string' ? h(Text, { style: styles.pSmall }, text) : text
  )
}

const PageHeader = (title) =>
  h(View, { style: styles.pageHeader, fixed: true },
    h(Text, { style: styles.pageHeaderTitle }, title),
    h(Text, { style: styles.pageHeaderRight }, 'procurea.io')
  )

const PageFooter = () =>
  h(View, { style: styles.pageFooter, fixed: true },
    h(Text, null, 'Vendor Scoring Framework — Published April 2026'),
    h(Text, {
      render: ({ pageNumber, totalPages }) =>
        `Page ${pageNumber} of ${totalPages}`,
    })
  )

// ============================================================
// Page 1 — Cover
// ============================================================
function CoverPage() {
  return h(Page, { size: 'A4', style: styles.cover },
    // Decorative shapes (svg)
    h(View, { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } },
      h(Svg, { width: '595', height: '842', viewBox: '0 0 595 842' },
        // corner accents
        h(Circle, { cx: '520', cy: '80', r: '180', fill: '#4C7578', opacity: 0.35 }),
        h(Circle, { cx: '80', cy: '720', r: '220', fill: '#4C7578', opacity: 0.3 }),
        h(Rect, { x: '48', y: '180', width: '60', height: '4', fill: '#FFFFFF' }),
      )
    ),
    // Top mark
    h(View, { style: { position: 'absolute', top: 48, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between' } },
      h(Text, { style: { color: COLORS.white, fontSize: 11, fontFamily: 'Helvetica-Bold', letterSpacing: 1.5 } }, 'PROCUREA'),
      h(Text, { style: { color: COLORS.white, fontSize: 9, opacity: 0.75, letterSpacing: 0.8 } }, 'FRAMEWORK · v1.0')
    ),
    // Centered title block
    h(View, { style: { position: 'absolute', top: 270, left: 48, right: 48 } },
      h(Text, { style: { color: COLORS.white, fontSize: 10, opacity: 0.82, letterSpacing: 2.5, marginBottom: 14 } },
        'PROCUREMENT TOOLKIT · 2026 EDITION'),
      h(Text, { style: { color: COLORS.white, fontSize: 42, fontFamily: 'Helvetica-Bold', letterSpacing: -1.2, lineHeight: 1.05, marginBottom: 14 } },
        'Vendor Scoring Framework'),
      h(Text, { style: { color: COLORS.white, fontSize: 16, opacity: 0.92, fontFamily: 'Helvetica-Oblique', letterSpacing: -0.2, marginBottom: 22 } },
        '10-Criteria Template for Fair,\nAudit-Defensible Supplier Evaluation'),
      h(View, { style: { height: 2, width: 80, backgroundColor: COLORS.white, marginBottom: 22 } }),
      h(Text, { style: { color: COLORS.white, fontSize: 11, opacity: 0.92, lineHeight: 1.6, maxWidth: 430 } },
        'Three tiers, anchored 1-5 rubrics, weighting templates by category archetype, and a worked example that survives audit review.')
    ),
    // bottom meta
    h(View, { style: { position: 'absolute', bottom: 54, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' } },
      h(View, null,
        h(Text, { style: { color: COLORS.white, fontSize: 8.5, opacity: 0.72, letterSpacing: 1.2, marginBottom: 4 } }, 'PUBLISHED'),
        h(Text, { style: { color: COLORS.white, fontSize: 11, fontFamily: 'Helvetica-Bold' } }, 'April 2026'),
      ),
      h(View, null,
        h(Text, { style: { color: COLORS.white, fontSize: 8.5, opacity: 0.72, letterSpacing: 1.2, marginBottom: 4 } }, 'AUTHOR'),
        h(Text, { style: { color: COLORS.white, fontSize: 11, fontFamily: 'Helvetica-Bold' } }, 'Procurea Research'),
      ),
      h(View, null,
        h(Text, { style: { color: COLORS.white, fontSize: 8.5, opacity: 0.72, letterSpacing: 1.2, marginBottom: 4 } }, 'WEB'),
        h(Text, { style: { color: COLORS.white, fontSize: 11, fontFamily: 'Helvetica-Bold' } }, 'procurea.io'),
      )
    )
  )
}

// ============================================================
// Page 2 — Intro + TOC
// ============================================================
function IntroTocPage() {
  const tocItems = [
    ['1', 'Why ad-hoc scoring fails audit', 2],
    ['2', 'The 10 criteria overview + three-tier structure', 3],
    ['3', 'Tier 1 — Universal criteria (Price, Quality, Lead Time, Capacity, Financial)', 4],
    ['4', 'Tier 2 — Compliance criteria (Certifications, ESG, Cyber)', 7],
    ['5', 'Tier 3 — Strategic criteria (Commercial Terms, Responsiveness)', 9],
    ['6', 'Weighting templates by category archetype', 10],
    ['7', 'Worked example — LED driver RFQ, 4 suppliers', 12],
    ['8', 'Audit trail template + calibration procedure', 13],
    ['9', 'Automate with Procurea', 15],
  ]

  return h(Page, { size: 'A4', style: styles.page },
    PageHeader('Vendor Scoring Framework'),
    h(Text, { style: styles.h1 }, 'Why ad-hoc scoring fails audit'),
    h(Text, { style: styles.p },
      h(Text, { style: styles.emphasis }, 'Most procurement teams reinvent their scoring criteria every time a new category comes up. '),
      'Six weeks later the buyer can\'t remember why Supplier B beat Supplier A, Internal Audit can\'t reconstruct the decision, and the next buyer rebuilds the framework from a blank sheet.'
    ),
    h(Text, { style: styles.p },
      h(Text, { style: styles.bold }, 'Inconsistency between analysts. '),
      'Two buyers scoring the same supplier on "Quality" will disagree by 1-2 points because neither has a shared definition of what a 3 looks like versus a 5. On a single RFQ this is noise. Across a panel of 200 suppliers this is unusable data.'
    ),
    h(Text, { style: styles.p },
      h(Text, { style: styles.bold }, 'No audit defensibility. '),
      'When Internal Audit or a regulator asks why Supplier B was awarded over Supplier A, the answer is usually a defensive email rather than a scoring document. This fails audit review in regulated industries and creates exposure even where it does not.'
    ),
    h(Text, { style: styles.p },
      h(Text, { style: styles.bold }, 'Criterion drift across RFQs. '),
      'The 2024 RFQ for stamped parts used "price, quality, lead time." The 2025 RFQ used "cost, timeliness, certifications." They aren\'t comparable. A category strategy built on non-comparable data is a category strategy built on sand.'
    ),

    Callout('Who this framework is for',
      'Category managers, procurement directors, and Internal Audit functions who need defensible supplier selection across commodity, strategic, regulated, and service categories — from teams of 1-2 buyers scaling into a full procurement function.',
      'emerald'
    ),

    h(Text, { style: [styles.h2, { marginTop: 18 }] }, 'Table of contents'),
    h(View, { style: { marginTop: 6 } },
      ...tocItems.map(([n, label, page]) =>
        h(View, { key: n, style: { flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: COLORS.border } },
          h(Text, { style: { width: 20, fontFamily: 'Helvetica-Bold', color: COLORS.teal } }, n),
          h(Text, { style: { flex: 1, color: COLORS.body } }, label),
          h(Text, { style: { color: COLORS.muted, fontFamily: 'Helvetica-Bold' } }, `p. ${page}`),
        )
      )
    ),

    PageFooter()
  )
}

// ============================================================
// Page 3 — The 10 Criteria overview
// ============================================================
function CriteriaOverviewPage() {
  const criteria = [
    { n: 1, name: 'Unit Price', tier: 'Universal', desc: 'Normalised unit price vs. bidder cohort' },
    { n: 2, name: 'Quality', tier: 'Universal', desc: 'PPM defect rate + QMS maturity' },
    { n: 3, name: 'Lead Time', tier: 'Universal', desc: 'On-time delivery reliability' },
    { n: 4, name: 'Capacity', tier: 'Universal', desc: 'Headroom + scalability plan' },
    { n: 5, name: 'Financial Health', tier: 'Universal', desc: 'Creditworthiness + runway' },
    { n: 6, name: 'Certifications', tier: 'Compliance', desc: 'Sector certs valid + verified' },
    { n: 7, name: 'ESG Posture', tier: 'Compliance', desc: 'CSRD/CSDDD readiness' },
    { n: 8, name: 'Cyber Security', tier: 'Compliance', desc: 'ISO 27001 / SOC 2 + IR plan' },
    { n: 9, name: 'Commercial Terms', tier: 'Strategic', desc: 'Payment + contract flexibility' },
    { n: 10, name: 'Responsiveness', tier: 'Strategic', desc: 'Reply latency + account depth' },
  ]
  const tierColor = (t) =>
    t === 'Universal' ? COLORS.teal :
    t === 'Compliance' ? COLORS.amber :
    '#8B5CF6'

  return h(Page, { size: 'A4', style: styles.page },
    PageHeader('Vendor Scoring Framework'),

    h(Text, { style: styles.h1 }, 'The 10 criteria at a glance'),
    h(Text, { style: styles.p },
      'Every supplier is scored 1-5 across ten criteria grouped into three tiers. Universal criteria are mandatory in every scorecard. Compliance criteria are mandatory wherever regulated or ESG-exposed. Strategic criteria distinguish good suppliers from great ones.'
    ),

    // Grid of 10 criteria cards
    h(View, { style: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 } },
      ...criteria.map(c =>
        h(View, {
          key: c.n,
          style: {
            width: '20%',
            padding: 4,
          },
        },
          h(View, {
            style: {
              borderWidth: 1,
              borderColor: COLORS.border,
              borderTopWidth: 3,
              borderTopColor: tierColor(c.tier),
              borderRadius: 4,
              padding: 7,
              minHeight: 108,
            },
          },
            h(View, {
              style: {
                width: 22, height: 22, borderRadius: 11,
                backgroundColor: tierColor(c.tier),
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 5,
              },
            },
              h(Text, { style: { color: COLORS.white, fontSize: 10, fontFamily: 'Helvetica-Bold' } }, String(c.n)),
            ),
            h(Text, { style: { fontFamily: 'Helvetica-Bold', fontSize: 9.5, color: COLORS.tealDark, marginBottom: 3 } }, c.name),
            h(Text, { style: { fontSize: 7.5, color: tierColor(c.tier), fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 } }, c.tier),
            h(Text, { style: { fontSize: 8, color: COLORS.muted, lineHeight: 1.35 } }, c.desc),
          )
        )
      )
    ),

    // legend
    h(View, { style: { flexDirection: 'row', marginTop: 14, gap: 16 } },
      h(View, { style: { flexDirection: 'row', alignItems: 'center', marginRight: 18 } },
        h(View, { style: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.teal, marginRight: 6 } }),
        h(Text, { style: { fontSize: 8.5, color: COLORS.body } }, 'Tier 1 — Universal'),
      ),
      h(View, { style: { flexDirection: 'row', alignItems: 'center', marginRight: 18 } },
        h(View, { style: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.amber, marginRight: 6 } }),
        h(Text, { style: { fontSize: 8.5, color: COLORS.body } }, 'Tier 2 — Compliance'),
      ),
      h(View, { style: { flexDirection: 'row', alignItems: 'center' } },
        h(View, { style: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#8B5CF6', marginRight: 6 } }),
        h(Text, { style: { fontSize: 8.5, color: COLORS.body } }, 'Tier 3 — Strategic'),
      ),
    ),

    h(Text, { style: [styles.h2, { marginTop: 20 }] }, 'Three-tier structure, explained'),
    h(Text, { style: styles.p },
      h(Text, { style: styles.bold }, 'Universal (1-5): '),
      'what every supplier in every category must be scored on. Absent any of these five, you don\'t have a scorecard — you have a preference.'
    ),
    h(Text, { style: styles.p },
      h(Text, { style: styles.bold }, 'Compliance (6-8): '),
      'what you must score to defend the decision. Auditors, regulators, and your legal team will ask about these. Absent scoring, you risk an award that cannot be defended.'
    ),
    h(Text, { style: styles.p },
      h(Text, { style: styles.bold }, 'Strategic (9-10): '),
      'what distinguishes a good supplier from a great one — weighted higher for strategic categories, lower for commodity.'
    ),

    Callout('Rule of thumb',
      'Weights within each tier should reflect category archetype. Page 7 gives the four template starting points — commodity, strategic, regulated, service. Document every weight you change.',
      'teal'
    ),

    PageFooter()
  )
}

// ============================================================
// Criterion detail block (reusable)
// ============================================================
function CriterionBlock({ n, name, tier, what, why, rubric, verify, mistake }) {
  const tierColor =
    tier === 'Universal' ? COLORS.teal :
    tier === 'Compliance' ? COLORS.amber :
    '#8B5CF6'
  return h(View, { wrap: false, style: { marginBottom: 14, borderLeftWidth: 3, borderLeftColor: tierColor, paddingLeft: 10 } },
    h(View, { style: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 } },
      h(View, {
        style: { width: 18, height: 18, borderRadius: 9, backgroundColor: tierColor, alignItems: 'center', justifyContent: 'center', marginRight: 7 },
      },
        h(Text, { style: { color: COLORS.white, fontSize: 8.5, fontFamily: 'Helvetica-Bold' } }, String(n)),
      ),
      h(Text, { style: { fontFamily: 'Helvetica-Bold', fontSize: 12.5, color: COLORS.tealDark } }, name),
      h(Text, { style: { fontSize: 7.5, color: tierColor, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8, marginLeft: 8 } }, tier),
    ),
    h(Text, { style: { fontSize: 9, color: COLORS.body, marginBottom: 3 } },
      h(Text, { style: styles.bold }, 'What to score: '),
      what,
    ),
    h(Text, { style: { fontSize: 9, color: COLORS.body, marginBottom: 4 } },
      h(Text, { style: styles.bold }, 'Why it matters: '),
      why,
    ),
    // Rubric
    h(Text, { style: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: COLORS.tealDark, marginBottom: 3 } }, '1-5 Rubric'),
    h(View, { style: { marginBottom: 4 } },
      ...rubric.map(([score, text], i) =>
        h(View, { key: i, style: { flexDirection: 'row', marginBottom: 1.5 } },
          h(View, {
            style: {
              width: 14, height: 14, borderRadius: 2,
              backgroundColor: score >= 4 ? COLORS.emerald : score === 3 ? COLORS.teal : score === 2 ? COLORS.amber : COLORS.rose,
              alignItems: 'center', justifyContent: 'center', marginRight: 6,
            },
          },
            h(Text, { style: { color: COLORS.white, fontSize: 8, fontFamily: 'Helvetica-Bold' } }, String(score)),
          ),
          h(Text, { style: { fontSize: 8.5, color: COLORS.body, flex: 1, lineHeight: 1.4 } }, text),
        )
      )
    ),
    h(Text, { style: { fontSize: 8.5, color: COLORS.body, marginBottom: 2 } },
      h(Text, { style: styles.bold }, 'How to verify: '),
      verify,
    ),
    h(Text, { style: { fontSize: 8.5, color: COLORS.muted, fontFamily: 'Helvetica-Oblique' } },
      'Common mistake: ',
      mistake,
    ),
  )
}

// ============================================================
// Page 4 — Criteria 1-5
// ============================================================
function CriteriaDeepDive1() {
  return h(Page, { size: 'A4', style: styles.page },
    PageHeader('Vendor Scoring Framework'),
    h(Text, { style: styles.h1 }, 'Tier 1 — Universal criteria (1-5)'),
    h(Text, { style: styles.pSmall }, 'Scored on every supplier, every RFQ, every category. The baseline that turns scoring from preference into evidence.'),
    h(View, { style: { marginTop: 10 } },
      h(CriterionBlock, {
        n: 1, name: 'Unit Price', tier: 'Universal',
        what: 'Supplier\'s unit price normalised to your preferred currency, cross-compared against other bidders on the same RFQ.',
        why: 'The obvious criterion, but the anchoring matters — and the scoring basis must shift to TCO when hidden costs (tooling, freight, duties, CBAM) are material.',
        rubric: [
          [5, 'Within 3% of lowest bid, OR best value adjusted for TCO'],
          [4, 'Within 10% of lowest bid'],
          [3, 'Within 20% of lowest bid'],
          [2, '20-35% above lowest — needs justification to remain in contention'],
          [1, '>35% above lowest — viable only for strategic or non-substitutable reasons'],
        ],
        verify: 'Capture RFQ date and FX rate assumed. A price competitive in January can look uncompetitive in April because the currency moved, not because the quote changed. Timestamp everything.',
        mistake: 'Scoring on gross unit price when the category has heavy hidden costs. Move to TCO and document the shift.',
      }),
      h(CriterionBlock, {
        n: 2, name: 'Quality / Defect History', tier: 'Universal',
        what: 'Historical defect rate (PPM), quality management system maturity, and complaint-response effectiveness.',
        why: 'A supplier with 500 PPM on a 1M-unit contract produces 500 defective units/year — a hidden cost often equal to 3-15% of unit price.',
        rubric: [
          [5, 'PPM <50 OR 3+ years downward trend; IATF 16949 or sector-equivalent; named quality engineer'],
          [4, 'PPM 50-150; ISO 9001 current; documented CAPA with response times'],
          [3, 'PPM 150-400; ISO 9001 current; generic QA process'],
          [2, 'PPM 400-1000 or no measurement; ISO 9001 expiring/lapsed'],
          [1, 'No measurement, no cert, or demonstrable quality failures last 12 months'],
        ],
        verify: 'Request PPM self-report + top 3 non-conformance categories + remediation plans. Specific answers score 4-5; evasive answers score 2-3. Archive the response.',
        mistake: 'Trusting an ISO 9001 certificate without checking the issuing body\'s IAF accreditation.',
      }),
      h(CriterionBlock, {
        n: 3, name: 'Lead Time Reliability', tier: 'Universal',
        what: 'Whether the supplier hits quoted lead time. Reliability matters more than the quoted number — a 42-day supplier who always hits 42 days beats a 21-day supplier who slips to 35.',
        why: 'Missed dates cascade: safety-stock depletion, emergency air freight, customer chargebacks. Reliability drives whether you hold 30 or 60 days of cover — real money.',
        rubric: [
          [5, '>95% OTD over 12 months; EDI/portal commits; proactive exception notification'],
          [4, '90-95% OTD; reliable manual commits; responsive to exception requests'],
          [3, '80-90% OTD; default for new supplier without history'],
          [2, '70-80% OTD or frequent renegotiation; reactive posture'],
          [1, '<70% OTD or no tracking; commits unreliable'],
        ],
        verify: 'New suppliers default to 3 — upgrade only after 6 months of on-time history. Existing suppliers: request 12 months OTD data, cross-check against ERP receiving dates.',
        mistake: 'Accepting self-reported OTD without evidence. "We\'re 98% on-time" is a sales claim; a production-system report is evidence.',
      }),
    ),
    PageFooter()
  )
}

// ============================================================
// Page 5 — Criteria 4-5 + transition
// ============================================================
function CriteriaDeepDive2() {
  return h(Page, { size: 'A4', style: styles.page },
    PageHeader('Vendor Scoring Framework'),
    h(View, null,
      h(CriterionBlock, {
        n: 4, name: 'Capacity and Scalability', tier: 'Universal',
        what: 'Monthly production capacity, current utilisation, and ability to absorb your demand plus future growth.',
        why: 'A supplier winning your business at 50% utilisation is a strong partner. At 95% they\'re already a capacity risk. Expansion, second shift, and alternate-facility plans differentiate growing suppliers from plateau ones.',
        rubric: [
          [5, 'Your demand <30% of capacity; documented expansion plan; multi-site option'],
          [4, '30-50% of capacity; some scaling flexibility; single-site with headroom'],
          [3, '50-70% of capacity; modest headroom'],
          [2, '70-85% of capacity; flag for dual-source contingency'],
          [1, '>85% of capacity OR supplier can\'t articulate capacity math; reject for strategic categories'],
        ],
        verify: 'Capacity declarations must reconcile with headcount and shift pattern. A supplier claiming 1M units/month with 15 people on one shift is lying or automating beyond what\'s visible. Ask for the math.',
        mistake: 'Taking "we have plenty of capacity" at face value. A well-run supplier can answer within minutes; a poorly-run one dodges.',
      }),
      h(CriterionBlock, {
        n: 5, name: 'Financial Health', tier: 'Universal',
        what: 'Creditworthiness, audited-statement availability, customer concentration, and signs of distress.',
        why: 'Supplier bankruptcy mid-contract is disruptive even when you have a backup — tooling transfer alone takes 6-12 weeks. A financial screen catches the rare but severe case.',
        rubric: [
          [5, 'Publicly audited; top-quartile credit rating; customer concentration <30%'],
          [4, 'Audited on request; 2nd-quartile rating; concentration 30-45%'],
          [3, 'Limited visibility; 3rd-quartile or unrated; concentration unknown'],
          [2, 'No audited financials; bottom-quartile; >60% concentration or payment-default history'],
          [1, 'Signs of distress — layoffs, litigation, press reports of insolvency risk'],
        ],
        verify: 'For private suppliers: request D-U-N-S number, credit-bureau report (Creditreform / D&B / Coface), and statements under NDA. Refusal on all three = score 2 by default.',
        mistake: 'Scoring financial health as binary. The 1-5 scale lets you award to financially-acceptable-but-not-strong suppliers while factoring risk into stock-cover policy.',
      }),
    ),
    h(View, { style: { marginTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 } },
      h(Text, { style: styles.h2 }, 'Tier 2 — Compliance criteria (6-8)'),
      h(Text, { style: styles.pSmall }, 'Scored because audit, regulators, and legal will ask. Without these three, an award cannot be defended — and in regulated categories, absence is disqualifying regardless of other scores.'),
    ),
    h(View, { style: { marginTop: 8 } },
      h(CriterionBlock, {
        n: 6, name: 'Certifications and Compliance', tier: 'Compliance',
        what: 'Valid, accredited certifications matching your category requirements and regulatory context.',
        why: 'In regulated categories (automotive IATF 16949, medical ISO 13485, aerospace AS9100, food FSSC 22000), absence is a show-stopper. In unregulated categories, certifications proxy management-system maturity.',
        rubric: [
          [5, 'All applicable sector certs current + verified via issuing body; continuous improvement in audit findings'],
          [4, 'All applicable certs current; minor findings last cycle, closed'],
          [3, 'Core certs held (ISO 9001, ISO 14001); sector-specific in progress'],
          [2, 'Some lapsed or from unaccredited issuers; compliance gaps'],
          [1, 'Missing required certs; unable to operate in regulated category'],
        ],
        verify: 'Collect certificate PDFs, note issuing body, verify online (IATF OASIS, TÜV SÜD directory, Bureau Veritas verify, Lloyd\'s Register). Archive with issue + expiry dates.',
        mistake: 'Accepting photocopied certificates or self-declarations. Always verify directly on the issuing body\'s public verification tool.',
      }),
    ),
    PageFooter()
  )
}

// ============================================================
// Page 6 — Criteria 7-10
// ============================================================
function CriteriaDeepDive3() {
  return h(Page, { size: 'A4', style: styles.page },
    PageHeader('Vendor Scoring Framework'),
    h(View, null,
      h(CriterionBlock, {
        n: 7, name: 'ESG Posture', tier: 'Compliance',
        what: 'Environmental, social, governance maturity — certifications (ISO 14001), third-party scorecards (EcoVadis, Sedex), and self-reported Scope 1+2 emissions.',
        why: 'CSRD-subject buyers need supplier ESG data for Scope 3. CBAM-exposed buyers need embedded-emissions data. CSDDD (phased from 2027) will require human-rights due diligence across the chain.',
        rubric: [
          [5, 'EcoVadis Gold/Platinum; Scope 1+2 with targets; SMETA/BSCI <18 months; ISO 14001 current'],
          [4, 'EcoVadis Silver; Scope 1+2 measured; ISO 14001; social audit <24 months'],
          [3, 'ISO 14001; partial ESG data; EcoVadis Bronze or in-progress'],
          [2, 'Some ESG initiatives; no third-party verification; ad hoc data'],
          [1, 'No ESG programme; refusal to audit; misalignment with buyer commitments'],
        ],
        verify: 'Importance varies by buyer. A CSRD-subject EU manufacturer weights ESG at 15-20%; a US private-equity-owned importer at 5%. Document your weighting rationale.',
        mistake: 'Treating ESG as optional for low-spend categories. If products go into your finished goods, emissions count toward your Scope 3 regardless of contract value.',
      }),
      h(CriterionBlock, {
        n: 8, name: 'Cyber and Information Security', tier: 'Compliance',
        what: 'Ability to protect your data, maintain operational continuity against ransomware, and notify you promptly in the event of a breach.',
        why: 'A 2026 supplier ransomware event typically takes 4-8 weeks to recover. If they\'re your single source, that\'s your line down. If they hold your designs or customer data, that\'s your breach disclosure.',
        rubric: [
          [5, 'ISO 27001 or SOC 2 Type II; MFA enforced; IR plan; 72h breach clause; no material breaches 24 months'],
          [4, 'Security questionnaire (SIG, CAIQ) passed; MFA enforced; IR plan documented'],
          [3, 'Questionnaire completed with gaps; basic MFA; reactive posture'],
          [2, 'Limited programme; MFA gaps; no formal IR plan'],
          [1, 'No evidence of security programme; refusal to complete questionnaire'],
        ],
        verify: 'Weight based on access. Metal-stamping supplier seeing only POs = 3% weight. Logistics provider with customer address book = 10-15% weight.',
        mistake: 'Skipping this criterion for "non-tech" suppliers. Every supplier has email exposure; many have ERP/EDI exposure.',
      }),
    ),
    h(View, { style: { marginTop: 6, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8 } },
      h(Text, { style: styles.h2 }, 'Tier 3 — Strategic criteria (9-10)'),
      h(Text, { style: styles.pSmall }, 'What distinguishes a good supplier from a great one. Weight high for strategic categories, low for commodity.'),
    ),
    h(View, { style: { marginTop: 8 } },
      h(CriterionBlock, {
        n: 9, name: 'Commercial Terms Flexibility', tier: 'Strategic',
        what: 'Willingness to work with your preferred payment timing, VMI/consignment stock, volume tiers, force-majeure language, IP clauses.',
        why: 'A supplier insisting on 50% deposit + Net 30 balance is structurally more expensive than one accepting Net 60 — even at the same unit price. The cost shows up in working capital, not in P&L.',
        rubric: [
          [5, 'Accepts Net 45/60 + open to VMI/consignment; volume tiers; standard contract with minor edits'],
          [4, 'Accepts Net 30; flexible on tiers; most contract terms accepted'],
          [3, 'Neutral — industry standard; limited flexibility'],
          [2, 'Pushes back on terms; deposit required; inflexible on FM or IP'],
          [1, 'Inflexible across multiple commercial dimensions'],
        ],
        verify: 'Archive the negotiation transcript. Where you accepted worse terms than ideal, note why (offsetting concession, strategic importance). Protects against audit questioning "why Net 30 and not Net 60?"',
        mistake: 'Treating commercial terms as secondary. A EUR1M contract + 30 extra payment days is worth ~EUR6,500/year at 8% WACC. Real money.',
      }),
      h(CriterionBlock, {
        n: 10, name: 'Responsiveness and Commercial Relationship', tier: 'Strategic',
        what: 'Reply latency, exception handling, proactive escalation, whether the commercial team understands your business.',
        why: 'Over a multi-year relationship, commercial-relationship quality defines daily business. A responsive supplier returns quotes in 48 hours; an unresponsive one takes 10 days. Over 50 RFQs/year that\'s a 2-week vs 2-month procurement cadence.',
        rubric: [
          [5, '<24h reply; proactive updates; commercial lead has visited your facility; named escalation path'],
          [4, '<48h reply; reactive updates; solid relationship'],
          [3, '<72h reply; typical commercial professionalism'],
          [2, '5-7 day reply; transactional; minimal business understanding'],
          [1, '>7 day reply latency; frequent missed communication commits'],
        ],
        verify: 'Quantify — track reply times across the RFQ cycle. A simple email audit shows who responds in hours vs. days. Most subjective criterion; documentation matters most here.',
        mistake: 'Over-weighting responsiveness because you personally like the sales rep. Score the supplier\'s process, not individual rapport.',
      }),
    ),
    PageFooter()
  )
}

// ============================================================
// Page 7 — Weighting templates
// ============================================================
function WeightingTemplatesPage() {
  const templates = [
    {
      name: 'Commodity',
      subtitle: 'Stamped parts, packaging, MRO',
      rationale: 'Price sensitivity high, substitution easy, low switching cost.',
      color: COLORS.teal,
      weights: [
        ['Unit Price', 30], ['Quality', 15], ['Lead Time', 15], ['Capacity', 8],
        ['Financial', 5], ['Certifications', 7], ['ESG', 5], ['Cyber', 2],
        ['Commercial Terms', 8], ['Responsiveness', 5],
      ],
    },
    {
      name: 'Strategic / Custom',
      subtitle: 'Tooled parts, assemblies, integrated subsystems',
      rationale: 'High switching cost, quality paramount, long-term relationship.',
      color: '#8B5CF6',
      weights: [
        ['Unit Price', 18], ['Quality', 20], ['Lead Time', 12], ['Capacity', 10],
        ['Financial', 8], ['Certifications', 10], ['ESG', 7], ['Cyber', 3],
        ['Commercial Terms', 8], ['Responsiveness', 4],
      ],
    },
    {
      name: 'Regulated',
      subtitle: 'Automotive, medical, aerospace, food',
      rationale: 'Certifications + quality carry 45% jointly. Missing a required cert = score 1 = disqualified.',
      color: COLORS.amber,
      weights: [
        ['Unit Price', 15], ['Quality', 25], ['Lead Time', 10], ['Capacity', 7],
        ['Financial', 5], ['Certifications', 20], ['ESG', 8], ['Cyber', 3],
        ['Commercial Terms', 5], ['Responsiveness', 2],
      ],
    },
    {
      name: 'Service',
      subtitle: 'Engineering, consulting, maintenance',
      rationale: 'Services depend on people — team quality, cyber (data handling), and commercial flexibility matter more.',
      color: COLORS.emerald,
      weights: [
        ['Unit Price', 20], ['Quality', 20], ['Lead Time', 10], ['Capacity', 10],
        ['Financial', 5], ['Certifications', 8], ['ESG', 5], ['Cyber', 7],
        ['Commercial Terms', 10], ['Responsiveness', 5],
      ],
    },
  ]

  const maxWeight = 30

  return h(Page, { size: 'A4', style: styles.page },
    PageHeader('Vendor Scoring Framework'),
    h(Text, { style: styles.h1 }, 'Weighting templates by archetype'),
    h(Text, { style: styles.p },
      'Use the template that matches your category, then adjust 2-3 weights to fit the specific situation. Document every adjustment — audit defensibility depends on pre-declared, written-down weights.'
    ),

    h(View, { style: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 } },
      ...templates.map(tpl =>
        h(View, {
          key: tpl.name,
          style: { width: '50%', padding: 5 },
        },
          h(View, {
            style: {
              borderWidth: 1,
              borderColor: COLORS.border,
              borderTopWidth: 4,
              borderTopColor: tpl.color,
              borderRadius: 4,
              padding: 9,
              minHeight: 300,
            },
          },
            h(Text, { style: { fontFamily: 'Helvetica-Bold', fontSize: 13, color: COLORS.tealDark, marginBottom: 2 } }, tpl.name),
            h(Text, { style: { fontSize: 8, color: COLORS.muted, marginBottom: 7 } }, tpl.subtitle),
            // bars
            h(View, { style: { marginBottom: 6 } },
              ...tpl.weights.map(([name, w], i) =>
                h(View, { key: i, style: { flexDirection: 'row', alignItems: 'center', marginBottom: 2.5 } },
                  h(Text, { style: { width: 78, fontSize: 7.5, color: COLORS.body } }, name),
                  h(View, {
                    style: {
                      flex: 1,
                      height: 9,
                      backgroundColor: COLORS.rowAlt,
                      borderRadius: 1.5,
                      marginRight: 6,
                    },
                  },
                    h(View, {
                      style: {
                        width: `${(w / maxWeight) * 100}%`,
                        height: 9,
                        backgroundColor: tpl.color,
                        borderRadius: 1.5,
                      },
                    }),
                  ),
                  h(Text, { style: { width: 22, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: COLORS.tealDark, textAlign: 'right' } }, `${w}%`),
                )
              )
            ),
            h(View, { style: { borderTopWidth: 0.5, borderTopColor: COLORS.border, paddingTop: 5, marginTop: 3 } },
              h(Text, { style: { fontSize: 7.5, color: COLORS.muted, fontFamily: 'Helvetica-Oblique', lineHeight: 1.4 } }, tpl.rationale),
            ),
          )
        )
      )
    ),

    Callout('Template-selection rule',
      'Template choice materially changes the winner. The worked example on page 8 shows the same four suppliers ranked differently under Commodity vs. Strategic templates. Lock the template before quotes are received — and archive the file.',
      'amber'
    ),

    PageFooter()
  )
}

// ============================================================
// Page 8 — Worked example
// ============================================================
function WorkedExamplePage() {
  const rows = [
    ['1 Unit Price', '18%', '5 (€2.40)', '4 (€2.70)', '3 (€3.15)', '3 (€3.20)'],
    ['2 Quality', '20%', '3', '4', '5', '4'],
    ['3 Lead Time', '12%', '3 (56d)', '4 (35d)', '5 (21d)', '5 (18d)'],
    ['4 Capacity', '10%', '5', '4', '4', '3'],
    ['5 Financial', '8%', '3', '4', '4', '3'],
    ['6 Certifications', '10%', '3', '4', '5', '4'],
    ['7 ESG', '7%', '2', '3', '5', '4'],
    ['8 Cyber', '3%', '2', '3', '4', '3'],
    ['9 Commercial Terms', '8%', '4', '4', '5', '4'],
    ['10 Responsiveness', '4%', '3', '4', '5', '4'],
  ]
  const totals = [
    { label: 'A: China', value: 3.36, color: '#F59E0B' },
    { label: 'B: Taiwan', value: 3.85, color: '#3B82F6' },
    { label: 'C: Poland', value: 4.38, color: COLORS.emerald },
    { label: 'D: Czechia', value: 3.72, color: '#8B5CF6' },
  ]
  const cols = [0.28, 0.12, 0.15, 0.15, 0.15, 0.15]

  return h(Page, { size: 'A4', style: styles.page },
    PageHeader('Vendor Scoring Framework'),
    h(Text, { style: styles.h1 }, 'Worked example: LED driver RFQ'),
    h(Text, { style: styles.p },
      h(Text, { style: styles.bold }, 'Category: '), '15W LED driver modules, commercial lighting fixture.   ',
      h(Text, { style: styles.bold }, 'Volume: '), '80,000 units/year.   ',
      h(Text, { style: styles.bold }, 'Template: '), 'Strategic / Custom (tooling investment required).',
    ),

    // Scorecard table
    h(View, { style: styles.table },
      h(View, { style: styles.thead },
        h(Text, { style: [styles.th, { width: `${cols[0] * 100}%` }] }, 'Criterion'),
        h(Text, { style: [styles.th, { width: `${cols[1] * 100}%`, textAlign: 'right' }] }, 'Weight'),
        h(Text, { style: [styles.th, { width: `${cols[2] * 100}%`, textAlign: 'center' }] }, 'A: China'),
        h(Text, { style: [styles.th, { width: `${cols[3] * 100}%`, textAlign: 'center' }] }, 'B: Taiwan'),
        h(Text, { style: [styles.th, { width: `${cols[4] * 100}%`, textAlign: 'center' }] }, 'C: Poland'),
        h(Text, { style: [styles.th, { width: `${cols[5] * 100}%`, textAlign: 'center' }] }, 'D: Czechia'),
      ),
      ...rows.map((r, i) =>
        h(View, { key: i, style: i % 2 === 1 ? styles.trAlt : styles.tr },
          h(Text, { style: [styles.td, { width: `${cols[0] * 100}%`, fontFamily: 'Helvetica-Bold' }] }, r[0]),
          h(Text, { style: [styles.td, { width: `${cols[1] * 100}%`, textAlign: 'right' }] }, r[1]),
          h(Text, { style: [styles.td, { width: `${cols[2] * 100}%`, textAlign: 'center' }] }, r[2]),
          h(Text, { style: [styles.td, { width: `${cols[3] * 100}%`, textAlign: 'center' }] }, r[3]),
          h(Text, { style: [styles.td, { width: `${cols[4] * 100}%`, textAlign: 'center' }] }, r[4]),
          h(Text, { style: [styles.td, { width: `${cols[5] * 100}%`, textAlign: 'center' }] }, r[5]),
        )
      ),
      // Totals row
      h(View, { style: { flexDirection: 'row', backgroundColor: COLORS.tealLight, borderTopWidth: 1, borderTopColor: COLORS.teal } },
        h(Text, { style: [styles.td, { width: `${cols[0] * 100}%`, fontFamily: 'Helvetica-Bold', color: COLORS.tealDark }] }, 'Weighted total (/ 5)'),
        h(Text, { style: [styles.td, { width: `${cols[1] * 100}%`, textAlign: 'right' }] }, '100%'),
        h(Text, { style: [styles.td, { width: `${cols[2] * 100}%`, textAlign: 'center', fontFamily: 'Helvetica-Bold', color: COLORS.tealDark }] }, '3.36'),
        h(Text, { style: [styles.td, { width: `${cols[3] * 100}%`, textAlign: 'center', fontFamily: 'Helvetica-Bold', color: COLORS.tealDark }] }, '3.85'),
        h(Text, { style: [styles.td, { width: `${cols[4] * 100}%`, textAlign: 'center', fontFamily: 'Helvetica-Bold', color: COLORS.emerald }] }, '4.38'),
        h(Text, { style: [styles.td, { width: `${cols[5] * 100}%`, textAlign: 'center', fontFamily: 'Helvetica-Bold', color: COLORS.tealDark }] }, '3.72'),
      ),
    ),

    // Visual ranking bars
    h(Text, { style: [styles.h3, { marginTop: 12 }] }, 'Ranking'),
    h(View, { style: { marginTop: 4 } },
      ...[...totals].sort((a, b) => b.value - a.value).map((t, i) =>
        h(View, { key: i, style: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 } },
          h(Text, { style: { width: 18, fontSize: 9, color: COLORS.muted, fontFamily: 'Helvetica-Bold' } }, `#${i + 1}`),
          h(Text, { style: { width: 80, fontSize: 9.5, color: COLORS.body, fontFamily: i === 0 ? 'Helvetica-Bold' : 'Helvetica' } }, t.label),
          h(View, {
            style: { flex: 1, height: 14, backgroundColor: COLORS.rowAlt, borderRadius: 2, marginRight: 8 },
          },
            h(View, {
              style: {
                width: `${(t.value / 5) * 100}%`,
                height: 14,
                backgroundColor: i === 0 ? COLORS.emerald : t.color,
                borderRadius: 2,
              },
            }),
          ),
          h(Text, { style: { width: 40, fontSize: 10, fontFamily: 'Helvetica-Bold', color: i === 0 ? COLORS.emerald : COLORS.tealDark, textAlign: 'right' } }, t.value.toFixed(2)),
        )
      )
    ),

    Callout('Decision — award to Supplier C (Poland, 4.38)',
      'The 31% unit-price premium over China is more than offset by the combined lead-time, quality, certification, and ESG advantages in a custom-tooled category with strategic weight.',
      'emerald'
    ),
    Callout('Key insight — template choice matters',
      'Under the Commodity template (Price 30%), Supplier A would have won (3.98 vs Poland 3.85). The weighting template materially changed the winner. Lock the template before quotes arrive and archive the file.',
      'amber'
    ),

    PageFooter()
  )
}

// ============================================================
// Page 9 — Audit trail template
// ============================================================
function AuditTrailPage() {
  const fields = [
    ['RFQ ID', ''],
    ['Category', ''],
    ['Category archetype', '[ Commodity / Strategic / Regulated / Service / Capex ]'],
    ['Weighting template (locked before quotes)', '[ attach file name ]'],
    ['Weights adjusted?', '[ Yes / No ] — if yes, rationale:'],
    ['RFQ sent date', ''],
    ['RFQ deadline', ''],
    ['FX rates used (RFQ date)', ''],
    ['Scoring analyst 1', ''],
    ['Scoring analyst 2', ''],
    ['Calibration — any >1.5 point gap triggered recalibration?', '[ Yes / No ]'],
    ['Scorecard file', '[ attach .xlsx ]'],
    ['Winner', ''],
    ['Delta to runner-up (score + rationale)', ''],
    ['Runner-up kept for dual-source option?', '[ Yes / No ]'],
    ['Key decision notes', '(free text — what tipped the balance, exceptions, concessions)'],
    ['Approved by (category manager)', ''],
    ['Approved by (director)', ''],
    ['Archive location', ''],
  ]

  return h(Page, { size: 'A4', style: styles.page },
    PageHeader('Vendor Scoring Framework'),
    h(Text, { style: styles.h1 }, 'Audit trail template'),
    h(Text, { style: styles.pSmall },
      'For every RFQ that uses this framework, archive these nineteen data points. If an auditor asks "how was this supplier selected?" — you produce the archive.'
    ),

    h(View, { style: [styles.table, { marginTop: 10 }] },
      h(View, { style: styles.thead },
        h(Text, { style: [styles.th, { width: '40%' }] }, 'Field'),
        h(Text, { style: [styles.th, { width: '60%' }] }, 'Value'),
      ),
      ...fields.map(([k, v], i) =>
        h(View, { key: i, style: i % 2 === 1 ? styles.trAlt : styles.tr },
          h(Text, { style: [styles.td, { width: '40%', fontFamily: 'Helvetica-Bold' }] }, k),
          h(Text, { style: [styles.td, { width: '60%', color: v ? COLORS.muted : COLORS.muted, fontFamily: v ? 'Helvetica-Oblique' : 'Helvetica' }] },
            v || '____________________________________________'
          ),
        )
      ),
    ),

    h(Text, { style: [styles.h3, { marginTop: 14 }] }, 'Calibration procedure (multi-analyst teams)'),
    h(View, null,
      ...[
        [1, 'Pre-RFQ: both analysts agree on weighting template.'],
        [2, 'Independent scoring: both score every supplier on every criterion without seeing each other\'s scores.'],
        [3, 'Gap check: compare criterion by criterion. Flag any >1.5 point gap.'],
        [4, 'Calibration meeting (30 min): walk through flagged gaps. Agree what "a 4" means on this criterion for this category. Re-score.'],
        [5, 'Final scorecard: agreed score, or average noted as "unresolved" if disagreement persists.'],
        [6, 'Document: record the calibration discussion in the audit trail.'],
      ].map(([n, text]) =>
        h(View, { key: n, style: { flexDirection: 'row', marginBottom: 3 } },
          h(View, { style: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.teal, alignItems: 'center', justifyContent: 'center', marginRight: 6, marginTop: 1 } },
            h(Text, { style: { color: COLORS.white, fontSize: 8, fontFamily: 'Helvetica-Bold' } }, String(n)),
          ),
          h(Text, { style: { flex: 1, fontSize: 9, color: COLORS.body, lineHeight: 1.4 } }, text),
        )
      )
    ),

    Callout('Target — calibrated team benchmark',
      'A calibrated team scores within 1.0 point on 80%+ of criteria by the third RFQ. Below that benchmark, your rubric needs more specific anchors — update this framework based on what you learn.',
      'teal'
    ),

    PageFooter()
  )
}

// ============================================================
// Page 10 — Procurea CTA
// ============================================================
function CtaPage() {
  return h(Page, { size: 'A4', style: styles.page },
    PageHeader('Vendor Scoring Framework'),
    h(Text, { style: styles.h1 }, 'Automate the work before the scoring'),
    h(Text, { style: styles.p },
      'This framework is the human-judgement stage — and human judgement is where scoring should stay. The stage before it should not.'
    ),
    h(Text, { style: styles.p },
      h(Text, { style: styles.emphasis }, 'Procurea is an AI-native supplier discovery and outreach platform. '),
      'We find and verify 100-250 suppliers per campaign across 26 languages — replacing a 30-hour manual sourcing campaign with roughly 20 minutes of workflow plus the human judgement that this scoring framework supports.'
    ),

    // Three-step process
    h(View, { style: { flexDirection: 'row', marginTop: 14, marginBottom: 12 } },
      ...[
        { step: '1', title: 'Discover', desc: 'AI sourcing finds 100-250 qualified suppliers per campaign from a simple brief.', color: COLORS.teal },
        { step: '2', title: 'Compare', desc: 'Offer Comparison normalises quotes into a weighted scorecard — using this framework.', color: '#8B5CF6' },
        { step: '3', title: 'Decide', desc: 'You score the shortlist. The audit trail is captured automatically, ready for Internal Audit.', color: COLORS.emerald },
      ].map((s, i) =>
        h(View, { key: i, style: { flex: 1, padding: 5 } },
          h(View, { style: { borderWidth: 1, borderColor: COLORS.border, borderTopWidth: 4, borderTopColor: s.color, borderRadius: 4, padding: 12, minHeight: 120 } },
            h(View, { style: { width: 26, height: 26, borderRadius: 13, backgroundColor: s.color, alignItems: 'center', justifyContent: 'center', marginBottom: 7 } },
              h(Text, { style: { color: COLORS.white, fontSize: 12, fontFamily: 'Helvetica-Bold' } }, s.step),
            ),
            h(Text, { style: { fontFamily: 'Helvetica-Bold', fontSize: 12, color: COLORS.tealDark, marginBottom: 4 } }, s.title),
            h(Text, { style: { fontSize: 9, color: COLORS.body, lineHeight: 1.45 } }, s.desc),
          )
        )
      )
    ),

    h(Text, { style: styles.h2 }, 'How Offer Comparison applies this framework'),
    ...[
      'Imports supplier quotes (PDF, Excel, or email) and normalises currency + units automatically.',
      'Lets you lock a weighting template per category — Commodity, Strategic, Regulated, Service — before quotes arrive.',
      'Applies your 1-5 rubrics and captures who scored what, when, with evidence links.',
      'Produces an audit-ready PDF with the full scorecard, weighted totals, and decision rationale.',
      'Archives the calibration trail — including any >1.5 point analyst gaps and how they were resolved.',
    ].map((text, i) => h(View, { key: i }, Bullet(text))),

    // CTA box
    h(View, {
      style: {
        marginTop: 18,
        backgroundColor: COLORS.teal,
        borderRadius: 6,
        padding: 20,
      },
    },
      h(Text, { style: { color: COLORS.white, fontSize: 17, fontFamily: 'Helvetica-Bold', marginBottom: 6, letterSpacing: -0.3 } },
        'Start your first campaign'),
      h(Text, { style: { color: COLORS.white, fontSize: 10, opacity: 0.92, marginBottom: 12, lineHeight: 1.5 } },
        '7-day free trial. Run a real sourcing campaign across 26 languages. Apply this scoring framework to the shortlist Procurea finds for you.'),
      h(View, { style: { flexDirection: 'row', alignItems: 'center' } },
        h(View, { style: { backgroundColor: COLORS.white, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 3 } },
          h(Text, { style: { color: COLORS.tealDark, fontFamily: 'Helvetica-Bold', fontSize: 11 } }, 'app.procurea.io/signup'),
        ),
        h(Text, { style: { color: COLORS.white, fontSize: 9, opacity: 0.88, marginLeft: 14 } }, 'Questions:  hello@procurea.io'),
      ),
    ),

    h(View, { style: { marginTop: 16, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: COLORS.border } },
      h(Text, { style: { fontSize: 8.5, color: COLORS.muted, lineHeight: 1.5 } },
        'Published by Procurea, April 2026. Based on patterns from ~200 sourcing decisions in the Procurea beta cohort plus contributions from three CIPS-qualified category managers. Free to use, adapt, and republish with attribution. Next revision: October 2026.'),
      h(Text, { style: { fontSize: 8.5, color: COLORS.muted, marginTop: 5 } },
        'Feedback and framework updates:  hello@procurea.io      Web:  procurea.io/features/offer-comparison'),
    ),

    PageFooter()
  )
}

// ============================================================
// Document
// ============================================================
function Doc() {
  return h(Document, {
    title: 'Vendor Scoring Framework',
    author: 'Procurea',
    subject: 'A 10-Criteria Template for Audit-Defensible Supplier Selection',
    keywords: 'vendor scoring, supplier evaluation, procurement framework, audit, RFQ',
    creator: 'Procurea',
    producer: 'Procurea',
  },
    CoverPage(),
    IntroTocPage(),
    CriteriaOverviewPage(),
    CriteriaDeepDive1(),
    CriteriaDeepDive2(),
    CriteriaDeepDive3(),
    WeightingTemplatesPage(),
    WorkedExamplePage(),
    AuditTrailPage(),
    CtaPage(),
  )
}

// ============================================================
// Generate
// ============================================================
async function main() {
  console.log('Generating Vendor Scoring Framework PDF...')
  mkdirSync(OUT_DIR, { recursive: true })
  const instance = pdf(Doc())
  const buffer = await instance.toBuffer()
  // react-pdf's toBuffer returns a stream in some versions; handle both
  if (buffer && typeof buffer.pipe === 'function') {
    // Node stream — collect
    const chunks = []
    await new Promise((resolve, reject) => {
      buffer.on('data', (c) => chunks.push(c))
      buffer.on('end', resolve)
      buffer.on('error', reject)
    })
    writeFileSync(OUT_FILE, Buffer.concat(chunks))
  } else if (Buffer.isBuffer(buffer)) {
    writeFileSync(OUT_FILE, buffer)
  } else {
    throw new Error('Unexpected return type from pdf().toBuffer()')
  }
  const size = statSync(OUT_FILE).size
  const kb = (size / 1024).toFixed(1)
  console.log(`✓ Wrote ${OUT_FILE}`)
  console.log(`  Size: ${kb} KB`)
}

main().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
