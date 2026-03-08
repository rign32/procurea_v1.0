import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeCountry } from '../common/normalize-country';

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Campaign report: suppliers, sequence progress per step, country breakdown
     */
    async getCampaignReport(campaignId: string) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                suppliers: {
                    select: {
                        id: true,
                        analysisScore: true,
                        country: true,
                        deletedAt: true,
                    },
                },
                sequenceTemplate: {
                    include: {
                        steps: { orderBy: { dayOffset: 'asc' } },
                    },
                },
                rfqRequest: {
                    include: {
                        offers: {
                            select: {
                                id: true,
                                status: true,
                                price: true,
                                currency: true,
                                createdAt: true,
                                sequenceExecutions: {
                                    select: { stepId: true, status: true, recipientEmail: true, sentAt: true },
                                },
                                supplier: {
                                    select: { id: true, name: true, country: true, contactEmails: true, contacts: { select: { email: true } } },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!campaign) return null;

        const allSuppliers = campaign.suppliers;
        const activeSuppliers = allSuppliers.filter(s => !s.deletedAt);
        const excludedCount = allSuppliers.length - activeSuppliers.length;
        const offers = campaign.rfqRequest?.offers || [];
        const offersReceived = offers.filter(o => !['PENDING'].includes(o.status)).length;
        const accepted = offers.filter(o => o.status === 'ACCEPTED').length;

        // Country breakdown (active suppliers only)
        const countryMap: Record<string, number> = {};
        for (const s of activeSuppliers) {
            const c = normalizeCountry(s.country);
            countryMap[c] = (countryMap[c] || 0) + 1;
        }
        const countries = Object.entries(countryMap)
            .map(([country, count]) => ({ country, count }))
            .sort((a, b) => b.count - a.count);

        // Sequence progress per step
        const sequenceProgress: Array<{
            stepId: string;
            stepName: string;
            dayOffset: number;
            type: string;
            sent: number;
            failed: number;
            total: number;
        }> = [];

        if (campaign.sequenceTemplate?.steps) {
            const totalOffers = offers.length;
            for (const step of campaign.sequenceTemplate.steps) {
                const executions = offers.flatMap(o =>
                    o.sequenceExecutions.filter(e => e.stepId === step.id),
                );
                sequenceProgress.push({
                    stepId: step.id,
                    stepName: step.subject,
                    dayOffset: step.dayOffset,
                    type: step.type,
                    sent: executions.filter(e => e.status === 'SENT').length,
                    failed: executions.filter(e => e.status === 'FAILED').length,
                    total: totalOffers,
                });
            }
        }

        // Detailed per-supplier sequence status
        const steps = campaign.sequenceTemplate?.steps || [];
        const minuteMultiplier = process.env.SEQUENCE_MINUTE_MULTIPLIER
            ? parseInt(process.env.SEQUENCE_MINUTE_MULTIPLIER, 10)
            : null;

        const sequenceDetails = offers.map(offer => {
            const supplier = offer.supplier;
            const executions = offer.sequenceExecutions.map(e => {
                const step = steps.find(s => s.id === e.stepId);
                return {
                    stepId: e.stepId,
                    stepType: step?.type || 'UNKNOWN',
                    dayOffset: step?.dayOffset ?? null,
                    recipientEmail: e.recipientEmail,
                    sentAt: e.sentAt,
                    status: e.status,
                };
            });

            // Calculate next scheduled step
            let nextScheduled: { stepType: string; dueAt: string; dayOffset: number } | null = null;
            const sentStepIds = new Set(
                offer.sequenceExecutions
                    .filter(e => e.status === 'SENT')
                    .map(e => e.stepId),
            );

            for (const step of steps) {
                if (!sentStepIds.has(step.id)) {
                    const due = new Date(offer.createdAt);
                    if (minuteMultiplier) {
                        due.setMinutes(due.getMinutes() + step.dayOffset * minuteMultiplier);
                    } else {
                        due.setDate(due.getDate() + step.dayOffset);
                    }
                    nextScheduled = {
                        stepType: step.type,
                        dueAt: due.toISOString(),
                        dayOffset: step.dayOffset,
                    };
                    break;
                }
            }

            // All contact emails
            const contactEmails = supplier?.contacts?.map((c: any) => c.email).filter(Boolean) || [];
            const fallbackEmails = supplier?.contactEmails
                ? supplier.contactEmails.split(',').map((e: string) => e.trim()).filter(Boolean)
                : [];
            const allEmails = contactEmails.length > 0 ? contactEmails : fallbackEmails;

            return {
                offerId: offer.id,
                offerStatus: offer.status,
                offerCreatedAt: offer.createdAt,
                supplierId: supplier?.id,
                supplierName: supplier?.name,
                supplierCountry: supplier?.country ? normalizeCountry(supplier.country) : null,
                allEmails,
                executions,
                nextScheduled,
            };
        });

        return {
            campaignId,
            campaignStatus: campaign.status,
            totalSuppliers: allSuppliers.length,
            qualifiedCount: activeSuppliers.length,
            excludedCount,
            offersCreated: offers.length,
            offersReceived,
            accepted,
            sequenceProgress,
            sequenceTemplateName: campaign.sequenceTemplate?.name || null,
            sequenceDetails,
            countries,
        };
    }

    /**
     * Global funnel: campaigns → RFQ sent → viewed → responses → accepted
     */
    async getFunnel() {
        const totalCampaigns = await this.prisma.campaign.count({ where: { deletedAt: null } });
        const campaignsWithRfq = await this.prisma.campaign.count({
            where: { deletedAt: null, rfqRequest: { isNot: null } },
        });

        const offers = await this.prisma.offer.findMany({
            select: { status: true },
        });

        const totalOffers = offers.length;
        const viewed = offers.filter(o => o.status !== 'PENDING').length;
        const submitted = offers.filter(o =>
            ['SUBMITTED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'].includes(o.status),
        ).length;
        const accepted = offers.filter(o => o.status === 'ACCEPTED').length;

        return {
            totalCampaigns,
            rfqSent: campaignsWithRfq,
            totalOffers,
            viewed,
            responses: submitted,
            accepted,
        };
    }

    /**
     * Top suppliers by response rate and average score
     */
    async getSupplierPerformance(_limit = 20) {
        const suppliers = await this.prisma.supplier.findMany({
            include: {
                _count: { select: { offers: true } },
                offers: { select: { status: true } },
            },
            take: 100,
        });

        const ranked = suppliers
            .map(s => {
                const total = s._count.offers;
                const responded = s.offers.filter(o =>
                    ['SUBMITTED', 'SHORTLISTED', 'ACCEPTED'].includes(o.status),
                ).length;
                const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

                return {
                    id: s.id,
                    name: s.name,
                    country: normalizeCountry(s.country),
                    analysisScore: s.analysisScore,
                    totalOffers: total,
                    respondedOffers: responded,
                    responseRate,
                };
            })
            .filter(s => s.totalOffers > 0)
            .sort((a, b) => b.responseRate - a.responseRate)
            .slice(0, _limit);

        return ranked;
    }
}
