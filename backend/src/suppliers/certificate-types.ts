// Structured certificate types — central enum used by Prisma model + DTOs + UI.
// Kept as const-string-array (not TS enum) so it serializes cleanly to JSON
// and can be imported by the frontend from a shared types module later.

export const CERTIFICATE_TYPES = [
  'ISO_9001',
  'ISO_14001',
  'ISO_45001',
  'ISO_13485',
  'ISO_22000',
  'IATF_16949',
  'AS_9100',
  'CE',
  'MDR',
  'ROHS',
  'REACH',
  'HACCP',
  'BRCGS',
  'IFS_FOOD',
  'FSC',
  'BSCI',
  'ORGANIC_EU',
  'MSC',
  'KOSHER',
  'HALAL',
  'FAIR_TRADE',
  'OTHER',
] as const;

export type CertificateType = (typeof CERTIFICATE_TYPES)[number];

export const CERTIFICATE_LABELS: Record<CertificateType, string> = {
  ISO_9001: 'ISO 9001',
  ISO_14001: 'ISO 14001',
  ISO_45001: 'ISO 45001',
  ISO_13485: 'ISO 13485',
  ISO_22000: 'ISO 22000',
  IATF_16949: 'IATF 16949',
  AS_9100: 'AS 9100',
  CE: 'CE marking',
  MDR: 'MDR (EU 2017/745)',
  ROHS: 'RoHS',
  REACH: 'REACH',
  HACCP: 'HACCP',
  BRCGS: 'BRCGS',
  IFS_FOOD: 'IFS Food',
  FSC: 'FSC',
  BSCI: 'BSCI',
  ORGANIC_EU: 'Organic EU',
  MSC: 'MSC / ASC',
  KOSHER: 'Kosher',
  HALAL: 'Halal',
  FAIR_TRADE: 'Fair Trade',
  OTHER: 'Other',
};

// Heuristic legacy-string → structured type mapping.
// Used by migrate-legacy script + AI screening downstream.
const LEGACY_MAPPING: Array<[RegExp, CertificateType]> = [
  [/iatf\s*16949/i, 'IATF_16949'],
  [/as\s*9100/i, 'AS_9100'],
  [/iso\s*9001/i, 'ISO_9001'],
  [/iso\s*14001/i, 'ISO_14001'],
  [/iso\s*45001/i, 'ISO_45001'],
  [/iso\s*13485/i, 'ISO_13485'],
  [/iso\s*22000/i, 'ISO_22000'],
  [/mdr|medical\s*device\s*regulation/i, 'MDR'],
  [/ce\s*mark|\bce\b/i, 'CE'],
  [/rohs/i, 'ROHS'],
  [/reach/i, 'REACH'],
  [/haccp/i, 'HACCP'],
  [/brcgs|\bbrc\b/i, 'BRCGS'],
  [/ifs\s*food/i, 'IFS_FOOD'],
  [/\bfsc\b/i, 'FSC'],
  [/bsci/i, 'BSCI'],
  [/organic|\beko\b|\bbio\b/i, 'ORGANIC_EU'],
  [/msc|asc/i, 'MSC'],
  [/kosher/i, 'KOSHER'],
  [/halal/i, 'HALAL'],
  [/fair\s*trade/i, 'FAIR_TRADE'],
];

export function detectCertificateType(freeText: string): CertificateType {
  for (const [pattern, type] of LEGACY_MAPPING) {
    if (pattern.test(freeText)) return type;
  }
  return 'OTHER';
}

// Structured certificate payload emitted by sourcing agents (Screener/Enrichment/Auditor).
// All fields except `code` are best-effort — pipeline cannot always find them.
export interface ExtractedCertificate {
  code: string;              // Raw label as printed on the website, e.g. "ISO 9001:2015"
  type?: CertificateType;    // Normalized type, derived via detectCertificateType if absent
  issuer?: string;           // Certification body — "TÜV SÜD", "DEKRA", "Bureau Veritas"…
  certNumber?: string;       // Registry number printed under the seal
  issuedAt?: string;         // ISO-8601 date (or null if unknown)
  validUntil?: string;       // ISO-8601 date (or null if unknown)
  documentUrl?: string;      // Absolute URL to PDF/image of the certificate on the supplier site
  evidenceQuote?: string;    // Short text snippet where the cert was seen — for debugging/audit
}

// Parse a possibly-messy ISO-like date string into a valid Date, or null.
// Gemini sometimes emits "YYYY-MM", "YYYY", or non-ISO formats — we accept only parseable full dates.
export function parseLooseDate(raw: unknown): Date | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;
  // Reject partial dates (need YYYY-MM-DD at minimum)
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Normalize whatever the AI returned into a clean ExtractedCertificate[].
// Dedupes by (type, code), drops entries with empty code, derives `type` if missing.
export function normalizeExtractedCertificates(raw: unknown): ExtractedCertificate[] {
  if (!Array.isArray(raw)) return [];
  const out: ExtractedCertificate[] = [];
  const seen = new Set<string>();
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const obj = entry as Record<string, unknown>;
    const code = typeof obj.code === 'string' ? obj.code.trim() : '';
    if (!code) continue;
    const type = (typeof obj.type === 'string' && obj.type.trim())
      ? (obj.type.trim() as CertificateType)
      : detectCertificateType(code);
    const key = `${type}::${code.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const toStr = (v: unknown) => typeof v === 'string' ? v.trim() || undefined : undefined;
    out.push({
      code,
      type,
      issuer: toStr(obj.issuer),
      certNumber: toStr(obj.certNumber),
      issuedAt: toStr(obj.issuedAt),
      validUntil: toStr(obj.validUntil),
      documentUrl: toStr(obj.documentUrl),
      evidenceQuote: toStr(obj.evidenceQuote),
    });
  }
  return out;
}

// Status — computed from validUntil, stored for sort/filter.
// UNKNOWN is used for PIPELINE-discovered certs where no expiry date was extracted.
export type CertificateStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'UNKNOWN';
export const EXPIRY_ALERT_DAYS = 90;

export function computeStatus(
  validUntil: Date | null | undefined,
  now: Date = new Date(),
  alertDays: number = EXPIRY_ALERT_DAYS,
): CertificateStatus {
  if (!validUntil) return 'UNKNOWN';
  const msLeft = validUntil.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return 'EXPIRED';
  if (daysLeft <= alertDays) return 'EXPIRING_SOON';
  return 'ACTIVE';
}

// Evidence tier for a cert claim.
//   EXTRACTED — string matched on supplier website, no number/date/issuer
//   EVIDENCED — at least one of {certNumber, validUntil, issuer, documentUrl} found on the supplier site
//   VERIFIED  — cross-checked against an external registry (IAF CertSearch, issuer portal, etc.)
export type CertificateVerificationStatus = 'EXTRACTED' | 'EVIDENCED' | 'VERIFIED';

export type CertificateSource = 'MANUAL' | 'PORTAL' | 'PIPELINE';

// Heuristic: upgrade EXTRACTED → EVIDENCED when the pipeline captures any hard signal.
export function computeVerificationStatus(signals: {
  certNumber?: string | null;
  validUntil?: Date | string | null;
  issuer?: string | null;
  documentUrl?: string | null;
  issuedAt?: Date | string | null;
}): CertificateVerificationStatus {
  const hasHardSignal =
    (signals.certNumber && String(signals.certNumber).trim().length > 0) ||
    !!signals.validUntil ||
    !!signals.issuedAt ||
    (signals.issuer && String(signals.issuer).trim().length > 0) ||
    (signals.documentUrl && String(signals.documentUrl).trim().length > 0);
  return hasHardSignal ? 'EVIDENCED' : 'EXTRACTED';
}
