import { Test, TestingModule } from '@nestjs/testing';
import { ScreenerAgentService } from './screener.agent';
import { GeminiService } from '../../common/services/gemini.service';

describe('ScreenerAgentService', () => {
    let service: ScreenerAgentService;
    let gemini: { generateContent: jest.Mock };

    beforeEach(async () => {
        gemini = { generateContent: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ScreenerAgentService,
                { provide: GeminiService, useValue: gemini },
            ],
        }).compile();
        service = module.get(ScreenerAgentService);
    });

    describe('happy path (Gemini returns JSON)', () => {
        it('parses Gemini JSON response into structured result', async () => {
            const geminiJson = JSON.stringify({
                company_type: 'PRODUCENT',
                company_type_confidence: 85,
                company_type_evidence: 'Strona zawiera katalog produktów i dane fabryki',
                is_relevant: true,
                page_type: 'Manufacturer',
                reason: 'Real CNC manufacturer with catalog',
                capability_match_score: 78,
                match_reason: 'Matches CNC machining requirement',
                risks: [],
                extracted_data: {
                    company_name: 'Acme CNC Works',
                    country: 'PL',
                    city: 'Warszawa',
                    specialization: 'CNC milling',
                    certificates: ['ISO 9001'],
                },
            });
            gemini.generateContent.mockResolvedValue(geminiJson);

            const result = await service.execute(
                'https://acme-cnc.pl',
                '<html>Producent CNC...</html>',
                { category: 'CNC' },
                undefined,
                'pl',
            );

            expect(result.company_type).toBe('PRODUCENT');
            expect(result.is_relevant).toBe(true);
            expect(result.capability_match_score).toBe(78);
            expect(result.extracted_data.company_name).toBe('Acme CNC Works');
            expect(result.extracted_data.certificates).toEqual(['ISO 9001']);
        });
    });

    describe('fallback when Gemini throws', () => {
        beforeEach(() => {
            gemini.generateContent.mockRejectedValue(new Error('Gemini unavailable'));
        });

        it('returns is_relevant=true with manufacturer keywords', async () => {
            const content = 'Jesteśmy producentem obróbki CNC. Nasza fabryka w Polsce.';
            const result = await service.execute(
                'https://x.pl', content, {}, undefined, 'pl',
            );

            expect(result.is_relevant).toBe(true);
            expect(result.company_type).toBe('PRODUCENT');
            expect(result.page_type).toContain('Fallback');
            expect(result.capability_match_score).toBeGreaterThan(0);
        });

        it('classifies as HANDLOWIEC when shop signals present', async () => {
            const content = 'Sklep internetowy z częściami CNC, dodaj do koszyka!';
            const result = await service.execute(
                'https://shop.pl', content, {}, undefined, 'pl',
            );

            expect(result.company_type).toBe('HANDLOWIEC');
        });

        it('returns NIEJASNY for ambiguous content with no shop/mfg signals', async () => {
            const content = 'Plastik CNC nowoczesny dostępny lokalnie';
            const result = await service.execute(
                'https://x.pl', content, {}, undefined, 'pl',
            );
            expect(result.company_type).toBe('NIEJASNY');
            expect(result.company_type_confidence).toBe(20);
        });

        it('marks irrelevant when no positive keywords', async () => {
            const content = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
            const result = await service.execute(
                'https://blog.com', content, {}, undefined, 'pl',
            );

            expect(result.is_relevant).toBe(false);
            expect(result.capability_match_score).toBe(0);
        });

        it('uses productContext positive/negative signals in fallback', async () => {
            const productContext = {
                coreProduct: 'powder coating paint',
                productCategory: 'Paints',
                specAttributes: ['RAL 9005'],
                positiveSignals: ['paint manufacturer', 'powder coating'],
                negativeSignals: ['door manufacturer'],
                disambiguationNote: '',
                productTranslations: {},
            };

            const positiveResult = await service.execute(
                'https://x.com',
                'We are a powder coating paint manufacturer',
                {}, productContext as any, 'en',
            );
            expect(positiveResult.is_relevant).toBe(true);

            const negativeResult = await service.execute(
                'https://x.com',
                'We are a door manufacturer using powder coating',
                {}, productContext as any, 'en',
            );
            expect(negativeResult.is_relevant).toBe(false);
        });
    });
});
