import {
    checkRequiredCerts,
    findCertCanonical,
    homepageHasCert,
    isProjectLevelDoc,
} from './cert-taxonomy';

describe('cert-taxonomy', () => {
    describe('findCertCanonical', () => {
        it('maps full name to canonical', () => {
            expect(findCertCanonical('Drug Master File')).toBe('DMF');
            expect(findCertCanonical('Good Manufacturing Practice')).toBe('GMP');
        });

        it('maps abbreviation to canonical', () => {
            expect(findCertCanonical('USDMF')).toBe('DMF');
            expect(findCertCanonical('cGMP')).toBe('GMP');
            expect(findCertCanonical('CEP')).toBe('DMF');
        });

        it('maps ISO variants', () => {
            expect(findCertCanonical('ISO 9001')).toBe('ISO 9001');
            expect(findCertCanonical('iso9001')).toBe('ISO 9001');
            expect(findCertCanonical('ISO-9001')).toBe('ISO 9001');
        });

        it('returns null for non-cert strings', () => {
            expect(findCertCanonical('Written confirmation')).toBeNull();
            expect(findCertCanonical('Random string')).toBeNull();
            expect(findCertCanonical('')).toBeNull();
        });
    });

    describe('isProjectLevelDoc', () => {
        it('detects per-batch documents', () => {
            expect(isProjectLevelDoc('Certificate of Analysis')).toBe(true);
            expect(isProjectLevelDoc('CoA')).toBe(true);
            expect(isProjectLevelDoc('MSDS')).toBe(true);
            expect(isProjectLevelDoc('Written confirmation')).toBe(true);
        });

        it('handles user typos', () => {
            // The actual typo from Monica's wizard input on 2026-04-29
            expect(isProjectLevelDoc('Certifiate of analysis')).toBe(true);
        });

        it('rejects corporate certs', () => {
            expect(isProjectLevelDoc('GMP')).toBe(false);
            expect(isProjectLevelDoc('ISO 9001')).toBe(false);
        });
    });

    describe('homepageHasCert', () => {
        it('matches via aliases', () => {
            expect(homepageHasCert('DMF', ['DMF'])).toBe(true);
            expect(homepageHasCert('DMF', ['USDMF', 'EU GMP'])).toBe(true);
            expect(homepageHasCert('DMF', ['CEP'])).toBe(true);
            expect(homepageHasCert('GMP', ['EU GMP', 'FDA'])).toBe(true);
        });

        it('does not match unrelated certs', () => {
            expect(homepageHasCert('GMP', ['ISO 9001'])).toBe(false);
            expect(homepageHasCert('DMF', ['HACCP'])).toBe(false);
        });
    });

    describe('checkRequiredCerts — Monica\'s Ezetimib campaign reproduction', () => {
        // Verbatim from prod log 2026-04-29: campaign 1d9a8fb6 had these required certs
        // and produced 0 suppliers because every supplier hit HARD_FILTER_CERT.
        const monicaRequirements = ['Written confirmation', 'Certifiate of analysis', 'drug master file'];

        it('Yihui Pharm passes (had DMF on homepage)', () => {
            const result = checkRequiredCerts(monicaRequirements, ['EU GMP', 'US FDA', 'CEP', 'DMF']);
            expect(result.missing).toEqual([]);
            expect(result.softPass).toEqual(['Written confirmation', 'Certifiate of analysis']);
        });

        it('Mellon Pharm passes (had DMF + ISO 9001)', () => {
            const result = checkRequiredCerts(monicaRequirements, ['cGMP', 'ISO 9001', 'DMF', 'CEP', 'KOSHER']);
            expect(result.missing).toEqual([]);
        });

        it('Feng Cheng Group passes (had USDMF)', () => {
            const result = checkRequiredCerts(monicaRequirements, ['GMP', 'ISO 9001', 'ISO 14001', 'USDMF', 'EU CEP']);
            expect(result.missing).toEqual([]);
        });

        it('Vendor with no DMF/CEP fails on the actual cert requirement', () => {
            // A vendor that genuinely doesn't have DMF should still be filtered out
            const result = checkRequiredCerts(monicaRequirements, ['ISO 9001', 'HALAL']);
            expect(result.missing).toContain('DMF');
            expect(result.softPass).toEqual(['Written confirmation', 'Certifiate of analysis']);
        });
    });

    describe('checkRequiredCerts — bidirectional substring still works for short certs', () => {
        it('GMP requirement matches "EU GMP" homepage badge', () => {
            const result = checkRequiredCerts(['GMP'], ['EU GMP']);
            expect(result.missing).toEqual([]);
        });

        it('"ISO 9001" requirement matches homepage with ISO 9001:2015', () => {
            const result = checkRequiredCerts(['ISO 9001'], ['ISO 9001:2015 certified']);
            expect(result.missing).toEqual([]);
        });
    });
});
