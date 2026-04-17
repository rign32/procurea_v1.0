import { resolveMx } from 'dns/promises';
import { EmailFallbackService } from './email-fallback.service';
import { extractDomain } from '../../common/utils/mx-validator';

jest.mock('dns/promises', () => ({
  resolveMx: jest.fn(),
}));

const mockedResolveMx = resolveMx as jest.MockedFunction<typeof resolveMx>;

describe('EmailFallbackService', () => {
    let service: EmailFallbackService;

    beforeEach(() => {
        service = new EmailFallbackService();
        mockedResolveMx.mockReset();
    });

    // --- buildCandidates (pure, no DNS) ---

    describe('buildCandidates', () => {
        it('returns base list when country is null', () => {
            const result = service.buildCandidates('acme.com', null);
            expect(result).toEqual([
                'contact@acme.com',
                'sales@acme.com',
                'info@acme.com',
                'procurement@acme.com',
            ]);
        });

        it('returns base list when country is undefined', () => {
            const result = service.buildCandidates('acme.com');
            expect(result).toHaveLength(4);
            expect(result).toContain('contact@acme.com');
        });

        it('adds Polish-specific addresses for PL', () => {
            const result = service.buildCandidates('acme.pl', 'PL');
            expect(result).toContain('biuro@acme.pl');
            expect(result).toContain('kontakt@acme.pl');
            expect(result).toContain('contact@acme.pl');
            expect(result).toHaveLength(6);
        });

        it('adds German-specific addresses for DE', () => {
            const result = service.buildCandidates('acme.de', 'DE');
            expect(result).toContain('verkauf@acme.de');
            expect(result).toContain('vertrieb@acme.de');
        });

        it('adds German-specific addresses for AT (Austria)', () => {
            const result = service.buildCandidates('acme.at', 'AT');
            expect(result).toContain('verkauf@acme.at');
            expect(result).toContain('vertrieb@acme.at');
        });

        it('adds French-specific addresses for FR (deduped with base)', () => {
            const result = service.buildCandidates('acme.fr', 'FR');
            expect(result).toContain('contact@acme.fr');
            expect(result).toContain('ventes@acme.fr');
            // contact@ appears once despite being in both base and FR list
            const contactCount = result.filter((e) => e === 'contact@acme.fr').length;
            expect(contactCount).toBe(1);
        });

        it('handles case-insensitive country codes', () => {
            const upper = service.buildCandidates('acme.pl', 'PL');
            const lower = service.buildCandidates('acme.pl', 'pl');
            expect(lower).toEqual(upper);
        });

        it('returns only base list for unknown country codes', () => {
            const result = service.buildCandidates('acme.com', 'ZZ');
            expect(result).toHaveLength(4);
        });

        it('deduplicates addresses (Set semantics)', () => {
            const result = service.buildCandidates('acme.it', 'IT');
            // info@ in both base and IT — should appear once
            const infoCount = result.filter((e) => e === 'info@acme.it').length;
            expect(infoCount).toBe(1);
        });
    });

    // --- extractDomain ---

    describe('extractDomain', () => {
        it('extracts from https URL', () => {
            expect(extractDomain('https://acme.com')).toBe('acme.com');
        });

        it('extracts from http URL', () => {
            expect(extractDomain('http://acme.com')).toBe('acme.com');
        });

        it('strips www prefix', () => {
            expect(extractDomain('https://www.acme.com')).toBe('acme.com');
        });

        it('handles raw domain without protocol', () => {
            expect(extractDomain('acme.com')).toBe('acme.com');
        });

        it('handles raw domain with www', () => {
            expect(extractDomain('www.acme.com')).toBe('acme.com');
        });

        it('handles URL with path', () => {
            expect(extractDomain('https://acme.com/about/contact')).toBe('acme.com');
        });

        it('lowercases the domain', () => {
            expect(extractDomain('HTTPS://ACME.COM')).toBe('acme.com');
        });

        it('handles subdomains (preserves them, only strips leading www)', () => {
            expect(extractDomain('https://shop.acme.com')).toBe('shop.acme.com');
        });

        it('returns null for empty string', () => {
            expect(extractDomain('')).toBeNull();
        });

        it('returns null for whitespace-only', () => {
            expect(extractDomain('   ')).toBeNull();
        });

        it('returns null for invalid URL', () => {
            expect(extractDomain('not a url at all')).toBeNull();
        });
    });

    // --- generateWithValidation (uses mocked DNS) ---

    describe('generateWithValidation', () => {
        it('returns [] when website has no valid domain', async () => {
            const result = await service.generateWithValidation({ website: '   ' });
            expect(result).toEqual([]);
            expect(mockedResolveMx).not.toHaveBeenCalled();
        });

        it('returns [] when domain has no MX records (resolveMx throws)', async () => {
            mockedResolveMx.mockRejectedValue(new Error('ENOTFOUND'));

            const result = await service.generateWithValidation({
                website: 'https://no-mx.example',
            });

            expect(result).toEqual([]);
            expect(mockedResolveMx).toHaveBeenCalledWith('no-mx.example');
        });

        it('returns [] when domain has empty MX array', async () => {
            mockedResolveMx.mockResolvedValue([]);

            const result = await service.generateWithValidation({
                website: 'https://acme.com',
            });

            expect(result).toEqual([]);
        });

        it('returns candidate emails when MX is valid', async () => {
            mockedResolveMx.mockResolvedValue([
                { exchange: 'mx1.acme.com', priority: 10 },
            ]);

            const result = await service.generateWithValidation({
                website: 'https://acme.com',
                country: null,
            });

            expect(result).toHaveLength(4);
            expect(result[0]).toMatchObject({
                email: 'contact@acme.com',
                confidence: 'medium',
                source: 'fallback-domain-generated',
            });
            expect(result[0].generatedAt).toBeInstanceOf(Date);
        });

        it('includes country-specific addresses when country is provided', async () => {
            mockedResolveMx.mockResolvedValue([
                { exchange: 'mx1.acme.pl', priority: 10 },
            ]);

            const result = await service.generateWithValidation({
                website: 'https://acme.pl',
                country: 'PL',
            });

            const emails = result.map((r) => r.email);
            expect(emails).toContain('biuro@acme.pl');
            expect(emails).toContain('kontakt@acme.pl');
            expect(result.every((r) => r.confidence === 'medium')).toBe(true);
        });

        it('strips www when deriving domain for MX lookup', async () => {
            mockedResolveMx.mockResolvedValue([
                { exchange: 'mx.acme.com', priority: 10 },
            ]);

            await service.generateWithValidation({
                website: 'https://www.acme.com',
            });

            expect(mockedResolveMx).toHaveBeenCalledWith('acme.com');
        });
    });

    // --- validateDomain (fast path) ---

    describe('validateDomain', () => {
        it('returns false for invalid website', async () => {
            expect(await service.validateDomain('')).toBe(false);
            expect(mockedResolveMx).not.toHaveBeenCalled();
        });

        it('returns true when MX records exist', async () => {
            mockedResolveMx.mockResolvedValue([
                { exchange: 'mx.acme.com', priority: 10 },
            ]);

            expect(await service.validateDomain('https://acme.com')).toBe(true);
        });

        it('returns false when DNS lookup fails', async () => {
            mockedResolveMx.mockRejectedValue(new Error('ENOTFOUND'));

            expect(await service.validateDomain('https://nowhere.example')).toBe(false);
        });
    });
});
