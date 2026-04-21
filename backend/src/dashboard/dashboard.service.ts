import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/services/tenant-context.service';

const DAY_MS = 24 * 60 * 60 * 1000;
const STUCK_THRESHOLD_MS = 2 * 60 * 60 * 1000;

@Injectable()
export class DashboardService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantContext: TenantContextService,
    ) {}

    async getStats(userId: string) {
        const tenant = await this.tenantContext.resolve(userId);
        const rfqFilter = tenant.campaignOwnerFilter();
        const campaignWhere = { deletedAt: null, rfqRequest: rfqFilter };
        const thirtyDaysAgo = new Date(Date.now() - 30 * DAY_MS);
        const sevenDaysAgo = new Date(Date.now() - 7 * DAY_MS);
        const stuckBefore = new Date(Date.now() - STUCK_THRESHOLD_MS);

        const [
            totalCampaigns,
            activeCampaigns,
            completedCampaigns,
            suppliersTotal,
            suppliersLast30,
            shortlistedCount,
            topScoresRows,
            pendingOffersCount,
            expiringOffersCount,
            pendingApprovals,
            stuckCampaignsList,
            zeroSupplierRecent,
        ] = await Promise.all([
            this.prisma.campaign.count({ where: campaignWhere }),
            this.prisma.campaign.count({ where: { ...campaignWhere, status: 'RUNNING' } }),
            this.prisma.campaign.count({
                where: { ...campaignWhere, status: { in: ['COMPLETED', 'ACCEPTED'] } },
            }),
            this.prisma.supplier.count({
                where: { deletedAt: null, campaign: campaignWhere },
            }),
            this.prisma.supplier.count({
                where: {
                    deletedAt: null,
                    campaign: { ...campaignWhere, createdAt: { gte: thirtyDaysAgo } },
                },
            }),
            this.prisma.offer.count({
                where: {
                    status: 'SHORTLISTED',
                    rfqRequest: rfqFilter,
                },
            }),
            this.prisma.supplier.findMany({
                where: {
                    deletedAt: null,
                    campaign: campaignWhere,
                    analysisScore: { not: null },
                },
                select: { analysisScore: true },
                orderBy: { analysisScore: 'desc' },
                take: 1000,
            }),
            this.prisma.offer.count({
                where: {
                    status: 'PENDING',
                    rfqRequest: rfqFilter,
                },
            }),
            this.prisma.offer.count({
                where: {
                    status: { in: ['PENDING', 'VIEWED'] },
                    rfqRequest: rfqFilter,
                    validityDate: {
                        gte: new Date(),
                        lte: new Date(Date.now() + 7 * DAY_MS),
                    },
                },
            }),
            this.prisma.approvalRequest.count({
                where: { approverId: userId, status: 'PENDING' },
            }),
            this.prisma.campaign.findMany({
                where: {
                    ...campaignWhere,
                    status: 'RUNNING',
                    updatedAt: { lte: stuckBefore },
                },
                select: { id: true, name: true, updatedAt: true, stage: true },
                orderBy: { updatedAt: 'asc' },
                take: 5,
            }),
            this.prisma.campaign.count({
                where: {
                    ...campaignWhere,
                    status: { in: ['COMPLETED', 'FAILED'] },
                    createdAt: { gte: sevenDaysAgo },
                    suppliers: { none: {} },
                },
            }),
        ]);

        const topDecileCount = Math.max(1, Math.ceil(topScoresRows.length * 0.1));
        const topScores = topScoresRows.slice(0, topDecileCount);
        const avgTopDecileScore = topScores.length > 0
            ? topScores.reduce((s, r) => s + (r.analysisScore ?? 0), 0) / topScores.length
            : null;

        return {
            campaigns: {
                total: totalCampaigns,
                active: activeCampaigns,
                completed: completedCampaigns,
            },
            suppliers: {
                total: suppliersTotal,
                last30d: suppliersLast30,
                shortlisted: shortlistedCount,
                avgMatchTopDecile: avgTopDecileScore !== null
                    ? Math.round(avgTopDecileScore * 10)
                    : null,
            },
            offers: {
                pending: pendingOffersCount,
                expiringSoon: expiringOffersCount,
            },
            attention: {
                pendingApprovals,
                stuckCampaigns: stuckCampaignsList.map(c => ({
                    id: c.id,
                    name: c.name,
                    stage: c.stage,
                    stuckSince: c.updatedAt,
                })),
                zeroSupplierCampaigns7d: zeroSupplierRecent,
            },
        };
    }

    async getActivity(userId: string, limit: number = 20) {
        const tenant = await this.tenantContext.resolve(userId);
        const userIds = tenant.visibleOwnerIds;
        const since = new Date(Date.now() - 7 * DAY_MS);

        const [auditLogs, recentCampaigns, recentOffers] = await Promise.all([
            this.prisma.auditLog.findMany({
                where: {
                    userId: { in: userIds },
                    createdAt: { gte: since },
                },
                select: {
                    id: true, action: true, entityType: true, entityId: true,
                    createdAt: true, user: { select: { name: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: limit * 2,
            }),
            this.prisma.campaign.findMany({
                where: {
                    deletedAt: null,
                    rfqRequest: tenant.campaignOwnerFilter(),
                    updatedAt: { gte: since },
                },
                select: {
                    id: true, name: true, status: true,
                    createdAt: true, updatedAt: true,
                },
                orderBy: { updatedAt: 'desc' },
                take: limit,
            }),
            this.prisma.offer.findMany({
                where: {
                    rfqRequest: tenant.campaignOwnerFilter(),
                    OR: [
                        { submittedAt: { gte: since } },
                        { viewedAt: { gte: since } },
                    ],
                },
                select: {
                    id: true, status: true, submittedAt: true, viewedAt: true,
                    supplier: { select: { id: true, name: true } },
                    rfqRequest: { select: { campaignId: true, productName: true } },
                },
                orderBy: { updatedAt: 'desc' },
                take: limit,
            }),
        ]);

        type Event = {
            id: string;
            type: 'campaign' | 'offer' | 'audit';
            tone: 'ok' | 'warn' | 'info';
            text: string;
            ts: Date;
            href?: string;
        };

        const events: Event[] = [];

        for (const c of recentCampaigns) {
            if (c.status === 'COMPLETED' || c.status === 'ACCEPTED') {
                events.push({
                    id: `c-${c.id}-done`,
                    type: 'campaign',
                    tone: 'ok',
                    text: `${c.name} — completed`,
                    ts: c.updatedAt,
                    href: `/campaigns/${c.id}`,
                });
            } else if (c.status === 'FAILED' || c.status === 'ERROR') {
                events.push({
                    id: `c-${c.id}-err`,
                    type: 'campaign',
                    tone: 'warn',
                    text: `${c.name} — failed, needs review`,
                    ts: c.updatedAt,
                    href: `/campaigns/${c.id}`,
                });
            } else if (c.status === 'RUNNING' && c.createdAt.getTime() === c.updatedAt.getTime()) {
                events.push({
                    id: `c-${c.id}-start`,
                    type: 'campaign',
                    tone: 'info',
                    text: `${c.name} — campaign started`,
                    ts: c.createdAt,
                    href: `/campaigns/${c.id}`,
                });
            }
        }

        for (const o of recentOffers) {
            if (o.submittedAt) {
                events.push({
                    id: `o-${o.id}-sub`,
                    type: 'offer',
                    tone: 'ok',
                    text: `${o.supplier?.name || 'Supplier'} submitted offer — ${o.rfqRequest?.productName || ''}`.trim(),
                    ts: o.submittedAt,
                    href: o.rfqRequest?.campaignId ? `/campaigns/${o.rfqRequest.campaignId}` : undefined,
                });
            } else if (o.viewedAt) {
                events.push({
                    id: `o-${o.id}-view`,
                    type: 'offer',
                    tone: 'info',
                    text: `${o.supplier?.name || 'Supplier'} opened RFQ`,
                    ts: o.viewedAt,
                    href: o.rfqRequest?.campaignId ? `/campaigns/${o.rfqRequest.campaignId}` : undefined,
                });
            }
        }

        for (const log of auditLogs) {
            if (log.entityType === 'Campaign' || log.entityType === 'Supplier' || log.entityType === 'Offer') {
                const actorName = log.user?.name || log.user?.email?.split('@')[0] || 'Someone';
                const actionVerb = log.action === 'CREATE' ? 'created' : log.action === 'UPDATE' ? 'updated' : 'removed';
                events.push({
                    id: `a-${log.id}`,
                    type: 'audit',
                    tone: 'info',
                    text: `${actorName} ${actionVerb} ${log.entityType.toLowerCase()}`,
                    ts: log.createdAt,
                });
            }
        }

        events.sort((a, b) => b.ts.getTime() - a.ts.getTime());
        const unique = new Map<string, Event>();
        for (const e of events) {
            if (!unique.has(e.id)) unique.set(e.id, e);
        }
        return Array.from(unique.values()).slice(0, limit);
    }
}
