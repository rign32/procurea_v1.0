import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OfferEnrichmentService } from './offer-enrichment.service';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../common/services/gemini.service';

describe('OfferEnrichmentService', () => {
  let service: OfferEnrichmentService;
  let prisma: { offer: { findUnique: jest.Mock; findMany: jest.Mock; update: jest.Mock } };
  let gemini: { generateContent: jest.Mock };

  beforeEach(async () => {
    prisma = {
      offer: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };
    gemini = { generateContent: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferEnrichmentService,
        { provide: PrismaService, useValue: prisma },
        { provide: GeminiService, useValue: gemini },
      ],
    }).compile();

    service = module.get<OfferEnrichmentService>(OfferEnrichmentService);
  });

  // ── parseExtraction ──────────────────────────────────────────────

  describe('parseExtraction', () => {
    it('should parse valid JSON', () => {
      const result = service.parseExtraction('{"leadTime": 21, "moq": 500, "price": null, "currency": null, "specsConfirmed": null, "incotermsConfirmed": null}');
      expect(result).toEqual({ leadTime: 21, moq: 500, price: null, currency: null, specsConfirmed: null, incotermsConfirmed: null });
    });

    it('should parse markdown-wrapped JSON', () => {
      const raw = '```json\n{"leadTime": 14, "moq": null}\n```';
      const result = service.parseExtraction(raw);
      expect(result).toEqual({ leadTime: 14, moq: null });
    });

    it('should parse JSON with surrounding text', () => {
      const raw = 'Here is the extraction:\n{"leadTime": 7, "moq": 100}\nDone.';
      const result = service.parseExtraction(raw);
      expect(result).toEqual({ leadTime: 7, moq: 100 });
    });

    it('should return empty object for malformed input', () => {
      expect(service.parseExtraction('not json at all')).toEqual({});
    });

    it('should return empty object for empty string', () => {
      expect(service.parseExtraction('')).toEqual({});
    });

    it('should handle JSON with triple backtick without json tag', () => {
      const raw = '```\n{"price": 12.5, "currency": "EUR"}\n```';
      const result = service.parseExtraction(raw);
      expect(result).toEqual({ price: 12.5, currency: 'EUR' });
    });
  });

  // ── enrichOffer ──────────────────────────────────────────────────

  describe('enrichOffer', () => {
    const baseOffer = {
      id: 'offer-1',
      comments: 'Lead time: 21 days. MOQ 500 units. EXW warehouse.',
      leadTime: null,
      moq: null,
      price: null,
      currency: null,
      specsConfirmed: false,
      incotermsConfirmed: false,
      rfqRequest: { productName: 'Steel bolts', quantity: 1000 },
    };

    it('should throw NotFoundException for non-existent offer', async () => {
      prisma.offer.findUnique.mockResolvedValue(null);
      await expect(service.enrichOffer('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should return enriched=false when comments is null', async () => {
      prisma.offer.findUnique.mockResolvedValue({ ...baseOffer, comments: null });
      const result = await service.enrichOffer('offer-1');
      expect(result.enriched).toBe(false);
      expect(result.fieldsUpdated).toEqual([]);
    });

    it('should return enriched=false when all fields are already filled', async () => {
      prisma.offer.findUnique.mockResolvedValue({
        ...baseOffer,
        leadTime: 21,
        moq: 500,
        price: 10.5,
        currency: 'EUR',
        specsConfirmed: true,
        incotermsConfirmed: true,
      });
      const result = await service.enrichOffer('offer-1');
      expect(result.enriched).toBe(false);
      expect(gemini.generateContent).not.toHaveBeenCalled();
    });

    it('should enrich only null/missing fields', async () => {
      prisma.offer.findUnique.mockResolvedValue(baseOffer);
      gemini.generateContent.mockResolvedValue(JSON.stringify({
        leadTime: 21,
        moq: 500,
        price: null,
        currency: null,
        specsConfirmed: null,
        incotermsConfirmed: true,
      }));

      const result = await service.enrichOffer('offer-1');

      expect(result.enriched).toBe(true);
      expect(result.fieldsUpdated).toContain('leadTime');
      expect(result.fieldsUpdated).toContain('moq');
      expect(result.fieldsUpdated).toContain('incotermsConfirmed');
      expect(result.fieldsUpdated).not.toContain('price');
      expect(result.fieldsUpdated).not.toContain('currency');

      expect(prisma.offer.update).toHaveBeenCalledWith({
        where: { id: 'offer-1' },
        data: { leadTime: 21, moq: 500, incotermsConfirmed: true },
      });
    });

    it('should NOT overwrite already-filled fields', async () => {
      const offerWithSomeData = {
        ...baseOffer,
        leadTime: 14,       // already filled
        currency: 'PLN',    // already filled
      };
      prisma.offer.findUnique.mockResolvedValue(offerWithSomeData);
      gemini.generateContent.mockResolvedValue(JSON.stringify({
        leadTime: 21,        // Gemini suggests different value
        moq: 500,
        price: 10.0,
        currency: 'EUR',    // Gemini suggests different value
        specsConfirmed: true,
        incotermsConfirmed: true,
      }));

      const result = await service.enrichOffer('offer-1');

      // leadTime and currency should NOT be updated
      expect(result.fieldsUpdated).not.toContain('leadTime');
      expect(result.fieldsUpdated).not.toContain('currency');
      // moq, price, specs, incoterms should be updated
      expect(result.fieldsUpdated).toContain('moq');
      expect(result.fieldsUpdated).toContain('price');
      expect(result.fieldsUpdated).toContain('specsConfirmed');
      expect(result.fieldsUpdated).toContain('incotermsConfirmed');

      const updateCall = prisma.offer.update.mock.calls[0][0];
      expect(updateCall.data.leadTime).toBeUndefined();
      expect(updateCall.data.currency).toBeUndefined();
      expect(updateCall.data.moq).toBe(500);
      expect(updateCall.data.price).toBe(10.0);
    });

    it('should handle Gemini returning unparseable response', async () => {
      prisma.offer.findUnique.mockResolvedValue(baseOffer);
      gemini.generateContent.mockResolvedValue('I cannot process this request');

      const result = await service.enrichOffer('offer-1');

      expect(result.enriched).toBe(false);
      expect(result.fieldsUpdated).toEqual([]);
      expect(prisma.offer.update).not.toHaveBeenCalled();
    });
  });

  // ── enrichOffersForRfq ───────────────────────────────────────────

  describe('enrichOffersForRfq', () => {
    it('should batch enrich all eligible offers', async () => {
      prisma.offer.findMany.mockResolvedValue([
        { id: 'o1' },
        { id: 'o2' },
        { id: 'o3' },
      ]);

      // o1 and o3 get enriched, o2 has all fields
      prisma.offer.findUnique
        .mockResolvedValueOnce({
          id: 'o1', comments: 'MOQ 100', leadTime: null, moq: null, price: 5, currency: 'EUR',
          specsConfirmed: true, incotermsConfirmed: true, rfqRequest: {},
        })
        .mockResolvedValueOnce({
          id: 'o2', comments: 'All good', leadTime: 7, moq: 50, price: 5, currency: 'EUR',
          specsConfirmed: true, incotermsConfirmed: true, rfqRequest: {},
        })
        .mockResolvedValueOnce({
          id: 'o3', comments: 'Lead time 14 days', leadTime: null, moq: null, price: null,
          currency: null, specsConfirmed: false, incotermsConfirmed: false, rfqRequest: {},
        });

      gemini.generateContent
        .mockResolvedValueOnce('{"leadTime": null, "moq": 100}')
        .mockResolvedValueOnce('{"leadTime": 14, "moq": null, "price": null, "currency": null, "specsConfirmed": null, "incotermsConfirmed": null}');

      const result = await service.enrichOffersForRfq('rfq-1');
      expect(result.enrichedCount).toBe(2); // o1 (moq) + o3 (leadTime)
    });

    it('should continue on individual offer failure', async () => {
      prisma.offer.findMany.mockResolvedValue([{ id: 'o1' }, { id: 'o2' }]);

      prisma.offer.findUnique
        .mockRejectedValueOnce(new Error('DB error'))
        .mockResolvedValueOnce({
          id: 'o2', comments: 'MOQ 200', leadTime: null, moq: null, price: null,
          currency: null, specsConfirmed: false, incotermsConfirmed: false, rfqRequest: {},
        });

      gemini.generateContent.mockResolvedValueOnce('{"moq": 200}');

      const result = await service.enrichOffersForRfq('rfq-1');
      expect(result.enrichedCount).toBe(1); // only o2
    });
  });

  // ── buildExtractionPrompt ────────────────────────────────────────

  describe('buildExtractionPrompt', () => {
    it('should include only missing fields', () => {
      const prompt = service.buildExtractionPrompt(
        'Some comment', ['leadTime', 'moq'], { productName: 'Screws', quantity: 500 },
      );
      expect(prompt).toContain('leadTime, moq');
      expect(prompt).toContain('Screws');
      expect(prompt).toContain('500');
      expect(prompt).toContain('Some comment');
    });

    it('should handle missing RFQ context gracefully', () => {
      const prompt = service.buildExtractionPrompt('Comment', ['price'], null);
      expect(prompt).toContain('Unknown');
      expect(prompt).toContain('N/A');
    });
  });
});
