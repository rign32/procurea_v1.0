import { SupplierMatchingService } from './supplier-matching.service';
import { MatchCandidate } from '../interfaces/supplier-match.interface';

describe('SupplierMatchingService', () => {
    let service: SupplierMatchingService;

    beforeEach(() => {
        service = new SupplierMatchingService();
    });

    // --- normalization primitives ---

    describe('normalizeTaxNumber', () => {
        it('strips non-alphanumeric and uppercases', () => {
            expect(service.normalizeTaxNumber('PL 123-456-78-90')).toBe('PL1234567890');
        });
        it('returns null for too-short input', () => {
            expect(service.normalizeTaxNumber('12')).toBeNull();
        });
        it('returns null for null/undefined', () => {
            expect(service.normalizeTaxNumber(null)).toBeNull();
            expect(service.normalizeTaxNumber(undefined)).toBeNull();
        });
    });

    describe('extractRootDomain', () => {
        it('handles protocol-less input', () => {
            expect(service.extractRootDomain('acme.com')).toBe('acme.com');
        });
        it('strips www prefix', () => {
            expect(service.extractRootDomain('https://www.acme.com/path')).toBe('acme.com');
        });
        it('collapses subdomains to registrable domain', () => {
            expect(service.extractRootDomain('https://shop.acme.com')).toBe('acme.com');
        });
        it('handles two-part TLDs (.co.uk)', () => {
            expect(service.extractRootDomain('https://www.acme.co.uk')).toBe('acme.co.uk');
        });
        it('handles .com.pl', () => {
            expect(service.extractRootDomain('https://shop.acme.com.pl')).toBe('acme.com.pl');
        });
        it('returns null for invalid input', () => {
            expect(service.extractRootDomain('not a url')).toBeNull();
            expect(service.extractRootDomain(null)).toBeNull();
        });
    });

    describe('normalizeName', () => {
        it('strips Polish legal suffix', () => {
            expect(service.normalizeName('Acme Sp. z o.o.')).toBe('acme');
        });
        it('strips German GmbH', () => {
            expect(service.normalizeName('Bosch GmbH')).toBe('bosch');
        });
        it('strips US Inc', () => {
            expect(service.normalizeName('Acme, Inc.')).toBe('acme');
        });
        it('strips UK Ltd', () => {
            expect(service.normalizeName('Apex Limited')).toBe('apex');
        });
        it('handles no suffix', () => {
            expect(service.normalizeName('Just Acme')).toBe('just acme');
        });
    });

    // --- scoring ---

    describe('scoreMatch', () => {
        it('returns perfect confidence on tax match', () => {
            const a: MatchCandidate = {
                id: 'a',
                name: 'Acme Corp',
                taxNumber: 'PL1234567890',
            };
            const b: MatchCandidate = {
                id: 'b',
                name: 'Totally Different LLC',
                taxNumber: 'PL-123-456-78-90', // normalizes to same
            };
            const result = service.scoreMatch(a, b);
            expect(result.matchType).toBe('exact_tax');
            expect(result.confidence).toBe(1.0);
            expect(result.signals.taxMatch).toBe(true);
        });

        it('returns high confidence on domain match with similar name', () => {
            const a: MatchCandidate = {
                id: 'a',
                name: 'Acme Corp',
                website: 'https://www.acme.com',
            };
            const b: MatchCandidate = {
                id: 'b',
                name: 'Acme Corporation',
                website: 'https://acme.com/about',
            };
            const result = service.scoreMatch(a, b);
            expect(result.matchType).toBe('exact_domain');
            expect(result.confidence).toBeGreaterThanOrEqual(0.88);
            expect(result.signals.domainMatch).toBe(true);
        });

        it('catches fuzzy match for legal-suffix variation', () => {
            const a: MatchCandidate = {
                id: 'a',
                name: 'Acme Corporation',
            };
            const b: MatchCandidate = {
                id: 'b',
                name: 'Acme Corp.',
            };
            const result = service.scoreMatch(a, b);
            // Both normalize to "acme" → perfect name match → fuzzy_name at 1.0
            expect(result.matchType).toBe('fuzzy_name');
            expect(result.confidence).toBeGreaterThanOrEqual(0.95);
        });

        it('rejects unrelated companies', () => {
            const a: MatchCandidate = {
                id: 'a',
                name: 'Acme Corp',
                website: 'https://acme.com',
            };
            const b: MatchCandidate = {
                id: 'b',
                name: 'Globex Industries',
                website: 'https://globex.com',
            };
            const result = service.scoreMatch(a, b);
            expect(result.confidence).toBeLessThan(0.7);
        });

        it('tax match wins over mismatched names', () => {
            // Real-world case: subsidiary name differs from registered entity
            const a: MatchCandidate = {
                id: 'a',
                name: 'Acme Polska',
                taxNumber: '1234567890',
            };
            const b: MatchCandidate = {
                id: 'b',
                name: 'ACME Poland Ltd.',
                taxNumber: '1234567890',
            };
            expect(service.scoreMatch(a, b).confidence).toBe(1.0);
        });

        it('handles missing data gracefully', () => {
            const a: MatchCandidate = { id: 'a', name: null };
            const b: MatchCandidate = { id: 'b', name: null };
            expect(service.scoreMatch(a, b).confidence).toBe(0);
        });
    });

    describe('findBestMatches (batch)', () => {
        it('returns best match per procurea supplier above threshold', () => {
            const procurea: MatchCandidate[] = [
                { id: 'p1', name: 'Acme Corp', website: 'https://acme.com' },
                { id: 'p2', name: 'Globex Industries', taxNumber: '9876543210' },
                { id: 'p3', name: 'Nonexistent Co' },
            ];
            const external: MatchCandidate[] = [
                { id: 'e1', name: 'Acme Corporation', website: 'https://acme.com' },
                { id: 'e2', name: 'Globex Ltd', taxNumber: '9876543210' },
                { id: 'e3', name: 'Unrelated Business' },
            ];

            const matches = service.findBestMatches(procurea, external, 0.7);

            // p1 should match e1 (domain + name), p2 should match e2 (tax), p3 should not match.
            expect(matches.length).toBe(2);
            const p1Match = matches.find((m) => m.procureaId === 'p1');
            const p2Match = matches.find((m) => m.procureaId === 'p2');
            expect(p1Match?.externalId).toBe('e1');
            expect(p2Match?.externalId).toBe('e2');
            expect(p2Match?.result.matchType).toBe('exact_tax');
        });

        it('returns empty array when nothing matches', () => {
            const procurea: MatchCandidate[] = [
                { id: 'p1', name: 'Completely Unique Supplier' },
            ];
            const external: MatchCandidate[] = [
                { id: 'e1', name: 'Something Else Entirely' },
            ];
            expect(service.findBestMatches(procurea, external, 0.7)).toEqual([]);
        });

        it('uses tax index to short-circuit O(n*m)', () => {
            // Build a large external set; only one matches by tax.
            const external: MatchCandidate[] = Array.from({ length: 1000 }, (_, i) => ({
                id: `e${i}`,
                name: `Company ${i}`,
            }));
            external[500] = {
                id: 'e500',
                name: 'Anything',
                taxNumber: 'PL-TARGET-TAX-123',
            };

            const procurea: MatchCandidate[] = [
                { id: 'p1', name: 'X', taxNumber: 'PLTARGETTAX123' },
            ];

            const matches = service.findBestMatches(procurea, external);
            expect(matches.length).toBe(1);
            expect(matches[0].externalId).toBe('e500');
            expect(matches[0].result.matchType).toBe('exact_tax');
        });
    });
});
