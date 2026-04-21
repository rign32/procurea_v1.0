import { Test, TestingModule } from '@nestjs/testing';
import { AuditorAgentService } from './auditor.agent';
import { GeminiService } from '../../common/services/gemini.service';

describe('AuditorAgentService', () => {
    let service: AuditorAgentService;
    let gemini: { generateContent: jest.Mock };

    beforeEach(async () => {
        gemini = { generateContent: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuditorAgentService,
                { provide: GeminiService, useValue: gemini },
            ],
        }).compile();
        service = module.get(AuditorAgentService);
    });

    describe('happy path (Gemini returns valid JSON)', () => {
        it('approves valid manufacturer with golden_record', async () => {
            gemini.generateContent.mockResolvedValue(JSON.stringify({
                validation_result: 'APPROVED',
                confidence_score: 0.92,
                is_valid: true,
                is_match: true,
                golden_record: {
                    company_name: 'Granulat Sp. z o.o.',
                    website: 'https://granulat.com.pl',
                    country: 'Polska',
                    verified_company_type: 'PRODUCENT',
                    is_verified_manufacturer: true,
                    certificates: ['ISO 9001'],
                },
            }));

            const result = await service.execute(
                { website: 'https://granulat.com.pl', company_name: 'Granulat Sp. z o.o.', company_type: 'PRODUCENT' },
                { name: 'Granulat Sp. z o.o.' },
                'pl',
            );

            expect(result.validation_result).toBe('APPROVED');
            expect(result.confidence_score).toBe(0.92);
            expect(result.golden_record.verified_company_type).toBe('PRODUCENT');
        });

        it('rejects a falsified record (domain/company mismatch)', async () => {
            gemini.generateContent.mockResolvedValue(JSON.stringify({
                validation_result: 'REJECTED',
                confidence_score: 0.1,
                rejection_reason: 'Domain "granulat.com.pl" does not match "American Bureau of Shipping"',
                is_valid: false,
                is_match: false,
                golden_record: { company_name: 'American Bureau of Shipping', website: 'https://granulat.com.pl' },
            }));

            const result = await service.execute(
                { website: 'https://granulat.com.pl', company_name: 'American Bureau of Shipping' },
                null,
                'pl',
            );

            expect(result.validation_result).toBe('REJECTED');
            expect(result.rejection_reason).toContain('does not match');
        });
    });

    describe('fallback when Gemini throws', () => {
        beforeEach(() => {
            gemini.generateContent.mockRejectedValue(new Error('Gemini timeout'));
        });

        it('returns NEEDS_REVIEW (never REJECTED) with domain-match heuristic', async () => {
            const result = await service.execute(
                { website: 'https://acmeparts.com', company_name: 'Acme Parts GmbH' },
                null,
                'pl',
            );

            expect(result.validation_result).toBe('NEEDS_REVIEW');
            expect(result.is_valid).toBe(true);
            expect(result.confidence_score).toBeGreaterThanOrEqual(0.4);
            expect(result.warnings).toContain('AI verification unavailable — fallback heuristic used.');
        });

        it('lowers confidence when domain clearly mismatches company name', async () => {
            const result = await service.execute(
                { website: 'https://totally-unrelated.pl', company_name: 'Something Completely Different Inc' },
                null,
                'pl',
            );

            expect(result.validation_result).toBe('NEEDS_REVIEW');
            expect(result.is_match).toBe(false);
            expect(result.confidence_score).toBe(0.4);
            expect(result.warnings.some((w: string) => w.includes("doesn't match"))).toBe(true);
        });

        it('preserves certificates and contact info in golden_record fallback', async () => {
            const result = await service.execute(
                {
                    website: 'https://x.pl',
                    company_name: 'X',
                    certificates: ['ISO 9001', 'IATF 16949'],
                    contact_emails: ['info@x.pl'],
                    city: 'Kraków',
                    country: 'PL',
                },
                null,
                'pl',
            );

            expect(result.golden_record.certificates).toEqual(['ISO 9001', 'IATF 16949']);
            expect(result.golden_record.contact_emails).toEqual(['info@x.pl']);
            expect(result.golden_record.city).toBe('Kraków');
        });
    });
});
