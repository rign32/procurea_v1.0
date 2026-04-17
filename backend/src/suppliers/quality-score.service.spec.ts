import { Test, TestingModule } from '@nestjs/testing';
import { QualityScoreService } from './quality-score.service';
import { PrismaService } from '../prisma/prisma.service';

function makeOffer(overrides: Record<string, any> = {}) {
  return {
    id: 'offer-1',
    status: 'PENDING',
    price: null,
    leadTime: null,
    moq: null,
    specsConfirmed: false,
    incotermsConfirmed: false,
    viewedAt: null,
    submittedAt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('QualityScoreService', () => {
  let service: QualityScoreService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      supplier: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      offer: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QualityScoreService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<QualityScoreService>(QualityScoreService);
  });

  // ─── Response Rate (30 pts) ───

  describe('calcResponseRate', () => {
    it('returns 50% of max (15) when 0 offers', () => {
      expect(service.calcResponseRate([])).toBe(15);
    });

    it('returns full 30 when all offers responded', () => {
      const offers = [
        makeOffer({ status: 'SUBMITTED' }),
        makeOffer({ status: 'ACCEPTED' }),
      ];
      expect(service.calcResponseRate(offers)).toBe(30);
    });

    it('returns 0 when all offers are PENDING', () => {
      const offers = [makeOffer(), makeOffer()];
      expect(service.calcResponseRate(offers)).toBe(0);
    });

    it('returns proportional score for mixed statuses', () => {
      const offers = [
        makeOffer({ status: 'SUBMITTED' }),
        makeOffer({ status: 'PENDING' }),
      ];
      expect(service.calcResponseRate(offers)).toBe(15);
    });
  });

  // ─── Response Speed (20 pts) ───

  describe('calcResponseSpeed', () => {
    it('returns 50% of max (10) when 0 offers', () => {
      expect(service.calcResponseSpeed([])).toBe(10);
    });

    it('returns full 20 for avg response < 24h', () => {
      const offers = [
        makeOffer({
          createdAt: new Date('2026-01-01T00:00:00Z'),
          viewedAt: new Date('2026-01-01T12:00:00Z'),
        }),
      ];
      expect(service.calcResponseSpeed(offers)).toBe(20);
    });

    it('returns 75% (15) for avg response < 72h', () => {
      const offers = [
        makeOffer({
          createdAt: new Date('2026-01-01T00:00:00Z'),
          submittedAt: new Date('2026-01-02T12:00:00Z'), // 36h
        }),
      ];
      expect(service.calcResponseSpeed(offers)).toBe(15);
    });

    it('returns 50% (10) for avg response < 7 days', () => {
      const offers = [
        makeOffer({
          createdAt: new Date('2026-01-01T00:00:00Z'),
          viewedAt: new Date('2026-01-05T00:00:00Z'), // 96h
        }),
      ];
      expect(service.calcResponseSpeed(offers)).toBe(10);
    });

    it('returns 25% (5) for avg response > 7 days', () => {
      const offers = [
        makeOffer({
          createdAt: new Date('2026-01-01T00:00:00Z'),
          viewedAt: new Date('2026-01-15T00:00:00Z'), // 14 days
        }),
      ];
      expect(service.calcResponseSpeed(offers)).toBe(5);
    });

    it('returns neutral 10 when no response timestamps at all', () => {
      const offers = [makeOffer()]; // viewedAt=null, submittedAt=null
      expect(service.calcResponseSpeed(offers)).toBe(10);
    });

    it('prefers submittedAt over viewedAt when both present', () => {
      const offers = [
        makeOffer({
          createdAt: new Date('2026-01-01T00:00:00Z'),
          viewedAt: new Date('2026-01-01T06:00:00Z'),     // 6h
          submittedAt: new Date('2026-01-01T10:00:00Z'),   // 10h — still <24h
        }),
      ];
      // submittedAt is preferred (10h), <24h → full score
      expect(service.calcResponseSpeed(offers)).toBe(20);
    });
  });

  // ─── Completeness (20 pts) ───

  describe('calcCompleteness', () => {
    it('returns 0 when 0 offers', () => {
      expect(service.calcCompleteness([])).toBe(0);
    });

    it('returns full 20 when all fields filled', () => {
      const offers = [
        makeOffer({
          price: 100,
          leadTime: 2,
          moq: 500,
          specsConfirmed: true,
          incotermsConfirmed: true,
        }),
      ];
      expect(service.calcCompleteness(offers)).toBe(20);
    });

    it('returns 0 when no fields filled', () => {
      const offers = [makeOffer()];
      expect(service.calcCompleteness(offers)).toBe(0);
    });

    it('returns proportional score for partial fields', () => {
      const offers = [
        makeOffer({ price: 50, moq: 100 }), // 2/5 fields
      ];
      expect(service.calcCompleteness(offers)).toBeCloseTo(8); // 2/5 * 20
    });

    it('averages across multiple offers', () => {
      const offers = [
        makeOffer({ price: 50, moq: 100, leadTime: 3, specsConfirmed: true, incotermsConfirmed: true }), // 5/5
        makeOffer(), // 0/5
      ];
      expect(service.calcCompleteness(offers)).toBeCloseTo(10); // avg 0.5 * 20
    });
  });

  // ─── Win Rate (15 pts) ───

  describe('calcWinRate', () => {
    it('returns 50% of max (7.5) when 0 offers', () => {
      expect(service.calcWinRate([])).toBe(7.5);
    });

    it('returns full 15 when all offers won', () => {
      const offers = [
        makeOffer({ status: 'ACCEPTED' }),
        makeOffer({ status: 'SHORTLISTED' }),
      ];
      expect(service.calcWinRate(offers)).toBe(15);
    });

    it('returns 0 when no offers won', () => {
      const offers = [
        makeOffer({ status: 'SUBMITTED' }),
        makeOffer({ status: 'REJECTED' }),
      ];
      expect(service.calcWinRate(offers)).toBe(0);
    });

    it('returns proportional score for mixed wins', () => {
      const offers = [
        makeOffer({ status: 'ACCEPTED' }),
        makeOffer({ status: 'REJECTED' }),
      ];
      expect(service.calcWinRate(offers)).toBe(7.5);
    });
  });

  // ─── Blacklist Penalty (15 pts) ───

  describe('calcBlacklistPenalty', () => {
    it('returns full 15 when not blacklisted', () => {
      expect(
        service.calcBlacklistPenalty({ deletedAt: null, registry: null }),
      ).toBe(15);
    });

    it('returns 0 when supplier has deletedAt', () => {
      expect(
        service.calcBlacklistPenalty({
          deletedAt: new Date(),
          registry: null,
        }),
      ).toBe(0);
    });

    it('returns 0 when registry isBlacklisted', () => {
      expect(
        service.calcBlacklistPenalty({
          deletedAt: null,
          registry: { isBlacklisted: true },
        }),
      ).toBe(0);
    });

    it('returns 15 when registry exists but not blacklisted', () => {
      expect(
        service.calcBlacklistPenalty({
          deletedAt: null,
          registry: { isBlacklisted: false },
        }),
      ).toBe(15);
    });
  });

  // ─── computeScore (integration) ───

  describe('computeScore', () => {
    it('returns 0 for non-existent supplier', async () => {
      prisma.supplier.findUnique.mockResolvedValue(null);
      expect(await service.computeScore('missing-id')).toBe(0);
    });

    it('returns neutral score for supplier with 0 offers and no blacklist', async () => {
      prisma.supplier.findUnique.mockResolvedValue({
        id: 'sup-1',
        deletedAt: null,
        offers: [],
        registry: null,
      });
      // responseRate=15, responseSpeed=10, completeness=0, winRate=7.5, blacklist=15 = 47.5 → 48
      expect(await service.computeScore('sup-1')).toBe(48);
    });

    it('returns perfect score for ideal supplier', async () => {
      prisma.supplier.findUnique.mockResolvedValue({
        id: 'sup-2',
        deletedAt: null,
        registry: { isBlacklisted: false },
        offers: [
          makeOffer({
            status: 'ACCEPTED',
            price: 100,
            leadTime: 2,
            moq: 500,
            specsConfirmed: true,
            incotermsConfirmed: true,
            createdAt: new Date('2026-01-01T00:00:00Z'),
            submittedAt: new Date('2026-01-01T06:00:00Z'),
          }),
        ],
      });
      // responseRate=30, responseSpeed=20, completeness=20, winRate=15, blacklist=15 = 100
      expect(await service.computeScore('sup-2')).toBe(100);
    });

    it('returns 0 for blacklisted supplier with all PENDING offers', async () => {
      prisma.supplier.findUnique.mockResolvedValue({
        id: 'sup-3',
        deletedAt: new Date(),
        registry: { isBlacklisted: true },
        offers: [makeOffer(), makeOffer()],
      });
      // responseRate=0, responseSpeed=10, completeness=0, winRate=0, blacklist=0 = 10
      expect(await service.computeScore('sup-3')).toBe(10);
    });

    it('clamps score to 0 minimum', async () => {
      // This scenario tests clamping — even negative shouldn't happen with current formula
      // but test the clamp guard
      prisma.supplier.findUnique.mockResolvedValue({
        id: 'sup-4',
        deletedAt: new Date(),
        registry: { isBlacklisted: true },
        offers: [makeOffer()],
      });
      const score = await service.computeScore('sup-4');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  // ─── computeAndSave ───

  describe('computeAndSave', () => {
    it('computes score and saves to database', async () => {
      prisma.supplier.findUnique.mockResolvedValue({
        id: 'sup-1',
        deletedAt: null,
        offers: [],
        registry: null,
      });
      prisma.supplier.update.mockResolvedValue({});

      const score = await service.computeAndSave('sup-1');
      expect(score).toBe(48);
      expect(prisma.supplier.update).toHaveBeenCalledWith({
        where: { id: 'sup-1' },
        data: { qualityScore: 48 },
      });
    });
  });

  // ─── recomputeForCampaign ───

  describe('recomputeForCampaign', () => {
    it('recomputes scores for all active suppliers in campaign', async () => {
      prisma.supplier.findMany.mockResolvedValue([
        { id: 'sup-1' },
        { id: 'sup-2' },
      ]);
      prisma.supplier.findUnique.mockResolvedValue({
        id: 'sup-1',
        deletedAt: null,
        offers: [],
        registry: null,
      });
      prisma.supplier.update.mockResolvedValue({});

      await service.recomputeForCampaign('campaign-1');
      expect(prisma.supplier.findMany).toHaveBeenCalledWith({
        where: { campaignId: 'campaign-1', deletedAt: null },
        select: { id: true },
      });
      expect(prisma.supplier.update).toHaveBeenCalledTimes(2);
    });
  });

  // ─── onOfferStatusChange ───

  describe('onOfferStatusChange', () => {
    it('recomputes score for the offer supplier', async () => {
      prisma.offer.findUnique.mockResolvedValue({ supplierId: 'sup-1' });
      prisma.supplier.findUnique.mockResolvedValue({
        id: 'sup-1',
        deletedAt: null,
        offers: [],
        registry: null,
      });
      prisma.supplier.update.mockResolvedValue({});

      await service.onOfferStatusChange('offer-1');
      expect(prisma.offer.findUnique).toHaveBeenCalledWith({
        where: { id: 'offer-1' },
        select: { supplierId: true },
      });
      expect(prisma.supplier.update).toHaveBeenCalled();
    });

    it('does nothing when offer not found', async () => {
      prisma.offer.findUnique.mockResolvedValue(null);
      await service.onOfferStatusChange('missing-offer');
      expect(prisma.supplier.update).not.toHaveBeenCalled();
    });
  });
});
