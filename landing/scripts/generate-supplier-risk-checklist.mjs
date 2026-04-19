#!/usr/bin/env node
/**
 * Generate the "Supplier Risk Checklist 2026" PDF lead magnet using
 * @react-pdf/renderer. Written in plain .mjs with React.createElement
 * (no JSX) so no build step / transpiler is required.
 *
 * Usage:
 *   node scripts/generate-supplier-risk-checklist.mjs
 *
 * Output:
 *   public/resources/downloads/supplier-risk-checklist-2026/supplier-risk-checklist-2026.pdf
 */

import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { statSync, mkdirSync, existsSync } from 'node:fs'

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToFile,
  Svg,
  Rect,
  Path,
  G,
} from '@react-pdf/renderer'

const h = React.createElement

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(
  ROOT,
  'public/resources/downloads/supplier-risk-checklist-2026'
)
const OUT_FILE = join(OUT_DIR, 'supplier-risk-checklist-2026.pdf')

// Brand tokens ---------------------------------------------------------------
const COLOR = {
  teal: '#5E8C8F',
  tealDark: '#2A5C5D',
  tealSoft: '#E8F0F0',
  tealDeep: '#1F4445',
  ink: '#0F172B',
  body: '#334155',
  muted: '#64748B',
  line: '#E2E8F0',
  lineSoft: '#F1F5F9',
  bg: '#FAFAFA',
  amber: '#D97706',
  amberSoft: '#FEF3C7',
  amberBg: '#FFFBEB',
  emerald: '#059669',
  emeraldSoft: '#D1FAE5',
  white: '#FFFFFF',
}

const TOTAL_PAGES = 9

const styles = StyleSheet.create({
  // Generic page
  page: {
    paddingTop: 52,
    paddingBottom: 44,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: COLOR.body,
    backgroundColor: COLOR.white,
    lineHeight: 1.45,
  },

  // Cover (full bleed)
  cover: {
    padding: 0,
    backgroundColor: COLOR.teal,
    color: COLOR.white,
  },
  coverInner: {
    flex: 1,
    paddingHorizontal: 56,
    paddingTop: 72,
    paddingBottom: 48,
    backgroundColor: COLOR.teal,
    position: 'relative',
  },
  coverBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
  },
  coverBrandMark: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: COLOR.white,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBrandMarkText: {
    color: COLOR.teal,
    fontFamily: 'Helvetica-Bold',
    fontSize: 15,
  },
  coverBrandName: {
    color: COLOR.white,
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.4,
  },
  coverEdition: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'Helvetica',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  coverTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 46,
    color: COLOR.white,
    lineHeight: 1.05,
    letterSpacing: -1,
    marginBottom: 10,
  },
  coverTitleAccent: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 46,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.05,
    letterSpacing: -1,
    marginBottom: 24,
  },
  coverSubtitle: {
    fontFamily: 'Helvetica',
    fontSize: 15,
    color: 'rgba(255,255,255,0.88)',
    marginBottom: 32,
    lineHeight: 1.45,
    maxWidth: 420,
  },
  coverRuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coverRule: {
    width: 36,
    height: 2,
    backgroundColor: COLOR.white,
    marginRight: 12,
  },
  coverTagline: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  coverMetaRow: {
    flexDirection: 'row',
    marginTop: 36,
    flexWrap: 'wrap',
  },
  coverMeta: {
    width: '50%',
    marginBottom: 14,
  },
  coverMetaLabel: {
    fontSize: 8,
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  coverMetaValue: {
    fontSize: 12,
    color: COLOR.white,
    fontFamily: 'Helvetica-Bold',
  },
  coverGridWrap: {
    marginTop: 28,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
  },
  coverGridLabel: {
    fontSize: 8,
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  coverGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  coverCell: {
    width: 34,
    height: 34,
    marginRight: 6,
    marginBottom: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverCellFilled: {
    backgroundColor: COLOR.white,
    borderColor: COLOR.white,
  },
  coverCellText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: 'rgba(255,255,255,0.6)',
  },
  coverCellTextFilled: {
    color: COLOR.teal,
  },
  coverFooter: {
    position: 'absolute',
    left: 56,
    right: 56,
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  coverFooterText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
  },

  // Standard page structure
  header: {
    position: 'absolute',
    top: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerMark: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: COLOR.teal,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 9,
    color: COLOR.tealDark,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  headerRight: {
    fontSize: 9,
    color: COLOR.muted,
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLOR.line,
  },
  footerText: {
    fontSize: 8,
    color: COLOR.muted,
  },
  footerPage: {
    fontSize: 8,
    color: COLOR.tealDark,
    fontFamily: 'Helvetica-Bold',
  },

  // Headings
  h1: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: COLOR.tealDark,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  h1Kicker: {
    fontSize: 9,
    letterSpacing: 2,
    color: COLOR.teal,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  h1Rule: {
    width: 40,
    height: 3,
    backgroundColor: COLOR.teal,
    marginBottom: 18,
    marginTop: 2,
  },
  h2: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: COLOR.ink,
    marginTop: 18,
    marginBottom: 6,
  },

  // TOC
  tocIntro: {
    fontSize: 11,
    lineHeight: 1.55,
    color: COLOR.body,
    marginBottom: 22,
  },
  tocList: {
    marginTop: 4,
  },
  tocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.line,
  },
  tocNum: {
    width: 28,
    fontFamily: 'Helvetica-Bold',
    color: COLOR.teal,
    fontSize: 12,
  },
  tocLabel: {
    width: 180,
    fontFamily: 'Helvetica-Bold',
    color: COLOR.ink,
    fontSize: 11,
    paddingRight: 12,
  },
  tocDesc: {
    flex: 1,
    color: COLOR.muted,
    fontSize: 9.5,
    lineHeight: 1.35,
  },
  tocPage: {
    width: 40,
    textAlign: 'right',
    color: COLOR.tealDark,
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
  },
  tocBadge: {
    marginTop: 22,
    padding: 14,
    backgroundColor: COLOR.tealSoft,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.teal,
  },
  tocBadgeTitle: {
    fontFamily: 'Helvetica-Bold',
    color: COLOR.tealDark,
    fontSize: 10,
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tocBadgeText: {
    color: COLOR.body,
    fontSize: 10,
    lineHeight: 1.5,
  },

  // Dimension banner (section opener block)
  dimBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: COLOR.tealDark,
    borderRadius: 6,
    marginBottom: 16,
  },
  dimBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dimBannerNumBox: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: COLOR.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dimBannerNum: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: COLOR.tealDark,
  },
  dimBannerText: {
    color: COLOR.white,
  },
  dimBannerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: COLOR.white,
    letterSpacing: 0.3,
  },
  dimBannerSub: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  dimBannerRange: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Check card (used in 2-column grid layout)
  cardRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  cardCol: {
    flex: 1,
    marginRight: 8,
  },
  cardColLast: {
    flex: 1,
  },
  card: {
    borderWidth: 1,
    borderColor: COLOR.line,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.teal,
    borderRadius: 4,
    padding: 9,
    backgroundColor: COLOR.white,
    height: 230,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLOR.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  cardBadgeText: {
    fontFamily: 'Helvetica-Bold',
    color: COLOR.white,
    fontSize: 8.5,
  },
  cardTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
    color: COLOR.ink,
    flex: 1,
    lineHeight: 1.25,
  },
  cardBody: {
    fontSize: 8.5,
    color: COLOR.body,
    lineHeight: 1.4,
    marginBottom: 6,
  },
  cardFlagBox: {
    padding: 6,
    backgroundColor: COLOR.amberBg,
    borderLeftWidth: 2,
    borderLeftColor: COLOR.amber,
    borderRadius: 3,
    marginBottom: 5,
  },
  cardFlagLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: COLOR.amber,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardFlagText: {
    fontSize: 8,
    color: COLOR.ink,
    lineHeight: 1.4,
  },
  cardQBox: {
    padding: 6,
    backgroundColor: COLOR.lineSoft,
    borderRadius: 3,
  },
  cardQLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: COLOR.tealDark,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardQText: {
    fontSize: 8,
    color: COLOR.ink,
    lineHeight: 1.4,
    fontStyle: 'italic',
  },

  // Quick-scan sheet
  qsIntro: {
    fontSize: 9.5,
    color: COLOR.body,
    marginBottom: 10,
    lineHeight: 1.45,
  },
  qsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 8,
    backgroundColor: COLOR.lineSoft,
    borderRadius: 4,
  },
  qsMetaField: {
    flex: 1,
    marginRight: 8,
  },
  qsMetaLabel: {
    fontSize: 6.5,
    color: COLOR.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  qsMetaLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLOR.ink,
    height: 10,
  },
  qsColumns: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  qsCol: {
    flex: 1,
  },
  qsColLeft: {
    marginRight: 14,
  },
  qsGroup: {
    marginBottom: 7,
  },
  qsGroupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.teal,
  },
  qsGroupTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: COLOR.tealDark,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    flex: 1,
  },
  qsGroupMax: {
    fontSize: 7,
    color: COLOR.muted,
    fontFamily: 'Helvetica-Bold',
  },
  qsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  qsCheckbox: {
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: COLOR.ink,
    marginRight: 6,
    marginTop: 1,
    borderRadius: 1,
  },
  qsNum: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: COLOR.tealDark,
    width: 14,
  },
  qsText: {
    flex: 1,
    fontSize: 8,
    color: COLOR.ink,
    lineHeight: 1.3,
  },
  qsScoreBox: {
    marginTop: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLOR.line,
    borderRadius: 4,
    backgroundColor: COLOR.bg,
  },
  qsScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  qsScoreLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: COLOR.ink,
    flex: 1,
  },
  qsScoreLine: {
    width: 80,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.ink,
    height: 12,
  },
  qsScoreLegend: {
    fontSize: 8.5,
    color: COLOR.muted,
    marginTop: 4,
    lineHeight: 1.4,
  },

  // CTA page
  ctaHero: {
    padding: 24,
    backgroundColor: COLOR.tealDeep,
    borderRadius: 8,
    marginBottom: 18,
  },
  ctaKicker: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  ctaTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: COLOR.white,
    lineHeight: 1.15,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  ctaLead: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 1.55,
    marginBottom: 4,
  },
  ctaBullets: {
    marginBottom: 16,
  },
  ctaBulletRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  ctaBulletNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLOR.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  ctaBulletNumText: {
    fontFamily: 'Helvetica-Bold',
    color: COLOR.white,
    fontSize: 10,
  },
  ctaBulletBody: {
    flex: 1,
  },
  ctaBulletTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: COLOR.ink,
    marginBottom: 2,
  },
  ctaBulletText: {
    fontSize: 10,
    color: COLOR.body,
    lineHeight: 1.5,
  },
  ctaActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: COLOR.line,
    borderRadius: 6,
    backgroundColor: COLOR.bg,
    marginBottom: 14,
  },
  ctaQR: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: COLOR.teal,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: COLOR.white,
  },
  ctaQRText: {
    fontSize: 7,
    color: COLOR.muted,
    letterSpacing: 0.5,
  },
  ctaActionBody: {
    flex: 1,
  },
  ctaActionLabel: {
    fontSize: 8.5,
    color: COLOR.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  ctaActionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: COLOR.ink,
    marginBottom: 2,
  },
  ctaActionUrl: {
    fontSize: 10.5,
    color: COLOR.teal,
    fontFamily: 'Helvetica-Bold',
  },
  ctaFooter: {
    borderTopWidth: 1,
    borderTopColor: COLOR.line,
    paddingTop: 12,
    marginTop: 4,
  },
  ctaFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ctaFooterLabel: {
    fontSize: 8,
    color: COLOR.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  ctaFooterValue: {
    fontSize: 10,
    color: COLOR.ink,
    fontFamily: 'Helvetica-Bold',
  },
  ctaFineprint: {
    fontSize: 8.5,
    color: COLOR.muted,
    marginTop: 10,
    lineHeight: 1.4,
  },
})

// -----------------------------------------------------------------------------
// Content
// -----------------------------------------------------------------------------

const DIMENSIONS = [
  {
    key: 'financial',
    title: 'Financial health',
    tagline: 'Bankruptcy, insolvency, supply interruption mid-contract',
    range: 'Checks 01 — 04',
  },
  {
    key: 'operational',
    title: 'Operational resilience',
    tagline: 'Capacity failure, single-site dependence, quality collapse',
    range: 'Checks 05 — 08',
  },
  {
    key: 'geopolitical',
    title: 'Geopolitical & regulatory',
    tagline: 'Sanctions exposure, tariff shocks, export control violations',
    range: 'Checks 09 — 12',
  },
  {
    key: 'esg',
    title: 'ESG & compliance',
    tagline: 'Reputational damage, CSRD non-compliance, Scope 3 gaps',
    range: 'Checks 13 — 16',
  },
  {
    key: 'cyber',
    title: 'Cyber & information security',
    tagline: 'Ransomware shutdown, data breach, IP leakage',
    range: 'Checks 17 — 20',
  },
]

const CHECKS = [
  // Financial
  {
    n: 1,
    dim: 'financial',
    title: 'Verify the legal entity',
    body: 'Confirm the supplier is a registered legal entity and that the name, address, and tax ID on the quote match the public registry record. Validate EU VAT on VIES; cross-check Companies House, KRS, or Handelsregister; pull a D&B D-U-N-S if available.',
    flag: 'Name mismatch with registered entity; under 12 months old yet claiming 10+ years; manufacturing supplier registered at a residential or mailbox address.',
    q: 'Can you share the current extract from your national business registry and your VAT/EIN confirmation in PDF?',
  },
  {
    n: 2,
    dim: 'financial',
    title: 'Pull a credit bureau report',
    body: 'Creditworthiness signal from a third-party bureau — you are not doing forensic accounting, you are confirming no recent default, court judgment, or drastic turnover contraction. Creditreform / Bisnode / Coface / D&B depending on geography.',
    flag: 'Credit score in the bottom quartile for the country and sector; recorded payment defaults in the past 24 months; DSO deterioration greater than 20 days year-over-year.',
    q: 'What is your current credit rating, and can you share the latest bureau report?',
  },
  {
    n: 3,
    dim: 'financial',
    title: 'Request audited financials',
    body: 'Audited statements for the last two fiscal years, pulled from the registry for listed corporate forms or requested directly under NDA for private firms. Look at equity trend, interest coverage, and any going-concern language in the auditor note.',
    flag: 'Refusal to share under NDA above €2M revenue; negative equity two years running; interest coverage ratio (EBIT / Interest) below 1.5 while carrying debt.',
    q: 'Can you provide audited financials for the last two years under NDA, including the auditor’s opinion letter?',
  },
  {
    n: 4,
    dim: 'financial',
    title: 'Test customer concentration',
    body: 'What share of the supplier’s revenue sits with their single largest customer? A partner who depends on one account for most of turnover is one renewal cycle from layoffs and capacity collapse.',
    flag: 'Single-customer concentration above 40%; top-3 customer concentration above 70%. Qualify but flag for higher review cadence.',
    q: 'What share of your revenue comes from your top-1 and top-3 customers, and has that ratio changed in the last 24 months?',
  },

  // Operational
  {
    n: 5,
    dim: 'operational',
    title: 'Confirm ISO 9001 is current',
    body: 'Valid ISO 9001:2015 certificate — or the sector equivalent (IATF 16949 automotive, ISO 13485 medical, AS9100 aerospace, ISO 22000 food). Certificate must name the producing facility, not a holding company, and be verifiable on the issuing body database.',
    flag: 'Certificate expired; scope covers a different facility than the one producing your goods; issuing body not accredited by the International Accreditation Forum (IAF).',
    q: 'Please share your current ISO 9001 certificate PDF and the verification link on your registrar’s directory.',
  },
  {
    n: 6,
    dim: 'operational',
    title: 'Probe single-site and capacity risk',
    body: 'Does the supplier produce your goods at a single facility? What is the monthly capacity there, and what percentage will your order consume? Reconcile the math against hours-of-operation, shifts, and headcount.',
    flag: 'One facility producing 100% of your demand + plant running above 75% utilisation + no documented alternate production site within the supplier group.',
    q: 'What is your current capacity utilisation at the facility producing our goods, and where is the alternate site if that plant goes down?',
  },
  {
    n: 7,
    dim: 'operational',
    title: 'Review defect rate and warranty history',
    body: 'Trailing 12-month PPM (parts per million) defect rate from the existing customer base, or internal final-inspection data for a new supplier. No PPM data from a supplier claiming ISO 9001 is itself a red flag — the standard requires measurement.',
    flag: 'PPM above 500 for commodity mechanical parts; above 100 for safety-critical assemblies; no PPM data at all despite an ISO 9001 claim.',
    q: 'Can you share your rolling 12-month PPM figures by product family and any 8D reports from the last four quarters?',
  },
  {
    n: 8,
    dim: 'operational',
    title: 'Check insurance and continuity plan',
    body: 'Product liability Certificate of Insurance from a recognised broker, plus a 2-page business continuity plan covering fire, key-person loss, and single-supplier raw material failure. Name your company as additional insured for risk-heavy categories.',
    flag: 'Product liability cover below €2M for commercial, below €10M for automotive / medical / aerospace; no BCP at all above 50 employees; policy expiring within 60 days without renewal evidence.',
    q: 'Can you send your current Certificate of Insurance and a summary of your business continuity plan for the top three disruption scenarios?',
  },

  // Geopolitical
  {
    n: 9,
    dim: 'geopolitical',
    title: 'Screen against sanctions lists',
    body: 'Check the legal entity, its ultimate beneficial owners, and its directors against the OFAC SDN list, EU Consolidated Financial Sanctions, UK HMT, and UN Security Council lists. Ongoing monitoring via World-Check, Dow Jones Risk Center, or Sanctions.io.',
    flag: 'Any exact or fuzzy match on entity, owners, or directors. Fuzzy matches require manual review — never auto-clear a “close but not exact” result.',
    q: 'Can you confirm your current ownership structure to the ultimate beneficial owner, and sign our sanctions attestation?',
  },
  {
    n: 10,
    dim: 'geopolitical',
    title: 'Validate export control classification',
    body: 'For dual-use items (sensor electronics, certain machine tools, advanced materials, encryption-capable hardware), confirm the supplier knows their ECCN / EAR99 status or EU Dual-Use Annex I code, and can supply documentation for customs.',
    flag: 'Supplier cannot produce an ECCN or equivalent classification for dual-use-capable goods; self-declaration of “EAR99” on clearly controlled components (high-compute semiconductors, strong encryption, certain CNC tooling).',
    q: 'What is the ECCN (or EU Dual-Use Annex I code) for this product, and who issued that classification?',
  },
  {
    n: 11,
    dim: 'geopolitical',
    title: 'Assess CBAM exposure (EU importers)',
    body: 'If you import from a non-EU supplier in iron / steel, aluminium, cement, fertilisers, electricity, or hydrogen, the Carbon Border Adjustment Mechanism applies from 2026. You need embedded emissions data verified per CBAM implementing regulations.',
    flag: 'Non-EU supplier in a covered category with no CBAM awareness, no embedded emissions data, and no plan to provide verified emissions by the 2026 definitive-period deadlines.',
    q: 'Can you share verified embedded emissions per tonne of product, and the verifier credentials per the CBAM regulation?',
  },
  {
    n: 12,
    dim: 'geopolitical',
    title: 'Verify country of origin and tariff code',
    body: 'The declared country of origin matches production reality, HTS / CN codes feed the landed cost, and the Certificate of Origin is issued by the chamber of commerce in the production country — not a transshipment hub.',
    flag: 'Supplier will not provide a Certificate of Origin; quote address differs from CoO address; claimed origin is a known transshipment route for the category (e.g. Malaysia, Vietnam, Mexico for specific goods).',
    q: 'Can you provide the Certificate of Origin issued by the chamber of commerce in the production country and the HTS / CN classification?',
  },

  // ESG
  {
    n: 13,
    dim: 'esg',
    title: 'Verify ISO 14001 (or equivalent)',
    body: 'ISO 14001 or the sector equivalent — OEKO-TEX Standard 100 / GOTS / Responsible Wool Standard for textiles, FSC for forestry, RJC for jewellery. Valid certificate, accredited body, covering the producing facility.',
    flag: 'No environmental certification in a category where your own customers demand one; expired certificate; issuing body not IAF-accredited.',
    q: 'Can you share your current ISO 14001 certificate and the verifier link on the issuing body’s database?',
  },
  {
    n: 14,
    dim: 'esg',
    title: 'Request Scope 1 and 2 emissions',
    body: 'Does the supplier measure and report Scope 1 (direct) and Scope 2 (purchased energy) greenhouse gas emissions? For CSRD-subject buyers, your Scope 3 category 1 reporting depends on this supplier data.',
    flag: 'Supplier above 100 employees with zero GHG measurement capability; energy-intensive category (metals, chemicals, ceramics) without Scope 1+2 data by 2026; refusal to share under NDA.',
    q: 'Can you share your latest Scope 1 and 2 emissions (CO₂e) and the methodology or standard used?',
  },
  {
    n: 15,
    dim: 'esg',
    title: 'Review the social compliance audit',
    body: 'Evidence that labour practices meet international standards — no forced labour, no child labour, working-hour and pay conformance. Typical proof: SMETA on Sedex, BSCI on amfori, SA8000, WRAP, or an EcoVadis scorecard.',
    flag: 'Textiles / apparel without SMETA or BSCI in the last 24 months; audit rated “Needs Improvement” on wages or health and safety; minerals supplier without Responsible Minerals Initiative alignment; universal refusal to participate in any audit scheme.',
    q: 'Please share your most recent social audit (SMETA / BSCI / EcoVadis) and any corrective action plans from it.',
  },
  {
    n: 16,
    dim: 'esg',
    title: 'Confirm anti-bribery policy (ABAC)',
    body: 'Supplier has an anti-bribery policy, trains commercial staff, and will accept your ABAC clauses. ISO 37001 certification strongly recommended for high-risk jurisdictions.',
    flag: 'No ABAC policy at all; refusal to sign your ABAC clause; recent publicly-reported corruption case naming the supplier or its directors in the local language.',
    q: 'Can you share your ABAC policy and confirm acceptance of the clauses in our standard supply agreement?',
  },

  // Cyber
  {
    n: 17,
    dim: 'cyber',
    title: 'Check domain breach history',
    body: 'Has the supplier’s email domain appeared in a publicly-known data breach? Crude but fast: Have I Been Pwned domain search (requires ownership verification) or supplier self-reported breach history.',
    flag: 'Major breach in the past 24 months with no evidence of post-breach remediation (password reset, MFA enforcement, credential rotation). Most domains have some exposure — what matters is whether the supplier knew and responded.',
    q: 'Has your domain been involved in a public breach in the last 24 months, and what remediation was taken?',
  },
  {
    n: 18,
    dim: 'cyber',
    title: 'Require ISO 27001 or SOC 2 Type II',
    body: 'Proportional to the data the supplier touches. A metal stamper who sees only POs needs none. An electronics partner with access to your designs or a logistics supplier with your customer address book needs ISO 27001 or a SOC 2 Type II.',
    flag: 'Supplier has access to PII, IP, or your production systems + no ISO 27001, no SOC 2, and refusal to complete even a SIG Lite or CAIQ security questionnaire = reject.',
    q: 'Do you hold ISO 27001 or a current SOC 2 Type II report, and can we review it under NDA?',
  },
  {
    n: 19,
    dim: 'cyber',
    title: 'Enforce multi-factor authentication',
    body: 'Does the supplier enforce MFA on email and any system that touches your data? Credential stuffing and business email compromise (BEC) are the most common vectors, and MFA blocks both cheaply.',
    flag: 'Supplier commercial contact using personal @gmail, @yahoo, or @outlook for business communication; admission that MFA is not enforced on email; past BEC incident disclosed without remediation.',
    q: 'Is MFA enforced organisation-wide on your email and on any portal we will share data through?',
  },
  {
    n: 20,
    dim: 'cyber',
    title: 'Lock in a 72-hour breach notification',
    body: 'Does the supplier have a documented incident response plan, and will they commit contractually to notify you within 72 hours of any breach affecting your data or operations?',
    flag: 'Refusal to accept a 72-hour notification clause; no IR plan; supplier’s answer to “who do we call if you are breached” is a blank stare.',
    q: 'Can you accept a 72-hour breach notification clause, and share the single point of contact in your IR plan?',
  },
]

// -----------------------------------------------------------------------------
// Page building blocks
// -----------------------------------------------------------------------------

function Header({ pageNum }) {
  if (!pageNum || pageNum < 3) return null
  return h(
    View,
    { style: styles.header, fixed: true },
    h(
      View,
      { style: styles.headerLeft },
      h(View, { style: styles.headerMark }),
      h(Text, { style: styles.headerTitle }, 'SUPPLIER RISK CHECKLIST 2026')
    ),
    h(Text, { style: styles.headerRight }, 'procurea.io')
  )
}

function Footer({ pageNum }) {
  if (!pageNum) return null
  return h(
    View,
    { style: styles.footer, fixed: true },
    h(
      Text,
      { style: styles.footerText },
      'Procurea · Supplier Risk Checklist 2026'
    ),
    h(
      Text,
      { style: styles.footerPage },
      `Page ${pageNum} of ${TOTAL_PAGES}`
    )
  )
}

function H1({ kicker, title }) {
  return h(
    View,
    null,
    kicker ? h(Text, { style: styles.h1Kicker }, kicker) : null,
    h(Text, { style: styles.h1 }, title),
    h(View, { style: styles.h1Rule })
  )
}

// -----------------------------------------------------------------------------
// Page 1: Cover
// -----------------------------------------------------------------------------

function CoverGrid() {
  // 4×5 = 20 cells; 8 filled, 12 outlined (per design brief)
  const filled = new Set([1, 2, 4, 5, 9, 12, 14, 17])
  const cells = []
  for (let i = 1; i <= 20; i++) {
    const isFilled = filled.has(i)
    cells.push(
      h(
        View,
        {
          key: `cell-${i}`,
          style: [
            styles.coverCell,
            isFilled ? styles.coverCellFilled : null,
          ],
        },
        h(
          Text,
          {
            style: [
              styles.coverCellText,
              isFilled ? styles.coverCellTextFilled : null,
            ],
          },
          String(i).padStart(2, '0')
        )
      )
    )
  }
  return h(
    View,
    { style: styles.coverGridWrap },
    h(
      Text,
      { style: styles.coverGridLabel },
      '20 verification points · 8 minimum for quick-scan'
    ),
    h(View, { style: styles.coverGrid }, ...cells)
  )
}

function CoverPage() {
  return h(
    Page,
    { size: 'A4', style: [styles.page, styles.cover] },
    h(
      View,
      { style: styles.coverInner },
      h(
        View,
        { style: styles.coverBrand },
        h(
          View,
          { style: styles.coverBrandMark },
          h(Text, { style: styles.coverBrandMarkText }, 'P')
        ),
        h(Text, { style: styles.coverBrandName }, 'PROCUREA')
      ),
      h(Text, { style: styles.coverEdition }, '2026 EDITION'),
      h(Text, { style: styles.coverTitle }, 'Supplier Risk'),
      h(Text, { style: styles.coverTitleAccent }, 'Checklist.'),
      h(
        Text,
        { style: styles.coverSubtitle },
        'The 20-point verification guide for procurement teams — five risk dimensions, named data sources, concrete red-flag thresholds, and re-check cadences you can actually run.'
      ),
      h(
        View,
        { style: styles.coverRuleRow },
        h(View, { style: styles.coverRule }),
        h(
          Text,
          { style: styles.coverTagline },
          '5 DIMENSIONS · 20 CHECKS · AUTO-REJECT THRESHOLDS'
        )
      ),
      h(
        View,
        { style: styles.coverMetaRow },
        h(
          View,
          { style: styles.coverMeta },
          h(Text, { style: styles.coverMetaLabel }, 'Published'),
          h(Text, { style: styles.coverMetaValue }, 'April 2026')
        ),
        h(
          View,
          { style: styles.coverMeta },
          h(Text, { style: styles.coverMetaLabel }, 'Next revision'),
          h(Text, { style: styles.coverMetaValue }, 'October 2026')
        ),
        h(
          View,
          { style: styles.coverMeta },
          h(Text, { style: styles.coverMetaLabel }, 'Format'),
          h(Text, { style: styles.coverMetaValue }, '9 pages · A4')
        ),
        h(
          View,
          { style: styles.coverMeta },
          h(Text, { style: styles.coverMetaLabel }, 'Licence'),
          h(Text, { style: styles.coverMetaValue }, 'Free to copy & adapt')
        )
      ),
      CoverGrid(),
      h(
        View,
        { style: styles.coverFooter },
        h(Text, { style: styles.coverFooterText }, 'By Procurea'),
        h(Text, { style: styles.coverFooterText }, 'procurea.io')
      )
    )
  )
}

// -----------------------------------------------------------------------------
// Page 2: Table of Contents + intro
// -----------------------------------------------------------------------------

function TocPage() {
  const rows = [
    {
      num: '01',
      label: 'Financial health',
      desc: 'Checks 1–4 · credit, statements, concentration',
      page: '03',
    },
    {
      num: '02',
      label: 'Operational resilience',
      desc: 'Checks 5–8 · ISO 9001, capacity, PPM, BCP',
      page: '04',
    },
    {
      num: '03',
      label: 'Geopolitical & regulatory',
      desc: 'Checks 9–12 · sanctions, export, CBAM, origin',
      page: '05',
    },
    {
      num: '04',
      label: 'ESG & compliance',
      desc: 'Checks 13–16 · ISO 14001, Scope 1+2, social audit, ABAC',
      page: '06',
    },
    {
      num: '05',
      label: 'Cyber & information security',
      desc: 'Checks 17–20 · breach, ISO 27001, MFA, IR plan',
      page: '07',
    },
    {
      num: '06',
      label: 'Quick-scan reference sheet',
      desc: 'Printable 20-check summary — copy for supplier calls',
      page: '08',
    },
    {
      num: '07',
      label: 'Automate with Procurea',
      desc: 'What the AI-native platform verifies for you',
      page: '09',
    },
  ]
  return h(
    Page,
    { size: 'A4', style: styles.page },
    Header({ pageNum: 2 }),
    H1({ kicker: 'CONTENTS', title: 'What’s in this checklist' }),
    h(
      Text,
      { style: styles.tocIntro },
      'In 2019 a 12-point supplier checklist was enough. In 2026 it isn’t. Geopolitics moved from background context to per-supplier verification. Cyber posture at a mid-tier metal stamper became your production risk. ESG regulation grew teeth — CSRD, CBAM, and the EU CSDDD turned ESG data into a compliance input, not a values statement. Twenty points is the minimum to cover five dimensions without over-engineering — fast enough for a qualification call, concrete enough to put in your SOP.'
    ),
    h(
      View,
      { style: styles.tocList },
      ...rows.map((r) =>
        h(
          View,
          { key: r.num, style: styles.tocRow },
          h(Text, { style: styles.tocNum }, r.num),
          h(Text, { style: styles.tocLabel }, r.label),
          h(Text, { style: styles.tocDesc }, r.desc),
          h(Text, { style: styles.tocPage }, r.page)
        )
      )
    ),
    h(
      View,
      { style: styles.tocBadge },
      h(Text, { style: styles.tocBadgeTitle }, 'How to use'),
      h(
        Text,
        { style: styles.tocBadgeText },
        'Quick-scan (5 min) for sub-€25k one-off purchases: run checks 1, 5, 9, and 17 and stop. Deep audit (45 min) for panel suppliers: run all 20, score each 0–2 for a 40-point total (≥32 approve · 24–31 conditional · <24 reject). Archive every evidence PDF — Internal Audit will ask for them when an incident eventually happens.'
      )
    ),
    Footer({ pageNum: 2 })
  )
}

// -----------------------------------------------------------------------------
// Check card + dimension banner
// -----------------------------------------------------------------------------

function DimensionBanner({ number, title, tagline, range }) {
  return h(
    View,
    { style: styles.dimBanner },
    h(
      View,
      { style: styles.dimBannerLeft },
      h(
        View,
        { style: styles.dimBannerNumBox },
        h(Text, { style: styles.dimBannerNum }, number)
      ),
      h(
        View,
        { style: styles.dimBannerText },
        h(Text, { style: styles.dimBannerTitle }, title),
        h(Text, { style: styles.dimBannerSub }, tagline)
      )
    ),
    h(Text, { style: styles.dimBannerRange }, range)
  )
}

function CheckCard(check, isLastInRow) {
  return h(
    View,
    {
      key: `check-${check.n}`,
      style: [styles.card, isLastInRow ? { marginRight: 0 } : null],
      wrap: false,
    },
    h(
      View,
      { style: styles.cardHead },
      h(
        View,
        { style: styles.cardBadge },
        h(
          Text,
          { style: styles.cardBadgeText },
          String(check.n).padStart(2, '0')
        )
      ),
      h(Text, { style: styles.cardTitle }, check.title)
    ),
    h(Text, { style: styles.cardBody }, check.body),
    h(
      View,
      { style: styles.cardFlagBox },
      h(Text, { style: styles.cardFlagLabel }, 'Red flag'),
      h(Text, { style: styles.cardFlagText }, check.flag)
    ),
    h(
      View,
      { style: styles.cardQBox },
      h(Text, { style: styles.cardQLabel }, 'Ask'),
      h(Text, { style: styles.cardQText }, `“${check.q}”`)
    )
  )
}

// Renders 4 check cards in a 2×2 grid so they fit on one page
function CheckGrid(checks) {
  const rows = []
  for (let i = 0; i < checks.length; i += 2) {
    const left = checks[i]
    const right = checks[i + 1]
    rows.push(
      h(
        View,
        { key: `row-${i}`, style: styles.cardRow, wrap: false },
        h(View, { style: styles.cardCol }, CheckCard(left, false)),
        right
          ? h(View, { style: styles.cardColLast }, CheckCard(right, true))
          : h(View, { style: styles.cardColLast })
      )
    )
  }
  return rows
}

function DimensionPage({ dimIndex, pageNum, kicker }) {
  const dim = DIMENSIONS[dimIndex]
  const checks = CHECKS.filter((c) => c.dim === dim.key)
  return h(
    Page,
    { size: 'A4', style: styles.page },
    Header({ pageNum }),
    H1({ kicker, title: dim.title }),
    DimensionBanner({
      number: String(dimIndex + 1).padStart(2, '0'),
      title: dim.title,
      tagline: dim.tagline,
      range: dim.range,
    }),
    ...CheckGrid(checks),
    Footer({ pageNum })
  )
}

// Combined page for two dimensions (ESG + Cyber on single page would be too dense)
// We do one dim per page 3-5 and then combine 4 (ESG) + 5 (Cyber) differently...
// Actually spec says 4 dims across pages 3-6 but we have 5 dims. We'll use:
//   Page 3: Financial
//   Page 4: Operational
//   Page 5: Geopolitical
//   Page 6: ESG + Cyber (compact) — or split
// Simpler and better: spec says 6 pages of content, we'll do 5 dim pages (3-7) + Cyber on 6 + QS on 7 + CTA on 8.
// Let's do one dim per page; total 5 dim pages (3-7), quick scan on 7, CTA on 8
// That gives 9 pages. Re-plan: the spec says pages 3-6 for 20 checks, so we must combine.
//
// Plan:
//   Page 3: Financial (4 cards)
//   Page 4: Operational (4 cards)
//   Page 5: Geopolitical (4 cards)
//   Page 6: ESG (4 cards)
//   Page 7: Cyber (4 cards) — pushes QS/CTA to pages 8 & 9. We'll target 9-page doc.
// Actually spec said 6-8 pages. 8 pages work if we do:
//   Cover(1), TOC(2), Financial(3), Operational(4), Geo(5), ESG(6), Cyber(7)... +QS+CTA = 9. Too many.
// Decision: combine ESG + Cyber onto one page with more compact cards. Let's use 2-column? Cards have too much text.
// Alternative: pages 3-4 for Financial+Operational (2 dim per page, 8 cards each page). Cards will need to be more compact.
// Actually: pack 2 dims per page by allowing natural page break inside. With wrap: false on cards and flowing content, react-pdf will fit as many as possible.

// Simplification: Output 5 dimension pages (3-7), QS(8), and skip CTA consolidation, updating TOTAL_PAGES accordingly.
// Or output in sequence, let content flow. Let's be pragmatic:
// Plan (final): 8 pages total
//   1 Cover
//   2 TOC
//   3 Financial (4 checks)
//   4 Operational (4 checks)
//   5 Geopolitical (4 checks)
//   6 ESG + Cyber combined (8 checks compact)
//   7 Quick-scan
//   8 CTA
// For page 6 combined, we need compact card variant. Keep it simple — allow natural flow
// but with compact layout.

// -----------------------------------------------------------------------------
// Combined ESG + Cyber page
// -----------------------------------------------------------------------------

function CompactCheckCard(check, accentColor) {
  return h(
    View,
    {
      key: `compact-${check.n}`,
      style: [
        styles.card,
        {
          borderLeftColor: accentColor || COLOR.teal,
          padding: 10,
          marginBottom: 8,
        },
      ],
      wrap: false,
    },
    h(
      View,
      { style: styles.cardHead },
      h(
        View,
        {
          style: [styles.cardBadge, { backgroundColor: accentColor || COLOR.teal }],
        },
        h(
          Text,
          { style: styles.cardBadgeText },
          String(check.n).padStart(2, '0')
        )
      ),
      h(Text, { style: styles.cardTitle }, check.title)
    ),
    h(
      Text,
      { style: [styles.cardBody, { fontSize: 9, marginBottom: 6 }] },
      check.body
    ),
    h(
      View,
      { style: [styles.cardFlagBox, { padding: 6 }] },
      h(
        Text,
        { style: [styles.cardFlagLabel, { width: 60, fontSize: 7.5 }] },
        'Red flag'
      ),
      h(Text, { style: [styles.cardFlagText, { fontSize: 8.5 }] }, check.flag)
    )
  )
}

function EsgCyberPage({ pageNum }) {
  const esg = CHECKS.filter((c) => c.dim === 'esg')
  const cyber = CHECKS.filter((c) => c.dim === 'cyber')
  return h(
    Page,
    { size: 'A4', style: styles.page },
    Header({ pageNum }),
    H1({
      kicker: 'DIMENSIONS 04 & 05',
      title: 'ESG, compliance & cyber',
    }),
    // ESG section
    h(
      View,
      {
        style: [
          styles.dimBanner,
          { backgroundColor: COLOR.tealDark, padding: 10, marginBottom: 10 },
        ],
      },
      h(
        View,
        { style: styles.dimBannerLeft },
        h(
          View,
          {
            style: [
              styles.dimBannerNumBox,
              { width: 24, height: 24 },
            ],
          },
          h(Text, { style: [styles.dimBannerNum, { fontSize: 11 }] }, '04')
        ),
        h(
          View,
          { style: styles.dimBannerText },
          h(
            Text,
            { style: [styles.dimBannerTitle, { fontSize: 11 }] },
            'ESG & compliance'
          ),
          h(
            Text,
            { style: styles.dimBannerSub },
            'CSRD, CBAM, Scope 3, anti-bribery'
          )
        )
      ),
      h(Text, { style: styles.dimBannerRange }, 'CHECKS 13 — 16')
    ),
    ...esg.map((c) => CompactCheckCard(c, COLOR.emerald)),
    // Cyber section
    h(
      View,
      {
        style: [
          styles.dimBanner,
          {
            backgroundColor: COLOR.tealDark,
            padding: 10,
            marginBottom: 10,
            marginTop: 8,
          },
        ],
      },
      h(
        View,
        { style: styles.dimBannerLeft },
        h(
          View,
          {
            style: [
              styles.dimBannerNumBox,
              { width: 24, height: 24 },
            ],
          },
          h(Text, { style: [styles.dimBannerNum, { fontSize: 11 }] }, '05')
        ),
        h(
          View,
          { style: styles.dimBannerText },
          h(
            Text,
            { style: [styles.dimBannerTitle, { fontSize: 11 }] },
            'Cyber & information security'
          ),
          h(
            Text,
            { style: styles.dimBannerSub },
            'Breach history, certifications, MFA, IR response'
          )
        )
      ),
      h(Text, { style: styles.dimBannerRange }, 'CHECKS 17 — 20')
    ),
    ...cyber.map((c) => CompactCheckCard(c, COLOR.amber)),
    Footer({ pageNum })
  )
}

// -----------------------------------------------------------------------------
// Quick-scan page
// -----------------------------------------------------------------------------

function QsGroup({ title, max, checks }) {
  return h(
    View,
    { style: styles.qsGroup, wrap: false },
    h(
      View,
      { style: styles.qsGroupHead },
      h(Text, { style: styles.qsGroupTitle }, title),
      h(Text, { style: styles.qsGroupMax }, max)
    ),
    ...checks.map((c) =>
      h(
        View,
        { key: `qs-${c.n}`, style: styles.qsRow },
        h(View, { style: styles.qsCheckbox }),
        h(Text, { style: styles.qsNum }, String(c.n).padStart(2, '0')),
        h(Text, { style: styles.qsText }, c.short)
      )
    )
  )
}

function QuickScanPage({ pageNum }) {
  const short = {
    1: 'Legal entity verified (registry + VAT/EIN)',
    2: 'Credit bureau score acceptable',
    3: 'Audited financials available (or under NDA)',
    4: 'Single-customer concentration < 40%',
    5: 'ISO 9001 (or sector equivalent) current',
    6: 'No single-site + > 75% utilisation concern',
    7: 'PPM data available and within threshold',
    8: 'Product liability insurance + BCP in place',
    9: 'Sanctions screening clear (OFAC/EU/UK/UN)',
    10: 'Export classification confirmed (ECCN/EAR/Annex I)',
    11: 'CBAM exposure documented (if applicable)',
    12: 'Country of origin + CoO + HTS code verified',
    13: 'ISO 14001 (or sector equivalent) current',
    14: 'Scope 1 + 2 emissions disclosed',
    15: 'Social audit (SMETA/BSCI/EcoVadis) current',
    16: 'ABAC policy exists + clause accepted',
    17: 'No unresolved breach on domain',
    18: 'ISO 27001 / SOC 2 / questionnaire complete',
    19: 'MFA enforced across email + portals',
    20: '72-hour IR notification clause accepted',
  }
  const mk = (n) => ({ n, short: short[n] })
  const groups = [
    { title: 'Financial', max: '0–2 · 8 max', checks: [1, 2, 3, 4].map(mk) },
    { title: 'Operational', max: '0–2 · 8 max', checks: [5, 6, 7, 8].map(mk) },
    { title: 'Geopolitical', max: '0–2 · 8 max', checks: [9, 10, 11, 12].map(mk) },
    { title: 'ESG', max: '0–2 · 8 max', checks: [13, 14, 15, 16].map(mk) },
    { title: 'Cyber', max: '0–2 · 8 max', checks: [17, 18, 19, 20].map(mk) },
  ]
  return h(
    Page,
    { size: 'A4', style: styles.page },
    Header({ pageNum }),
    H1({ kicker: 'QUICK-SCAN REFERENCE', title: 'One-page supplier scorecard' }),
    h(
      Text,
      { style: styles.qsIntro },
      'Photocopy this page. Tick each check as you qualify a supplier — score 0 (fail), 1 (conditional), or 2 (pass). 32+ approves, 24–31 is conditional with a remediation plan, under 24 reject or escalate for exception approval.'
    ),
    h(
      View,
      { style: styles.qsMeta },
      h(
        View,
        { style: styles.qsMetaField },
        h(Text, { style: styles.qsMetaLabel }, 'Supplier'),
        h(View, { style: styles.qsMetaLine })
      ),
      h(
        View,
        { style: styles.qsMetaField },
        h(Text, { style: styles.qsMetaLabel }, 'Reviewer'),
        h(View, { style: styles.qsMetaLine })
      ),
      h(
        View,
        { style: styles.qsMetaField },
        h(Text, { style: styles.qsMetaLabel }, 'Date'),
        h(View, { style: styles.qsMetaLine })
      ),
      h(
        View,
        { style: styles.qsMetaField },
        h(Text, { style: styles.qsMetaLabel }, 'Category'),
        h(View, { style: styles.qsMetaLine })
      )
    ),
    h(
      View,
      { style: styles.qsColumns },
      h(
        View,
        { style: [styles.qsCol, styles.qsColLeft] },
        QsGroup(groups[0]),
        QsGroup(groups[1]),
        QsGroup(groups[2])
      ),
      h(
        View,
        { style: styles.qsCol },
        QsGroup(groups[3]),
        QsGroup(groups[4])
      )
    ),
    h(
      View,
      { style: styles.qsScoreBox },
      h(
        View,
        { style: styles.qsScoreRow },
        h(Text, { style: styles.qsScoreLabel }, 'Total score'),
        h(View, { style: styles.qsScoreLine }),
        h(
          Text,
          {
            style: {
              fontSize: 10,
              color: COLOR.muted,
              marginLeft: 6,
              fontFamily: 'Helvetica-Bold',
            },
          },
          ' / 40'
        )
      ),
      h(
        Text,
        { style: styles.qsScoreLegend },
        '32–40 Approve  ·  24–31 Conditional (remediation list attached)  ·  Under 24 Reject or escalate for exception approval'
      ),
      h(
        View,
        { style: [styles.qsScoreRow, { marginTop: 10 }] },
        h(
          Text,
          { style: [styles.qsScoreLabel, { fontFamily: 'Helvetica' }] },
          'Reviewer signature'
        ),
        h(View, { style: [styles.qsScoreLine, { width: 180 }] })
      ),
      h(
        View,
        { style: styles.qsScoreRow },
        h(
          Text,
          { style: [styles.qsScoreLabel, { fontFamily: 'Helvetica' }] },
          'Category director (conditional / reject)'
        ),
        h(View, { style: [styles.qsScoreLine, { width: 180 }] })
      )
    ),
    Footer({ pageNum })
  )
}

// -----------------------------------------------------------------------------
// CTA page
// -----------------------------------------------------------------------------

function QRPlaceholder() {
  // Render an SVG-style QR-looking placeholder (modules) so it visually resembles
  // a real QR code without an external dependency.
  const size = 56
  const modules = 9
  const cell = size / modules
  const pattern = [
    '111111010',
    '100001001',
    '101101010',
    '101101001',
    '101101110',
    '100001010',
    '111111011',
    '000000010',
    '011010111',
  ]
  const rects = []
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      if (pattern[y][x] === '1') {
        rects.push(
          h(Rect, {
            key: `m-${x}-${y}`,
            x: x * cell,
            y: y * cell,
            width: cell,
            height: cell,
            fill: COLOR.tealDark,
          })
        )
      }
    }
  }
  return h(
    Svg,
    { width: size, height: size, viewBox: `0 0 ${size} ${size}` },
    ...rects
  )
}

function CtaPage({ pageNum }) {
  return h(
    Page,
    { size: 'A4', style: styles.page },
    Header({ pageNum }),
    H1({
      kicker: 'NEXT STEP',
      title: 'This is the checklist. Here is what to do with it.',
    }),
    h(
      View,
      { style: styles.ctaHero },
      h(Text, { style: styles.ctaKicker }, 'WHY THIS MATTERS'),
      h(
        Text,
        { style: styles.ctaTitle },
        'A twenty-point audit on every new supplier takes 45 minutes — if you have the data.'
      ),
      h(
        Text,
        { style: styles.ctaLead },
        'Procurea finds and verifies 100–250 suppliers per campaign across 26 languages, so your 30-hour manual sourcing project becomes roughly 20 minutes of workflow plus the human judgement this checklist protects. The verification layer runs in parallel — certificates, sanctions, registries, domain posture — before a supplier ever lands in your shortlist.'
      )
    ),
    h(
      View,
      { style: styles.ctaBullets },
      h(
        View,
        { style: styles.ctaBulletRow },
        h(
          View,
          { style: styles.ctaBulletNum },
          h(Text, { style: styles.ctaBulletNumText }, '01')
        ),
        h(
          View,
          { style: styles.ctaBulletBody },
          h(
            Text,
            { style: styles.ctaBulletTitle },
            'Automated checks 1, 5, 9, 12, 17'
          ),
          h(
            Text,
            { style: styles.ctaBulletText },
            'Legal entity via national registries + VIES, ISO certification numbers cross-checked against accredited registrar databases, OFAC + EU + UK sanctions screened weekly, country-of-origin probing, and domain breach exposure surfaced before you spend a minute on qualification.'
          )
        )
      ),
      h(
        View,
        { style: styles.ctaBulletRow },
        h(
          View,
          { style: styles.ctaBulletNum },
          h(Text, { style: styles.ctaBulletNumText }, '02')
        ),
        h(
          View,
          { style: styles.ctaBulletBody },
          h(
            Text,
            { style: styles.ctaBulletTitle },
            'Enrichment across 26 languages'
          ),
          h(
            Text,
            { style: styles.ctaBulletText },
            'Supplier data is pulled in-language — Turkish, Polish, Vietnamese, Mandarin. The Gemini-powered screener reads each supplier website, confirms the producing facility matches the quote address, and flags the generic-trading-company pattern that fails Check 1 before a buyer even opens the tab.'
          )
        )
      ),
      h(
        View,
        { style: styles.ctaBulletRow },
        h(
          View,
          { style: styles.ctaBulletNum },
          h(Text, { style: styles.ctaBulletNumText }, '03')
        ),
        h(
          View,
          { style: styles.ctaBulletBody },
          h(
            Text,
            { style: styles.ctaBulletTitle },
            'The human judgement you still owe'
          ),
          h(
            Text,
            { style: styles.ctaBulletText },
            'Checks 4, 6, 7, 8, 14, 15 remain yours — concentration risk, capacity, PPM, insurance, Scope 1+2, social audit. Procurea surfaces the evidence; your category manager, controller, and InfoSec lead make the call. That division of labour is the point.'
          )
        )
      )
    ),
    h(
      View,
      { style: styles.ctaActionRow },
      h(
        View,
        { style: styles.ctaQR },
        QRPlaceholder(),
        h(Text, { style: [styles.ctaQRText, { marginTop: 3 }] }, 'Scan to start')
      ),
      h(
        View,
        { style: styles.ctaActionBody },
        h(Text, { style: styles.ctaActionLabel }, 'TRY IT FREE'),
        h(Text, { style: styles.ctaActionTitle }, 'Run one sourcing campaign on us'),
        h(Text, { style: styles.ctaActionUrl }, 'app.procurea.io/signup')
      )
    ),
    h(
      View,
      { style: styles.ctaFooter },
      h(
        View,
        { style: styles.ctaFooterRow },
        h(Text, { style: styles.ctaFooterLabel }, 'Contact'),
        h(Text, { style: styles.ctaFooterValue }, 'hello@procurea.io')
      ),
      h(
        View,
        { style: styles.ctaFooterRow },
        h(Text, { style: styles.ctaFooterLabel }, 'Web'),
        h(Text, { style: styles.ctaFooterValue }, 'procurea.io')
      ),
      h(
        View,
        { style: styles.ctaFooterRow },
        h(Text, { style: styles.ctaFooterLabel }, 'Published'),
        h(
          Text,
          { style: styles.ctaFooterValue },
          'April 2026 · Next revision October 2026'
        )
      ),
      h(
        Text,
        { style: styles.ctaFineprint },
        'This checklist is free to use, copy, and adapt to your organisation’s SOP. No attribution required. If it saves you a painful incident, we’d love to hear about it — hello@procurea.io.'
      )
    ),
    Footer({ pageNum })
  )
}

// -----------------------------------------------------------------------------
// Document
// -----------------------------------------------------------------------------

function Doc() {
  return h(
    Document,
    {
      title: 'Supplier Risk Checklist 2026',
      author: 'Procurea',
      subject: 'The 20-Point Verification Guide for Procurement Teams',
      keywords:
        'supplier risk, vendor risk, supplier due diligence, procurement, verification',
      creator: 'Procurea',
      producer: 'Procurea via @react-pdf/renderer',
    },
    CoverPage(),
    TocPage(),
    DimensionPage({ dimIndex: 0, pageNum: 3, kicker: 'DIMENSION 01' }),
    DimensionPage({ dimIndex: 1, pageNum: 4, kicker: 'DIMENSION 02' }),
    DimensionPage({ dimIndex: 2, pageNum: 5, kicker: 'DIMENSION 03' }),
    DimensionPage({ dimIndex: 3, pageNum: 6, kicker: 'DIMENSION 04' }),
    DimensionPage({ dimIndex: 4, pageNum: 7, kicker: 'DIMENSION 05' }),
    QuickScanPage({ pageNum: 8 }),
    CtaPage({ pageNum: 9 })
  )
}

// -----------------------------------------------------------------------------
// Render
// -----------------------------------------------------------------------------

async function main() {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true })
  }

  console.log('→ Rendering supplier-risk-checklist-2026.pdf')
  await renderToFile(Doc(), OUT_FILE)

  const stat = statSync(OUT_FILE)
  const kb = (stat.size / 1024).toFixed(1)
  console.log(`✓ Wrote ${OUT_FILE}`)
  console.log(`  ${kb} KB  (target 100–500 KB)`)
}

main().catch((err) => {
  console.error('✗ Failed:', err)
  process.exit(1)
})
