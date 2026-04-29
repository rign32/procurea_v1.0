/**
 * Cert taxonomy for HARD_FILTER_CERT.
 *
 * Background: buyers fill `requiredCertificates[]` in the wizard or via brief-parser.
 * Some entries are corporate certifications visible on a vendor homepage (ISO 9001,
 * GMP, DMF). Others are per-batch project documents that are NEVER on a homepage
 * (Certificate of Analysis, Written Confirmation, MSDS) — those should be requested
 * at RFQ time, not used to gate the entire pipeline.
 *
 * The previous hard filter did a literal substring match: "Drug Master File" never
 * matched a homepage that listed only "DMF", so legitimate API manufacturers got
 * dropped to zero. This module fixes that by:
 *   1. Mapping a buyer's free-text requirement to a canonical cert via aliases.
 *   2. Routing per-batch document requests to a soft-pass bucket (logged, not blocking).
 */

/**
 * Canonical cert → aliases that may appear on a vendor homepage.
 * Match is case-insensitive substring against either side (canonical-in-found OR alias-in-found).
 */
export const CERT_TAXONOMY: Record<string, string[]> = {
    GMP: ['GMP', 'CGMP', 'EU GMP', 'WHO GMP', 'FDA GMP', 'GOOD MANUFACTURING PRACTICE'],
    DMF: ['DMF', 'USDMF', 'EDMF', 'JDMF', 'DRUG MASTER FILE', 'CEP', 'CERTIFICATE OF SUITABILITY', 'COS'],
    'ISO 9001': ['ISO 9001', 'ISO9001', 'ISO-9001'],
    'ISO 14001': ['ISO 14001', 'ISO14001', 'ISO-14001'],
    'ISO 13485': ['ISO 13485', 'ISO13485'],
    'ISO 22000': ['ISO 22000', 'ISO22000'],
    'ISO 45001': ['ISO 45001', 'ISO45001'],
    'ISO 27001': ['ISO 27001', 'ISO27001'],
    IFS: ['IFS', 'INTERNATIONAL FEATURED STANDARDS'],
    BRC: ['BRC', 'BRCGS', 'BRITISH RETAIL CONSORTIUM'],
    HACCP: ['HACCP'],
    HALAL: ['HALAL'],
    KOSHER: ['KOSHER'],
    FSC: ['FSC', 'FOREST STEWARDSHIP COUNCIL'],
    PEFC: ['PEFC'],
    REACH: ['REACH'],
    ROHS: ['ROHS', 'RoHS'],
    CE: ['CE MARK', 'CE MARKED', 'CE/MDR'],
    MDR: ['MDR', 'EU MDR', 'MEDICAL DEVICE REGULATION'],
    FDA: ['FDA', 'US FDA', 'FDA APPROVED', 'FDA REGISTERED'],
    MHRA: ['MHRA'],
    PMDA: ['PMDA', 'JAPAN PMDA'],
    'WHO PQ': ['WHO PQ', 'WHO PREQUALIFICATION'],
};

/**
 * Per-batch / project-level documents that buyers sometimes type into the cert field.
 * These are NEVER homepage badges — they're issued per shipment or on request.
 * We accept them through the hard filter and pass the requirement to the RFQ stage.
 */
export const PROJECT_LEVEL_DOCS: string[] = [
    'CERTIFICATE OF ANALYSIS', 'CERTIFIATE OF ANALYSIS', // common typo
    'COA', 'C OF A', 'C/A',
    'WRITTEN CONFIRMATION', 'WC',
    'MSDS', 'SDS', 'SAFETY DATA SHEET',
    'TDS', 'TECHNICAL DATA SHEET',
    'SPEC SHEET', 'SPECIFICATION SHEET',
    'COO', 'CERTIFICATE OF ORIGIN',
];

function normalize(s: string): string {
    return String(s || '').toUpperCase().trim().replace(/\s+/g, ' ');
}

/**
 * Map a free-text buyer requirement to its canonical cert key, or null if it's
 * not a recognized homepage cert. Soft matches both directions (canonical-in-input
 * OR alias-in-input).
 */
export function findCertCanonical(rawTerm: string): string | null {
    const up = normalize(rawTerm);
    if (!up) return null;
    for (const [canonical, aliases] of Object.entries(CERT_TAXONOMY)) {
        if (canonical === up) return canonical;
        for (const alias of aliases) {
            if (alias === up || up.includes(alias) || alias.includes(up)) return canonical;
        }
    }
    return null;
}

export function isProjectLevelDoc(rawTerm: string): boolean {
    const up = normalize(rawTerm);
    if (!up) return false;
    return PROJECT_LEVEL_DOCS.some(doc => up === doc || up.includes(doc) || doc.includes(up));
}

/**
 * Check whether a homepage cert list (`found`) satisfies the canonical cert.
 */
export function homepageHasCert(canonical: string, found: string[]): boolean {
    const aliases = CERT_TAXONOMY[canonical] || [canonical];
    const foundUp = found.map(normalize);
    return aliases.some(alias => foundUp.some(f => f === alias || f.includes(alias) || alias.includes(f)));
}

export interface CertCheckResult {
    /** Canonical certs that the supplier homepage doesn't show — these should hard-reject. */
    missing: string[];
    /** Buyer requirements the supplier doesn't have a homepage badge for, but which are
     *  per-batch / project-level docs. The supplier passes; the buyer requests at RFQ time. */
    softPass: string[];
    /** Buyer requirements that don't fit the taxonomy at all. Soft pass with a log line
     *  so we can audit what users are typing. */
    unknown: string[];
}

/**
 * Decide which buyer-required certs are missing (hard reject) vs soft-passed.
 *
 * A buyer requirement gates the supplier ONLY if:
 *   - It maps to a known canonical cert (GMP/DMF/ISO/etc.), AND
 *   - None of that cert's aliases appear in the supplier's homepage cert list.
 *
 * Project-level docs (CoA, Written confirmation, MSDS) and unrecognized strings
 * are routed to soft-pass. They're not silently lost — caller can log them.
 */
export function checkRequiredCerts(required: string[], found: string[]): CertCheckResult {
    const result: CertCheckResult = { missing: [], softPass: [], unknown: [] };
    for (const req of required) {
        const reqStr = String(req || '').trim();
        if (!reqStr) continue;
        const canonical = findCertCanonical(reqStr);
        if (canonical) {
            if (!homepageHasCert(canonical, found)) {
                result.missing.push(canonical);
            }
            continue;
        }
        if (isProjectLevelDoc(reqStr)) {
            result.softPass.push(reqStr);
            continue;
        }
        result.unknown.push(reqStr);
    }
    return result;
}
