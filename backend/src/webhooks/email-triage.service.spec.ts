import { Test, TestingModule } from '@nestjs/testing';
import { EmailTriageService } from './email-triage.service';
import { GeminiService } from '../common/services/gemini.service';

describe('EmailTriageService', () => {
    let service: EmailTriageService;
    let geminiMock: { generateContent: jest.Mock };

    beforeEach(async () => {
        geminiMock = { generateContent: jest.fn() };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailTriageService,
                { provide: GeminiService, useValue: geminiMock },
            ],
        }).compile();
        service = module.get(EmailTriageService);
    });

    describe('parseTriageResponse', () => {
        it('parses clean JSON', () => {
            const raw = JSON.stringify({
                category: 'FORWARD',
                confidence: 0.92,
                reason: 'Has price',
                summary: 'Quote with price',
                sentiment: 'positive',
                extractedTerms: { price: 120, currency: 'EUR', leadTime: 14 },
            });
            const r = service.parseTriageResponse(raw);
            expect(r.category).toBe('FORWARD');
            expect(r.confidence).toBe(0.92);
            expect(r.sentiment).toBe('positive');
            expect(r.extractedTerms?.price).toBe(120);
            expect(r.extractedTerms?.currency).toBe('EUR');
            expect(r.extractedTerms?.leadTime).toBe(14);
        });

        it('strips ```json fences', () => {
            const raw = '```json\n{"category":"BLOCK","confidence":0.8,"reason":"spam","summary":"Spam email","sentiment":"negative"}\n```';
            const r = service.parseTriageResponse(raw);
            expect(r.category).toBe('BLOCK');
            expect(r.sentiment).toBe('negative');
            expect(r.extractedTerms).toBeUndefined();
        });

        it('handles leading commentary + JSON object', () => {
            const raw = 'Here is my classification:\n{"category":"STORE_ONLY","confidence":0.7,"reason":"OOO","summary":"Out of office","sentiment":"auto-reply"}';
            const r = service.parseTriageResponse(raw);
            expect(r.category).toBe('STORE_ONLY');
            expect(r.sentiment).toBe('auto-reply');
        });

        it('falls back to STORE_ONLY on malformed JSON', () => {
            const r = service.parseTriageResponse('not json at all :(');
            expect(r.category).toBe('STORE_ONLY');
            expect(r.confidence).toBe(0);
            expect(r.reason).toBe('parse_error');
        });

        it('coerces invalid category to STORE_ONLY', () => {
            const raw = JSON.stringify({
                category: 'MAYBE',
                confidence: 0.5,
                reason: 'unsure',
                summary: 's',
                sentiment: 'neutral',
            });
            const r = service.parseTriageResponse(raw);
            expect(r.category).toBe('STORE_ONLY');
        });

        it('clamps confidence to [0,1]', () => {
            const raw = JSON.stringify({
                category: 'FORWARD',
                confidence: 12,
                reason: '',
                summary: '',
                sentiment: 'positive',
            });
            const r = service.parseTriageResponse(raw);
            expect(r.confidence).toBe(1);
        });

        it('ignores invalid sentiment and defaults to neutral', () => {
            const raw = JSON.stringify({
                category: 'FORWARD',
                confidence: 0.5,
                reason: '',
                summary: '',
                sentiment: 'ecstatic',
            });
            const r = service.parseTriageResponse(raw);
            expect(r.sentiment).toBe('neutral');
        });

        it('drops extractedTerms when all fields invalid', () => {
            const raw = JSON.stringify({
                category: 'FORWARD',
                confidence: 0.5,
                reason: '',
                summary: '',
                sentiment: 'positive',
                extractedTerms: { price: 'not a number' },
            });
            const r = service.parseTriageResponse(raw);
            expect(r.extractedTerms).toBeUndefined();
        });
    });

    describe('classify', () => {
        it('returns STORE_ONLY when Gemini throws', async () => {
            geminiMock.generateContent.mockRejectedValue(new Error('boom'));
            const r = await service.classify({
                from: 'a@b.com',
                subject: 's',
                textBody: 'body',
                supplierName: 'ACME',
                rfqProductName: 'Widgets',
                userLanguage: 'pl',
            });
            expect(r.category).toBe('STORE_ONLY');
            expect(r.reason).toBe('ai_error');
        });

        it('forwards a quote when Gemini returns FORWARD', async () => {
            geminiMock.generateContent.mockResolvedValue(
                JSON.stringify({
                    category: 'FORWARD',
                    confidence: 0.95,
                    reason: 'quote',
                    summary: 'They sent a quote',
                    sentiment: 'positive',
                    extractedTerms: { price: 500, currency: 'EUR', leadTime: 21, moq: 100 },
                }),
            );
            const r = await service.classify({
                from: 'supplier@example.com',
                subject: 'Re: RFQ-2026-001',
                textBody: 'Our price is EUR 500, lead time 3 weeks, MOQ 100.',
                supplierName: 'ACME',
                rfqProductName: 'Widgets',
                userLanguage: 'en',
            });
            expect(r.category).toBe('FORWARD');
            expect(r.extractedTerms?.price).toBe(500);
            expect(r.extractedTerms?.moq).toBe(100);
            expect(geminiMock.generateContent).toHaveBeenCalledWith(
                expect.any(String),
                undefined,
                'email-triage',
            );
        });
    });
});
