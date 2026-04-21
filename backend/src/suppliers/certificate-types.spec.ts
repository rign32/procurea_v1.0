import {
    computeStatus,
    computeVerificationStatus,
    detectCertificateType,
    normalizeExtractedCertificates,
    parseLooseDate,
} from './certificate-types';

describe('certificate-types — pure helpers', () => {
    describe('computeStatus', () => {
        it('returns UNKNOWN for null/undefined validUntil', () => {
            expect(computeStatus(null)).toBe('UNKNOWN');
            expect(computeStatus(undefined)).toBe('UNKNOWN');
        });

        it('returns EXPIRED when date is in the past', () => {
            expect(computeStatus(new Date('2020-01-01'))).toBe('EXPIRED');
        });

        it('returns ACTIVE when date is > 90 days away', () => {
            const far = new Date(Date.now() + 200 * 24 * 60 * 60 * 1000);
            expect(computeStatus(far)).toBe('ACTIVE');
        });

        it('returns EXPIRING_SOON within 90-day window', () => {
            const near = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            expect(computeStatus(near)).toBe('EXPIRING_SOON');
        });
    });

    describe('parseLooseDate', () => {
        it('parses full ISO date', () => {
            const d = parseLooseDate('2027-06-01');
            expect(d).toBeInstanceOf(Date);
            expect(d?.getUTCFullYear()).toBe(2027);
        });

        it('rejects partial dates (YYYY-MM)', () => {
            expect(parseLooseDate('2027-06')).toBeNull();
        });

        it('rejects year-only', () => {
            expect(parseLooseDate('2027')).toBeNull();
        });

        it('rejects garbage', () => {
            expect(parseLooseDate('tbd')).toBeNull();
            expect(parseLooseDate('')).toBeNull();
            expect(parseLooseDate(null)).toBeNull();
            expect(parseLooseDate(undefined)).toBeNull();
        });
    });

    describe('computeVerificationStatus', () => {
        it('returns EXTRACTED when no hard signal present', () => {
            expect(computeVerificationStatus({})).toBe('EXTRACTED');
            expect(computeVerificationStatus({ issuer: '', certNumber: '' })).toBe('EXTRACTED');
        });

        it('returns EVIDENCED when certNumber present', () => {
            expect(computeVerificationStatus({ certNumber: '12 100 45678' })).toBe('EVIDENCED');
        });

        it('returns EVIDENCED when validUntil present', () => {
            expect(computeVerificationStatus({ validUntil: '2027-06-01' })).toBe('EVIDENCED');
        });

        it('returns EVIDENCED when issuer present', () => {
            expect(computeVerificationStatus({ issuer: 'TÜV SÜD' })).toBe('EVIDENCED');
        });

        it('returns EVIDENCED when documentUrl present', () => {
            expect(computeVerificationStatus({ documentUrl: 'https://x/cert.pdf' })).toBe('EVIDENCED');
        });
    });

    describe('normalizeExtractedCertificates', () => {
        it('returns empty array for non-array input', () => {
            expect(normalizeExtractedCertificates(null)).toEqual([]);
            expect(normalizeExtractedCertificates(undefined)).toEqual([]);
            expect(normalizeExtractedCertificates('not an array')).toEqual([]);
        });

        it('drops entries without a code', () => {
            const out = normalizeExtractedCertificates([
                { code: '' },
                { code: '   ' },
                {},
                { code: 'ISO 9001' },
            ]);
            expect(out).toHaveLength(1);
            expect(out[0].code).toBe('ISO 9001');
        });

        it('derives type from code via detectCertificateType when missing', () => {
            const out = normalizeExtractedCertificates([{ code: 'ISO 9001:2015' }]);
            expect(out[0].type).toBe('ISO_9001');
        });

        it('respects explicit type when provided', () => {
            const out = normalizeExtractedCertificates([
                { code: 'Acme seal', type: 'OTHER' },
            ]);
            expect(out[0].type).toBe('OTHER');
        });

        it('dedupes by (type, code) — case-insensitive on code', () => {
            const out = normalizeExtractedCertificates([
                { code: 'ISO 9001' },
                { code: 'iso 9001' },
                { code: 'ISO 9001', issuer: 'TÜV' },
            ]);
            expect(out).toHaveLength(1);
        });

        it('preserves all optional fields when present', () => {
            const out = normalizeExtractedCertificates([
                {
                    code: 'ISO 9001:2015',
                    issuer: 'TÜV SÜD',
                    certNumber: '12 100 45678',
                    issuedAt: '2023-01-15',
                    validUntil: '2026-01-14',
                    documentUrl: 'https://x/cert.pdf',
                    evidenceQuote: 'We hold ISO 9001:2015',
                },
            ]);
            expect(out[0]).toEqual(
                expect.objectContaining({
                    code: 'ISO 9001:2015',
                    type: 'ISO_9001',
                    issuer: 'TÜV SÜD',
                    certNumber: '12 100 45678',
                    issuedAt: '2023-01-15',
                    validUntil: '2026-01-14',
                    documentUrl: 'https://x/cert.pdf',
                    evidenceQuote: 'We hold ISO 9001:2015',
                }),
            );
        });

        it('trims whitespace and drops empty string fields', () => {
            const out = normalizeExtractedCertificates([
                {
                    code: '  ISO 9001  ',
                    issuer: '   ',
                    certNumber: '',
                    documentUrl: '  https://x/cert.pdf  ',
                },
            ]);
            expect(out[0].code).toBe('ISO 9001');
            expect(out[0].issuer).toBeUndefined();
            expect(out[0].certNumber).toBeUndefined();
            expect(out[0].documentUrl).toBe('https://x/cert.pdf');
        });

        it('skips non-object entries gracefully', () => {
            const out = normalizeExtractedCertificates([
                null,
                'string',
                42,
                { code: 'ISO 9001' },
            ]);
            expect(out).toHaveLength(1);
        });
    });

    describe('detectCertificateType — sanity', () => {
        it('maps common variants', () => {
            expect(detectCertificateType('ISO 9001:2015')).toBe('ISO_9001');
            expect(detectCertificateType('IATF 16949')).toBe('IATF_16949');
            expect(detectCertificateType('AS 9100D')).toBe('AS_9100');
            expect(detectCertificateType('HACCP')).toBe('HACCP');
            expect(detectCertificateType('BSCI')).toBe('BSCI');
            expect(detectCertificateType('Random branded seal')).toBe('OTHER');
        });
    });
});
