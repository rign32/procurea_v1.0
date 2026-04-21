import { Test, TestingModule } from '@nestjs/testing';
import { StrategyAgentService, SANCTIONED_COUNTRIES, REGION_LANGUAGE_CONFIG } from './strategy.agent';
import { GeminiService } from '../../common/services/gemini.service';

describe('StrategyAgentService', () => {
    let service: StrategyAgentService;
    let gemini: { generateContent: jest.Mock };

    beforeEach(async () => {
        gemini = { generateContent: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StrategyAgentService,
                { provide: GeminiService, useValue: gemini },
            ],
        }).compile();
        service = module.get(StrategyAgentService);
    });

    describe('region configuration', () => {
        it('exports sanctioned countries list', () => {
            expect(SANCTIONED_COUNTRIES.has('Rosja')).toBe(true);
            expect(SANCTIONED_COUNTRIES.has('Iran')).toBe(true);
            expect(SANCTIONED_COUNTRIES.has('Korea Północna')).toBe(true);
            expect(SANCTIONED_COUNTRIES.has('Białoruś')).toBe(true);
            expect(SANCTIONED_COUNTRIES.has('Polska')).toBe(false);
        });

        it('PL region config has only Polish language', () => {
            expect(REGION_LANGUAGE_CONFIG.PL.languages).toHaveLength(1);
            expect(REGION_LANGUAGE_CONFIG.PL.languages[0].code).toBe('pl');
        });

        it('EU region includes major EU languages', () => {
            const codes = REGION_LANGUAGE_CONFIG.EU.languages.map(l => l.code);
            expect(codes).toEqual(expect.arrayContaining(['de', 'pl', 'fr', 'it', 'es']));
        });

        it('US region uses English + marketplace negatives', () => {
            expect(REGION_LANGUAGE_CONFIG.US.languages[0].code).toBe('en');
            expect(REGION_LANGUAGE_CONFIG.US.negatives).toEqual(
                expect.arrayContaining(['-amazon', '-ebay', '-walmart']),
            );
        });
    });

    describe('execute — Gemini response parsing', () => {
        it('returns strategies from Gemini when valid JSON', async () => {
            gemini.generateContent.mockResolvedValue(JSON.stringify({
                strategies: [
                    {
                        country: 'Poland',
                        language: 'pl',
                        queries: ['producent CNC Polska', 'fabryka CNC'],
                        negatives: ['-allegro'],
                    },
                    {
                        country: 'Germany',
                        language: 'de',
                        queries: ['CNC Hersteller', 'Präzisionsmaschinenbau'],
                        negatives: ['-ebay'],
                    },
                ],
            }));

            const result = await service.execute({
                productName: 'CNC części precyzyjne',
                description: 'Obróbka CNC z aluminium',
                keywords: ['CNC', 'aluminium'],
                category: 'Machining',
                material: 'Aluminum 6061',
                region: 'EU',
                eau: 20000,
            });

            expect(result.strategies).toBeDefined();
            expect(result.strategies.length).toBeGreaterThanOrEqual(2);
            const pl = result.strategies.find((s: any) => s.country === 'Poland');
            expect(pl).toBeDefined();
            expect(pl.queries.length).toBeGreaterThan(2);
        });

        it('augments strategies with specialized directory/association queries', async () => {
            gemini.generateContent.mockResolvedValue(JSON.stringify({
                strategies: [{
                    country: 'Germany',
                    language: 'de',
                    queries: ['CNC Hersteller Deutschland'],
                    negatives: [],
                }],
            }));

            const result = await service.execute({
                productName: 'CNC parts',
                description: 'Metal machining',
                keywords: [],
                category: 'Manufacturing',
                material: '',
                region: 'EU',
                eau: 10000,
            });

            const de = result.strategies[0];
            const joined = de.queries.join('\n');
            expect(joined).toMatch(/europages\.com/);
            expect(joined).toMatch(/kompass\.com/);
            expect(joined).toMatch(/ISO 9001/);
            expect(joined).toMatch(/wlw\.de/);
        });

        it('deduplicates queries when augmenting', async () => {
            gemini.generateContent.mockResolvedValue(JSON.stringify({
                strategies: [{
                    country: 'USA',
                    language: 'en',
                    queries: ['steel pipes manufacturer'],
                    negatives: [],
                }],
            }));

            const result = await service.execute({
                productName: 'steel pipes',
                description: '',
                keywords: [],
                category: '',
                material: '',
                region: 'US',
                eau: 1000,
            });

            const set = new Set(result.strategies[0].queries.map((q: string) => q.toLowerCase().trim()));
            expect(set.size).toBe(result.strategies[0].queries.length);
        });

        it('returns empty strategies on Gemini error (graceful degradation)', async () => {
            gemini.generateContent.mockRejectedValue(new Error('Gemini timeout'));

            const result = await service.execute({
                productName: 'anything',
                description: '',
                keywords: [],
                category: '',
                material: '',
                region: 'EU',
                eau: 1000,
            });

            expect(result.strategies).toEqual([]);
            expect(result.error).toContain('Gemini timeout');
        });

        it('injects certificate-based queries when required certs specified', async () => {
            gemini.generateContent.mockResolvedValue(JSON.stringify({
                strategies: [{
                    country: 'Poland',
                    language: 'pl',
                    queries: ['producent żywności Polska'],
                    negatives: [],
                }],
            }));

            const result = await service.execute({
                productName: 'olej spożywczy',
                description: '',
                keywords: [],
                category: 'Food',
                material: '',
                region: 'PL',
                eau: 5000,
                requiredCertificates: ['IFS', 'BRC'],
            });

            const joined = result.strategies[0].queries.join('\n');
            expect(joined).toMatch(/IFS/);
            expect(joined).toMatch(/BRC/);
        });

        it('adds alternative product names from productContext', async () => {
            gemini.generateContent.mockResolvedValue(JSON.stringify({
                strategies: [{
                    country: 'Germany',
                    language: 'de',
                    queries: ['Pulverlack Hersteller'],
                    negatives: [],
                }],
            }));

            const result = await service.execute({
                productName: 'powder coating',
                description: '',
                keywords: [],
                category: 'Paints',
                material: '',
                region: 'EU',
                eau: 1000,
                productContext: {
                    coreProduct: 'powder coating',
                    productCategory: 'Paints',
                    specAttributes: [],
                    positiveSignals: [],
                    negativeSignals: [],
                    disambiguationNote: '',
                    productTranslations: { de: 'Pulverlack' },
                    alternativeNames: ['thermosetting paint', 'powder paint'],
                } as any,
            });

            const joined = result.strategies[0].queries.join('\n');
            expect(joined).toMatch(/thermosetting paint/);
            expect(joined).toMatch(/powder paint/);
        });
    });
});
