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

// Status — computed from validUntil, stored for sort/filter.
export type CertificateStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
export const EXPIRY_ALERT_DAYS = 90;

export function computeStatus(
  validUntil: Date,
  now: Date = new Date(),
  alertDays: number = EXPIRY_ALERT_DAYS,
): CertificateStatus {
  const msLeft = validUntil.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return 'EXPIRED';
  if (daysLeft <= alertDays) return 'EXPIRING_SOON';
  return 'ACTIVE';
}
