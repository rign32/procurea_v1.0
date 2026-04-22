import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../common/services/gemini.service';
import { TenantContextService } from '../common/services/tenant-context.service';

describe('ReportsService — getCampaignInsights', () => {
    let service: ReportsService;
    let prisma: any;
    let tenantContext: any;

    beforeEach(async () => {
        prisma = {
            campaign: { findFirst: jest.fn(), findUnique: jest.fn() },
            apiUsageLog: { groupBy: jest.fn() },
        };
        tenantContext = {
            resolve: jest.fn().mockResolvedValue({
                campaignOwnerFilter: () => ({ ownerId: 'u1' }),
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsService,
                { provide: PrismaService, useValue: prisma },
                { provide: GeminiService, useValue: {} },
                { provide: TenantContextService, useValue: tenantContext },
            ],
        }).compile();

        service = module.get<ReportsService>(ReportsService);
    });

    describe('authorization', () => {
        it('skips tenant check when userId is not provided (internal PDF flow)', async () => {
            prisma.campaign.findUnique.mockResolvedValue(null);
            const result = await service.getCampaignInsights('camp1');
            expect(result).toBeNull();
            expect(tenantContext.resolve).not.toHaveBeenCalled();
        });

        it('throws Forbidden when userId given but campaign not in tenant', async () => {
            prisma.campaign.findFirst.mockResolvedValue(null); // no match → unauthorized
            await expect(
                service.getCampaignInsights('camp1', 'u-attacker'),
            ).rejects.toBeInstanceOf(ForbiddenException);
            expect(prisma.campaign.findUnique).not.toHaveBeenCalled(); // guard short-circuits
        });

        it('proceeds when tenant check passes', async () => {
            prisma.campaign.findFirst.mockResolvedValue({ id: 'camp1' });
            prisma.campaign.findUnique.mockResolvedValue(null); // simulates deleted mid-request
            prisma.apiUsageLog.groupBy.mockResolvedValue([]);
            const result = await service.getCampaignInsights('camp1', 'u1');
            expect(result).toBeNull();
        });
    });

    describe('aggregations', () => {
        beforeEach(() => {
            prisma.campaign.findFirst.mockResolvedValue({ id: 'camp1' });
        });

        it('buckets suppliers by quality score thresholds', async () => {
            prisma.campaign.findUnique.mockResolvedValue({
                id: 'camp1',
                metrics: null,
                suppliers: [
                    { qualityScore: 90, country: 'PL', specialization: 'CNC', structuredCertificates: [] },
                    { qualityScore: 80, country: 'PL', specialization: 'CNC', structuredCertificates: [] }, // boundary high
                    { qualityScore: 79, country: 'DE', specialization: 'Casting', structuredCertificates: [{ id: 'c1' }] },
                    { qualityScore: 50, country: 'DE', specialization: null, structuredCertificates: [] }, // boundary medium
                    { qualityScore: 49, country: null, specialization: null, structuredCertificates: [] },
                    { qualityScore: null, country: 'PL', specialization: null, structuredCertificates: [] },
                ],
                rfqRequest: { offers: [] },
            });
            prisma.apiUsageLog.groupBy.mockResolvedValue([]);

            const result = await service.getCampaignInsights('camp1', 'u1');

            expect(result).not.toBeNull();
            expect(result!.totalSuppliers).toBe(6);
            expect(result!.certifiedCount).toBe(1);
            expect(result!.quality).toEqual({
                high: 2,
                medium: 2,
                low: 1,
                unscored: 1,
            });
        });

        it('computes funnel conversion rates, guarding against divide-by-zero', async () => {
            prisma.campaign.findUnique.mockResolvedValue({
                id: 'camp1',
                metrics: {
                    urlsCollected: 200,
                    urlsProcessed: 150,
                    screenerPassed: 60,
                    screenerFallback: 10,
                    auditorApproved: 30,
                    auditorRejected: 20,
                    auditorNeedsReview: 10,
                },
                suppliers: [],
                rfqRequest: { offers: [] },
            });
            prisma.apiUsageLog.groupBy.mockResolvedValue([]);

            const result = await service.getCampaignInsights('camp1', 'u1');

            expect(result!.funnel).toEqual(
                expect.objectContaining({
                    urlsCollected: 200,
                    screenerRate: 60 / 150, // 0.4
                    auditorRate: 30 / 60, // 0.5
                }),
            );
        });

        it('returns zero rates when denominators are 0 (no div-by-zero)', async () => {
            prisma.campaign.findUnique.mockResolvedValue({
                id: 'camp1',
                metrics: {
                    urlsCollected: 0,
                    urlsProcessed: 0,
                    screenerPassed: 0,
                    screenerFallback: 0,
                    auditorApproved: 0,
                    auditorRejected: 0,
                    auditorNeedsReview: 0,
                },
                suppliers: [],
                rfqRequest: { offers: [] },
            });
            prisma.apiUsageLog.groupBy.mockResolvedValue([]);

            const result = await service.getCampaignInsights('camp1', 'u1');

            expect(result!.funnel!.screenerRate).toBe(0);
            expect(result!.funnel!.auditorRate).toBe(0);
        });

        it('aggregates API usage costs across Gemini + Serper with error rate', async () => {
            prisma.campaign.findUnique.mockResolvedValue({
                id: 'camp1',
                metrics: null,
                suppliers: [],
                rfqRequest: { offers: [] },
            });
            prisma.apiUsageLog.groupBy.mockResolvedValue([
                { service: 'gemini', status: 'success', _count: { _all: 80 }, _sum: { estimatedCost: 0.4, tokensUsed: 120000 } },
                { service: 'gemini', status: 'error', _count: { _all: 5 }, _sum: { estimatedCost: 0, tokensUsed: 0 } },
                { service: 'serper', status: 'success', _count: { _all: 15 }, _sum: { estimatedCost: 0.015, tokensUsed: null } },
            ]);

            const result = await service.getCampaignInsights('camp1', 'u1');

            expect(result!.costs.gemini.calls).toBe(85);
            expect(result!.costs.gemini.tokens).toBe(120000);
            expect(result!.costs.gemini.estimatedUsd).toBeCloseTo(0.4);
            expect(result!.costs.serper.calls).toBe(15);
            expect(result!.costs.serper.estimatedUsd).toBeCloseTo(0.015);
            expect(result!.costs.totalUsd).toBeCloseTo(0.415);
            expect(result!.costs.errorRate).toBeCloseTo(5 / 100);
        });

        it('picks top 5 countries + specializations sorted by count', async () => {
            const mk = (country: string, spec: string | null) => ({
                qualityScore: 70,
                country,
                specialization: spec,
                structuredCertificates: [],
            });
            prisma.campaign.findUnique.mockResolvedValue({
                id: 'camp1',
                metrics: null,
                suppliers: [
                    mk('PL', 'CNC'),
                    mk('PL', 'CNC'),
                    mk('PL', 'CNC'),
                    mk('DE', 'Casting'),
                    mk('DE', 'Casting'),
                    mk('CZ', null),
                    mk('AT', 'Welding'),
                    mk('ES', 'CNC'),
                    mk('FR', 'Injection'),
                    mk('IT', 'Packaging'),
                ],
                rfqRequest: { offers: [] },
            });
            prisma.apiUsageLog.groupBy.mockResolvedValue([]);

            const result = await service.getCampaignInsights('camp1', 'u1');

            expect(result!.topCountries.map((c) => c.country)).toEqual(['PL', 'DE', 'CZ', 'AT', 'ES']);
            expect(result!.topCountries[0].count).toBe(3);
            expect(result!.topCategories.map((c) => c.category)).toEqual([
                'CNC', // 4
                'Casting', // 2
                'Welding',
                'Injection',
                'Packaging',
            ]);
        });

        it('summarizes offer statuses from rfqRequest.offers', async () => {
            prisma.campaign.findUnique.mockResolvedValue({
                id: 'camp1',
                metrics: null,
                suppliers: [],
                rfqRequest: {
                    offers: [
                        { id: 'o1', status: 'SUBMITTED' },
                        { id: 'o2', status: 'SUBMITTED' },
                        { id: 'o3', status: 'VIEWED' },
                        { id: 'o4', status: 'PENDING' },
                        { id: 'o5', status: 'ACCEPTED' },
                        { id: 'o6', status: 'REJECTED' },
                    ],
                },
            });
            prisma.apiUsageLog.groupBy.mockResolvedValue([]);

            const result = await service.getCampaignInsights('camp1', 'u1');

            expect(result!.offers).toEqual({
                total: 6,
                submitted: 2,
                viewed: 1,
                pending: 1,
                accepted: 1,
                rejected: 1,
            });
        });
    });
});
