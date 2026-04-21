import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../common/services/gemini.service';
import { TenantContextService } from '../common/services/tenant-context.service';
import { normalizeCountry, normalizeCountryForLang } from '../common/normalize-country';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PptxGenJS = require('pptxgenjs');

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly geminiService: GeminiService,
        private readonly tenantContext: TenantContextService,
    ) { }

    /**
     * Verify the given user can see this campaign (via RfqRequest.ownerId).
     * Throws ForbiddenException otherwise. Returns nothing on success.
     */
    private async ensureCampaignAccess(campaignId: string, userId: string): Promise<void> {
        const tenant = await this.tenantContext.resolve(userId);
        const campaign = await this.prisma.campaign.findFirst({
            where: {
                id: campaignId,
                rfqRequest: tenant.campaignOwnerFilter(),
            },
            select: { id: true },
        });
        if (!campaign) throw new ForbiddenException('Not authorized to access this campaign');
    }

    /**
     * Campaign Insights — cost breakdown, funnel conversion, quality distribution,
     * top countries/categories. Feeds the Insights card on CampaignDetailPage.
     */
    async getCampaignInsights(campaignId: string, userId?: string) {
        if (userId) {
            await this.ensureCampaignAccess(campaignId, userId);
        }
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                metrics: true,
                suppliers: {
                    where: { deletedAt: null },
                    select: {
                        qualityScore: true,
                        analysisScore: true,
                        country: true,
                        specialization: true,
                        structuredCertificates: {
                            where: { reviewStatus: 'APPROVED' },
                            select: { id: true },
                        },
                    },
                },
                rfqRequest: {
                    include: {
                        offers: { select: { id: true, status: true } },
                    },
                },
            },
        });

        if (!campaign) {
            return null;
        }

        // Cost breakdown — aggregate ApiUsageLog by service for this campaign
        const apiLogs = await this.prisma.apiUsageLog.groupBy({
            by: ['service', 'status'],
            where: { campaignId },
            _count: { _all: true },
            _sum: { estimatedCost: true, tokensUsed: true },
        });

        const costs = {
            gemini: { calls: 0, tokens: 0, estimatedUsd: 0 },
            serper: { calls: 0, tokens: 0, estimatedUsd: 0 },
            totalUsd: 0,
            errorRate: 0,
        };
        let totalCalls = 0;
        let errorCalls = 0;
        for (const row of apiLogs) {
            const calls = row._count._all ?? 0;
            const cost = row._sum.estimatedCost ?? 0;
            const tokens = row._sum.tokensUsed ?? 0;
            totalCalls += calls;
            if (row.status === 'error') errorCalls += calls;
            if (row.service === 'gemini') {
                costs.gemini.calls += calls;
                costs.gemini.tokens += tokens;
                costs.gemini.estimatedUsd += cost;
            } else if (row.service === 'serper') {
                costs.serper.calls += calls;
                costs.serper.estimatedUsd += cost;
            }
        }
        costs.totalUsd = costs.gemini.estimatedUsd + costs.serper.estimatedUsd;
        costs.errorRate = totalCalls > 0 ? errorCalls / totalCalls : 0;

        // Funnel conversion — drawn from CampaignMetrics
        const m = campaign.metrics;
        const funnel = m
            ? {
                  urlsCollected: m.urlsCollected,
                  urlsProcessed: m.urlsProcessed,
                  screenerPassed: m.screenerPassed,
                  screenerFallback: m.screenerFallback,
                  auditorApproved: m.auditorApproved,
                  auditorRejected: m.auditorRejected,
                  auditorNeedsReview: m.auditorNeedsReview,
                  // Conversion rates (0-1)
                  screenerRate: m.urlsProcessed > 0 ? m.screenerPassed / m.urlsProcessed : 0,
                  auditorRate:
                      m.screenerPassed > 0 ? m.auditorApproved / m.screenerPassed : 0,
              }
            : null;

        // Quality score distribution (3 buckets)
        const quality = { high: 0, medium: 0, low: 0, unscored: 0 };
        for (const s of campaign.suppliers) {
            const score = s.qualityScore;
            if (score == null) quality.unscored++;
            else if (score >= 80) quality.high++;
            else if (score >= 50) quality.medium++;
            else quality.low++;
        }

        // Top 5 countries
        const countryCounts = new Map<string, number>();
        for (const s of campaign.suppliers) {
            const c = s.country || 'Unknown';
            countryCounts.set(c, (countryCounts.get(c) ?? 0) + 1);
        }
        const topCountries = Array.from(countryCounts.entries())
            .map(([country, count]) => ({ country, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Top 5 categories (specialization)
        const catCounts = new Map<string, number>();
        for (const s of campaign.suppliers) {
            if (!s.specialization) continue;
            const c = s.specialization;
            catCounts.set(c, (catCounts.get(c) ?? 0) + 1);
        }
        const topCategories = Array.from(catCounts.entries())
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Offer outcomes (pulled via rfqRequest since Campaign has no direct offers relation)
        const offersArr = campaign.rfqRequest?.offers ?? [];
        const offers = {
            total: offersArr.length,
            submitted: offersArr.filter((o) => o.status === 'SUBMITTED').length,
            viewed: offersArr.filter((o) => o.status === 'VIEWED').length,
            pending: offersArr.filter((o) => o.status === 'PENDING').length,
            accepted: offersArr.filter((o) => o.status === 'ACCEPTED').length,
            rejected: offersArr.filter((o) => o.status === 'REJECTED').length,
        };

        // Certified suppliers (at least 1 APPROVED structured cert)
        const certifiedCount = campaign.suppliers.filter(
            (s) => s.structuredCertificates.length > 0,
        ).length;

        return {
            campaignId,
            totalSuppliers: campaign.suppliers.length,
            certifiedCount,
            costs,
            funnel,
            quality,
            topCountries,
            topCategories,
            offers,
            generatedAt: new Date().toISOString(),
        };
    }

    /**
     * Short AI-written narrative (2-3 sentences) summarizing Insights data.
     * Cached per campaign on the `Campaign.aiInsightsNarrative` field when added;
     * for now returns fresh each call — Gemini has its own disk cache so repeated
     * identical prompts are nearly free.
     */
    async generateInsightsNarrative(
        campaignId: string,
        lang: string = 'pl',
        userId?: string,
    ): Promise<{ narrative: string | null; lang: string }> {
        const insights = await this.getCampaignInsights(campaignId, userId);
        if (!insights || insights.totalSuppliers === 0) {
            return { narrative: null, lang };
        }

        const langLabel = lang === 'en' ? 'English' : lang === 'de' ? 'German' : 'Polish';
        const topCountry = insights.topCountries[0];
        const secondCountry = insights.topCountries[1];
        const funnelLine = insights.funnel
            ? `Funnel: ${insights.funnel.urlsProcessed} URLs processed, ${insights.funnel.screenerPassed} passed screening (${Math.round(insights.funnel.screenerRate * 100)}%), ${insights.funnel.auditorApproved} approved by auditor (${Math.round(insights.funnel.auditorRate * 100)}%).`
            : '';
        const costLine = insights.costs.totalUsd > 0
            ? `Cost: ~$${insights.costs.totalUsd.toFixed(2)} (${insights.costs.gemini.calls} Gemini calls, ${insights.costs.serper.calls} Serper queries).`
            : '';
        const countryLine = topCountry
            ? `Top country: ${topCountry.country} (${topCountry.count})${secondCountry ? `, then ${secondCountry.country} (${secondCountry.count})` : ''}.`
            : '';
        const qualityLine = `Quality: ${insights.quality.high} high, ${insights.quality.medium} medium, ${insights.quality.low} low.`;
        const offerLine = insights.offers.total > 0
            ? `Offers: ${insights.offers.submitted} submitted, ${insights.offers.accepted} accepted.`
            : '';
        const certLine = insights.certifiedCount > 0
            ? `Certified: ${insights.certifiedCount} of ${insights.totalSuppliers} suppliers.`
            : '';

        const facts = [funnelLine, costLine, countryLine, qualityLine, offerLine, certLine]
            .filter(Boolean)
            .join(' ');

        const prompt = `You are a procurement analyst writing a brief executive summary in ${langLabel}.

Campaign facts:
- Total suppliers: ${insights.totalSuppliers}
- ${facts}

Write 3 short sentences (no more than 80 words total) summarizing:
1. Scale + dominant geography
2. Funnel efficiency + cost
3. Outcome quality (offers, certifications)

Be specific with numbers. Do NOT use bullet points or headings — plain prose. Do NOT invent facts beyond what's provided. Output only the summary text, no preamble.`;

        try {
            const narrative = await this.geminiService.generateContent(
                prompt,
                undefined,
                `insights-narrative:${campaignId}:${lang}`,
            );
            return { narrative: narrative.trim(), lang };
        } catch (err) {
            this.logger.warn(`Insights narrative failed: ${(err as Error).message}`);
            return { narrative: null, lang };
        }
    }

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
        const lang = (campaign as any).language || 'pl';
        const countryMap: Record<string, number> = {};
        for (const s of activeSuppliers) {
            const c = normalizeCountryForLang(s.country, lang);
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
     * Advanced analytics aggregation: funnel, costs, quality, activity timeline, top countries
     */
    async getAnalytics() {
        // --- Funnel aggregation from CampaignMetrics ---
        const metricsAgg = await this.prisma.campaignMetrics.aggregate({
            _avg: {
                urlsCollected: true,
                urlsProcessed: true,
                screenerPassed: true,
                auditorApproved: true,
                avgCapabilityScore: true,
                avgTrustScore: true,
                totalCost: true,
                costPerSupplier: true,
            },
            _sum: {
                urlsCollected: true,
                urlsProcessed: true,
                screenerPassed: true,
                auditorApproved: true,
                totalCost: true,
                geminiCalls: true,
                serperCalls: true,
            },
            _count: true,
        });

        const totalCampaigns = await this.prisma.campaign.count({ where: { deletedAt: null } });
        const totalSuppliers = await this.prisma.supplier.count({ where: { deletedAt: null } });

        // --- Funnel summary (aggregated across all campaign metrics) ---
        const funnel = {
            totalCampaigns,
            totalUrlsCollected: metricsAgg._sum.urlsCollected ?? 0,
            totalUrlsProcessed: metricsAgg._sum.urlsProcessed ?? 0,
            totalScreenerPassed: metricsAgg._sum.screenerPassed ?? 0,
            totalAuditorApproved: metricsAgg._sum.auditorApproved ?? 0,
            avgUrlsPerCampaign: Math.round(metricsAgg._avg.urlsCollected ?? 0),
            avgScreenerPassRate: metricsAgg._avg.urlsProcessed
                ? Math.round(((metricsAgg._avg.screenerPassed ?? 0) / metricsAgg._avg.urlsProcessed) * 100)
                : 0,
            avgAuditorPassRate: metricsAgg._avg.screenerPassed
                ? Math.round(((metricsAgg._avg.auditorApproved ?? 0) / metricsAgg._avg.screenerPassed) * 100)
                : 0,
        };

        // --- Cost summary ---
        const cost = {
            totalCost: Math.round((metricsAgg._sum.totalCost ?? 0) * 100) / 100,
            avgCostPerCampaign: Math.round((metricsAgg._avg.totalCost ?? 0) * 100) / 100,
            avgCostPerSupplier: Math.round((metricsAgg._avg.costPerSupplier ?? 0) * 1000) / 1000,
            totalGeminiCalls: metricsAgg._sum.geminiCalls ?? 0,
            totalSerperCalls: metricsAgg._sum.serperCalls ?? 0,
        };

        // --- Quality summary ---
        const quality = {
            avgCapabilityScore: Math.round((metricsAgg._avg.avgCapabilityScore ?? 0) * 10) / 10,
            avgTrustScore: Math.round((metricsAgg._avg.avgTrustScore ?? 0) * 10) / 10,
            totalSuppliers,
        };

        // --- Activity timeline: campaigns per month (last 6 months) ---
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const recentCampaigns = await this.prisma.campaign.findMany({
            where: {
                deletedAt: null,
                createdAt: { gte: sixMonthsAgo },
            },
            select: { createdAt: true },
        });

        // Group by year-month
        const monthlyMap: Record<string, number> = {};
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyMap[key] = 0;
        }
        for (const c of recentCampaigns) {
            const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, '0')}`;
            if (key in monthlyMap) {
                monthlyMap[key]++;
            }
        }

        const activityTimeline = Object.entries(monthlyMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, count]) => ({ month, count }));

        // --- Top countries: top 10 supplier countries by count ---
        const suppliers = await this.prisma.supplier.findMany({
            where: { deletedAt: null, country: { not: null } },
            select: { country: true },
        });

        const countryMap: Record<string, number> = {};
        for (const s of suppliers) {
            const c = normalizeCountry(s.country);
            if (c) countryMap[c] = (countryMap[c] || 0) + 1;
        }

        const topCountries = Object.entries(countryMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([country, count]) => ({ country, count }));

        return {
            funnel,
            cost,
            quality,
            activityTimeline,
            topCountries,
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
    /**
     * AI-generated campaign summary with market insights
     */
    async generateAiSummary(campaignId: string, requestedLang?: string) {
        // Check cache (24h TTL)
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            select: {
                aiSummary: true,
                aiSummaryGeneratedAt: true,
                language: true,
                name: true,
                status: true,
                rfqRequest: { select: { productName: true, category: true, material: true } },
                suppliers: {
                    where: { deletedAt: null },
                    select: {
                        name: true,
                        country: true,
                        specialization: true,
                        analysisScore: true,
                        companyType: true,
                        employeeCount: true,
                        certificates: true,
                        city: true,
                    },
                },
            },
        });

        if (!campaign) return null;

        // Determine effective language: requestedLang (from frontend query) > campaign.language > 'pl'
        const effectiveLang = requestedLang || campaign.language || 'pl';

        // Return cached summary if fresh (< 24h) AND in the correct language
        if (campaign.aiSummary && campaign.aiSummaryGeneratedAt) {
            const age = Date.now() - campaign.aiSummaryGeneratedAt.getTime();
            const cached = JSON.parse(campaign.aiSummary);
            const cachedLang = cached._lang || 'pl';
            if (age < 24 * 60 * 60 * 1000 && cachedLang === effectiveLang) {
                return cached;
            }
        }

        const suppliers = campaign.suppliers;
        if (suppliers.length === 0) {
            return { error: 'No suppliers found for this campaign' };
        }

        const productName = campaign.rfqRequest?.productName || campaign.name;

        // Company type breakdown
        const typeBreakdown: Record<string, number> = {};
        for (const s of suppliers) {
            const t = s.companyType || 'NIEJASNY';
            typeBreakdown[t] = (typeBreakdown[t] || 0) + 1;
        }

        // Country breakdown
        const countryBreakdown: Record<string, number> = {};
        for (const s of suppliers) {
            const c = normalizeCountryForLang(s.country, effectiveLang);
            countryBreakdown[c] = (countryBreakdown[c] || 0) + 1;
        }

        const isEN = effectiveLang === 'en';

        const supplierData = JSON.stringify(suppliers.map(s => ({
            name: s.name,
            country: normalizeCountryForLang(s.country, effectiveLang),
            city: s.city,
            specialization: s.specialization,
            score: s.analysisScore,
            type: s.companyType,
            employees: s.employeeCount,
            certificates: s.certificates,
        })), null, 2);

        const prompt = isEN
            ? `You are a procurement analyst. Analyze the results of a sourcing campaign.

PRODUCT: ${productName}
CATEGORY: ${campaign.rfqRequest?.category || 'N/A'}
MATERIAL: ${campaign.rfqRequest?.material || 'N/A'}
SUPPLIERS (${suppliers.length}):
${supplierData}

TYPE BREAKDOWN: ${JSON.stringify(typeBreakdown)}
COUNTRY BREAKDOWN: ${JSON.stringify(countryBreakdown)}

Generate a report in JSON format:
{
  "marketOverview": "2-3 sentences summarizing the supplier market for this product",
  "keyPlayers": [{"name": "Company name", "why": "Why they stand out"}],
  "geographicAnalysis": "Analysis of the geographic distribution of suppliers",
  "coverageAssessment": "HIGH|MEDIUM|LOW",
  "coverageNote": "Explanation of market coverage assessment",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "riskFactors": ["Risk 1", "Risk 2"],
  "priceInsight": "Estimated price context based on company size and region",
  "companyTypeBreakdown": ${JSON.stringify(typeBreakdown)},
  "countryBreakdown": ${JSON.stringify(countryBreakdown)}
}

RULES:
- keyPlayers: max 5, sorted by importance
- recommendations: 3-5 practical recommendations
- riskFactors: 2-3 key risks
- coverageAssessment: HIGH (>15 suppliers, good distribution), MEDIUM (8-15), LOW (<8)
- Write in English
- Return ONLY JSON, no comments`
            : `Jesteś analitykiem zakupowym. Przeanalizuj wyniki kampanii sourcingowej.

PRODUKT: ${productName}
KATEGORIA: ${campaign.rfqRequest?.category || 'N/A'}
MATERIAŁ: ${campaign.rfqRequest?.material || 'N/A'}
DOSTAWCY (${suppliers.length}):
${supplierData}

ROZKŁAD TYPÓW: ${JSON.stringify(typeBreakdown)}
ROZKŁAD KRAJÓW: ${JSON.stringify(countryBreakdown)}

Wygeneruj raport w formacie JSON:
{
  "marketOverview": "2-3 zdania podsumowujące rynek dostawców tego produktu",
  "keyPlayers": [{"name": "Nazwa firmy", "why": "Dlaczego wyróżniający się"}],
  "geographicAnalysis": "Analiza rozkładu geograficznego dostawców",
  "coverageAssessment": "HIGH|MEDIUM|LOW",
  "coverageNote": "Wyjaśnienie oceny pokrycia rynku",
  "recommendations": ["Rekomendacja 1", "Rekomendacja 2", "Rekomendacja 3"],
  "riskFactors": ["Ryzyko 1", "Ryzyko 2"],
  "priceInsight": "Szacunkowy kontekst cenowy na podstawie wielkości firm i regionu",
  "companyTypeBreakdown": ${JSON.stringify(typeBreakdown)},
  "countryBreakdown": ${JSON.stringify(countryBreakdown)}
}

ZASADY:
- keyPlayers: max 5, posortowane od najważniejszego
- recommendations: 3-5 praktycznych rekomendacji
- riskFactors: 2-3 kluczowe ryzyka
- coverageAssessment: HIGH (>15 dostawców, dobry rozkład), MEDIUM (8-15), LOW (<8)
- Pisz po polsku
- Zwróć TYLKO JSON, bez komentarzy`;

        try {
            const response = await this.geminiService.generateContent(prompt);
            const jsonString = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const summary = JSON.parse(jsonString);
            summary._lang = effectiveLang;

            // Cache in DB
            await this.prisma.campaign.update({
                where: { id: campaignId },
                data: {
                    aiSummary: JSON.stringify(summary),
                    aiSummaryGeneratedAt: new Date(),
                },
            });

            return summary;
        } catch (error: any) {
            this.logger.error(`AI summary generation failed: ${error.message}`);
            return { error: 'Failed to generate AI summary' };
        }
    }

    /**
     * Shared helper: get AI summary + supplier data for PDF/PPTX export
     */
    private async getReportData(campaignId: string) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            select: {
                name: true,
                status: true,
                createdAt: true,
                aiSummary: true,
                rfqRequest: { select: { productName: true, category: true, material: true } },
                suppliers: {
                    where: { deletedAt: null },
                    orderBy: { analysisScore: 'desc' },
                    select: {
                        name: true,
                        country: true,
                        city: true,
                        specialization: true,
                        analysisScore: true,
                        companyType: true,
                        certificates: true,
                        website: true,
                    },
                },
            },
        });

        if (!campaign) return null;

        let aiSummary = campaign.aiSummary ? JSON.parse(campaign.aiSummary) : null;
        if (!aiSummary) {
            aiSummary = await this.generateAiSummary(campaignId);
            if (aiSummary?.error) aiSummary = null;
        }

        const countryBreakdown: Record<string, number> = {};
        for (const s of campaign.suppliers) {
            const c = normalizeCountry(s.country);
            countryBreakdown[c] = (countryBreakdown[c] || 0) + 1;
        }

        return {
            campaignName: campaign.name,
            productName: campaign.rfqRequest?.productName || campaign.name,
            category: campaign.rfqRequest?.category || null,
            material: campaign.rfqRequest?.material || null,
            createdAt: campaign.createdAt,
            aiSummary,
            suppliers: campaign.suppliers,
            countryBreakdown,
        };
    }

    /**
     * Generate branded PDF report
     */
    async generatePdf(campaignId: string): Promise<Buffer> {
        const data = await this.getReportData(campaignId);
        if (!data) throw new Error('Campaign not found');

        // Prefetch insights — can't await inside the PDFKit Promise executor
        const insights = await this.getCampaignInsights(campaignId);

        const BRAND_COLOR = '#2563eb';
        const GRAY = '#6b7280';
        const DARK = '#111827';

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks: Buffer[] = [];
            doc.on('data', (chunk: Buffer) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // --- HEADER ---
            doc.fontSize(24).fillColor(BRAND_COLOR).text('Procurea', 50, 50);
            doc.fontSize(9).fillColor(GRAY).text('Raport analizy sourcingowej', 50, 78);
            doc.moveTo(50, 95).lineTo(545, 95).strokeColor(BRAND_COLOR).lineWidth(2).stroke();

            // --- TITLE ---
            doc.moveDown(1);
            doc.fontSize(18).fillColor(DARK).text(data.campaignName, 50, 110);
            const meta: string[] = [];
            if (data.category) meta.push(`Kategoria: ${data.category}`);
            if (data.material) meta.push(`Materiał: ${data.material}`);
            meta.push(`Dostawców: ${data.suppliers.length}`);
            meta.push(`Data: ${new Date(data.createdAt).toLocaleDateString('pl-PL')}`);
            doc.fontSize(9).fillColor(GRAY).text(meta.join('  |  '), 50, 135);

            let y = 160;

            if (data.aiSummary) {
                const s = data.aiSummary;

                // Market Overview
                y = this.pdfSection(doc, 'Przegląd rynku', s.marketOverview, y, BRAND_COLOR, DARK, GRAY);

                // Coverage
                const coverageLabel = s.coverageAssessment === 'HIGH' ? 'Wysokie' : s.coverageAssessment === 'MEDIUM' ? 'Średnie' : 'Niskie';
                y = this.pdfSection(doc, `Pokrycie rynku: ${coverageLabel}`, s.coverageNote, y, BRAND_COLOR, DARK, GRAY);

                // Key Players
                if (s.keyPlayers?.length > 0) {
                    y = this.pdfCheckPage(doc, y, 80);
                    doc.fontSize(12).fillColor(BRAND_COLOR).text('Kluczowi gracze', 50, y);
                    y += 18;
                    for (const kp of s.keyPlayers.slice(0, 5)) {
                        y = this.pdfCheckPage(doc, y, 20);
                        doc.fontSize(9).fillColor(DARK).text(`• ${kp.name}`, 55, y, { continued: true })
                            .fillColor(GRAY).text(` — ${kp.why}`, { continued: false });
                        y += 14;
                    }
                    y += 6;
                }

                // Geographic + Price
                if (s.geographicAnalysis) {
                    y = this.pdfSection(doc, 'Analiza geograficzna', s.geographicAnalysis, y, BRAND_COLOR, DARK, GRAY);
                }
                if (s.priceInsight) {
                    y = this.pdfSection(doc, 'Kontekst cenowy', s.priceInsight, y, BRAND_COLOR, DARK, GRAY);
                }

                // Recommendations
                if (s.recommendations?.length > 0) {
                    y = this.pdfCheckPage(doc, y, 60);
                    doc.fontSize(12).fillColor(BRAND_COLOR).text('Rekomendacje', 50, y);
                    y += 18;
                    for (const r of s.recommendations) {
                        y = this.pdfCheckPage(doc, y, 20);
                        doc.fontSize(9).fillColor(DARK).text(`✓ ${r}`, 55, y);
                        y += 14;
                    }
                    y += 6;
                }

                // Risk Factors
                if (s.riskFactors?.length > 0) {
                    y = this.pdfCheckPage(doc, y, 60);
                    doc.fontSize(12).fillColor(BRAND_COLOR).text('Czynniki ryzyka', 50, y);
                    y += 18;
                    for (const r of s.riskFactors) {
                        y = this.pdfCheckPage(doc, y, 20);
                        doc.fontSize(9).fillColor(DARK).text(`⚠ ${r}`, 55, y);
                        y += 14;
                    }
                    y += 6;
                }
            }

            // --- CAMPAIGN INSIGHTS (funnel, costs, quality) ---
            if (insights) {
                y = this.pdfCheckPage(doc, y, 30);
                doc.fontSize(12).fillColor(BRAND_COLOR).text('Metryki kampanii', 50, y);
                y += 20;

                // Funnel with conversion rates
                if (insights.funnel && (insights.funnel.urlsCollected > 0 || insights.funnel.screenerPassed > 0)) {
                    y = this.pdfCheckPage(doc, y, 70);
                    doc.fontSize(10).fillColor(DARK).text('Lejek konwersji', 50, y);
                    y += 14;
                    const f = insights.funnel;
                    const screenerPct = f.urlsProcessed > 0 ? Math.round(f.screenerRate * 100) : 0;
                    const auditorPct = f.screenerPassed > 0 ? Math.round(f.auditorRate * 100) : 0;
                    doc.fontSize(9).fillColor(DARK);
                    doc.text(`URL zebrane: ${f.urlsCollected}   •   zbadane: ${f.urlsProcessed}`, 55, y);
                    y += 13;
                    doc.text(`Screener przeszło: ${f.screenerPassed} (${screenerPct}%)   •   Audytor zatwierdził: ${f.auditorApproved} (${auditorPct}%)`, 55, y);
                    y += 13;
                    doc.text(`Audytor odrzucił: ${f.auditorRejected}   •   do weryfikacji: ${f.auditorNeedsReview}`, 55, y);
                    y += 16;
                }

                // Costs
                if (insights.costs.gemini.calls > 0 || insights.costs.serper.calls > 0) {
                    y = this.pdfCheckPage(doc, y, 55);
                    doc.fontSize(10).fillColor(DARK).text('Koszty AI + search', 50, y);
                    y += 14;
                    doc.fontSize(9).fillColor(DARK);
                    doc.text(`Gemini: ${insights.costs.gemini.calls} wywołań  |  Serper: ${insights.costs.serper.calls} zapytań`, 55, y);
                    y += 13;
                    const total = insights.costs.totalUsd;
                    const totalStr = total < 0.01 ? '< $0.01' : `$${total.toFixed(2)}`;
                    doc.text(`Razem: ${totalStr}`, 55, y);
                    if (insights.costs.errorRate > 0) {
                        doc.fillColor('#dc2626').text(`   błędy: ${Math.round(insights.costs.errorRate * 100)}%`, { continued: false });
                    }
                    doc.fillColor(DARK);
                    y += 16;
                }

                // Quality distribution
                if (insights.totalSuppliers > 0) {
                    y = this.pdfCheckPage(doc, y, 55);
                    doc.fontSize(10).fillColor(DARK).text('Dystrybucja quality score', 50, y);
                    y += 14;
                    doc.fontSize(9).fillColor(DARK);
                    const q = insights.quality;
                    const parts = [
                        `High (≥80): ${q.high}`,
                        `Medium (50-79): ${q.medium}`,
                        `Low (<50): ${q.low}`,
                    ];
                    if (q.unscored > 0) parts.push(`bez oceny: ${q.unscored}`);
                    doc.text(parts.join('  |  '), 55, y);
                    y += 13;
                    doc.fillColor(GRAY).text(
                        `${insights.certifiedCount} z ${insights.totalSuppliers} dostawców ma zatwierdzony certyfikat  •  ${insights.offers.submitted} ofert złożonych  •  ${insights.offers.accepted} zaakceptowanych`,
                        55, y,
                        { width: 495 },
                    );
                    doc.fillColor(DARK);
                    y += 20;
                }

                // Top specializations (countries already rendered below in existing block)
                if (insights.topCategories.length > 0) {
                    y = this.pdfCheckPage(doc, y, 30 + insights.topCategories.length * 13);
                    doc.fontSize(10).fillColor(DARK).text('Top specjalizacje', 50, y);
                    y += 14;
                    for (const c of insights.topCategories) {
                        doc.fontSize(9).fillColor(DARK).text(
                            `${c.category}: ${c.count}`,
                            55, y,
                            { width: 490 },
                        );
                        y += 13;
                    }
                    y += 8;
                }
            }

            // --- COUNTRY BREAKDOWN ---
            const countries = Object.entries(data.countryBreakdown)
                .sort((a, b) => b[1] - a[1]).slice(0, 10);
            if (countries.length > 0) {
                y = this.pdfCheckPage(doc, y, 40 + countries.length * 14);
                doc.fontSize(12).fillColor(BRAND_COLOR).text('Rozkład krajów', 50, y);
                y += 18;
                for (const [country, count] of countries) {
                    doc.fontSize(9).fillColor(DARK).text(`${country}: ${count}`, 55, y);
                    y += 14;
                }
                y += 10;
            }

            // --- TOP SUPPLIERS TABLE ---
            const topSuppliers = data.suppliers.slice(0, 20);
            if (topSuppliers.length > 0) {
                doc.addPage();
                y = 50;
                doc.fontSize(14).fillColor(BRAND_COLOR).text('Top dostawcy', 50, y);
                y += 25;

                // Table header
                doc.fontSize(8).fillColor(GRAY);
                doc.text('Firma', 50, y);
                doc.text('Kraj', 220, y);
                doc.text('Miasto', 300, y);
                doc.text('Specjalizacja', 370, y);
                doc.text('Score', 510, y);
                y += 14;
                doc.moveTo(50, y).lineTo(545, y).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
                y += 6;

                for (const sup of topSuppliers) {
                    y = this.pdfCheckPage(doc, y, 16);
                    doc.fontSize(8).fillColor(DARK);
                    doc.text((sup.name || '').substring(0, 30), 50, y, { width: 165 });
                    doc.text(normalizeCountry(sup.country) || '', 220, y, { width: 75 });
                    doc.text((sup.city || '').substring(0, 15), 300, y, { width: 65 });
                    doc.text((sup.specialization || '').substring(0, 25), 370, y, { width: 135 });
                    const score = sup.analysisScore != null ? `${Math.round(sup.analysisScore * 10)}%` : '—';
                    doc.text(score, 510, y, { width: 35 });
                    y += 14;
                }
            }

            // --- WATERMARK FOOTER (every page) ---
            const pages = doc.bufferedPageRange();
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).fillColor(GRAY)
                    .text('Wygenerowano przez Procurea', 50, 780, { align: 'center', width: 495 });
            }

            doc.end();
        });
    }

    private pdfSection(doc: any, title: string, text: string, y: number,
        brandColor: string, dark: string, gray: string): number {
        y = this.pdfCheckPage(doc, y, 50);
        doc.fontSize(12).fillColor(brandColor).text(title, 50, y);
        y += 18;
        doc.fontSize(9).fillColor(dark).text(text || '', 50, y, { width: 495, lineGap: 3 });
        y += doc.heightOfString(text || '', { width: 495, lineGap: 3 }) + 12;
        return y;
    }

    private pdfCheckPage(doc: any, y: number, needed: number): number {
        if (y + needed > 760) {
            doc.addPage();
            return 50;
        }
        return y;
    }

    /**
     * Generate branded PowerPoint report
     */
    async generatePptx(campaignId: string): Promise<Buffer> {
        const data = await this.getReportData(campaignId);
        if (!data) throw new Error('Campaign not found');

        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_WIDE';
        pptx.author = 'Procurea';
        pptx.title = `Analiza: ${data.campaignName}`;

        const BRAND = '2563EB';
        const DARK = '111827';
        const GRAY = '6B7280';
        const LIGHT_BG = 'F3F4F6';
        const WHITE = 'FFFFFF';

        const addBranding = (slide: any) => {
            // Top bar
            slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.6, fill: { color: BRAND } });
            slide.addText('Procurea', { x: 0.5, y: 0.1, w: 3, h: 0.4, fontSize: 18, bold: true, color: WHITE, fontFace: 'Arial' });
            // Footer
            slide.addText('Wygenerowano przez Procurea', { x: 0, y: 7.0, w: '100%', h: 0.3, fontSize: 8, color: GRAY, align: 'center', fontFace: 'Arial' });
        };

        // --- SLIDE 1: Title ---
        const slide1 = pptx.addSlide();
        addBranding(slide1);
        slide1.addText(data.campaignName, { x: 0.5, y: 1.5, w: 12, h: 1.2, fontSize: 32, bold: true, color: DARK, fontFace: 'Arial' });
        const metaLines: string[] = [];
        if (data.productName) metaLines.push(`Produkt: ${data.productName}`);
        if (data.category) metaLines.push(`Kategoria: ${data.category}`);
        if (data.material) metaLines.push(`Materiał: ${data.material}`);
        metaLines.push(`Dostawców: ${data.suppliers.length}`);
        metaLines.push(`Data: ${new Date(data.createdAt).toLocaleDateString('pl-PL')}`);
        slide1.addText(metaLines.join('\n'), { x: 0.5, y: 2.8, w: 12, h: 1.5, fontSize: 14, color: GRAY, fontFace: 'Arial', lineSpacing: 22 });

        if (data.aiSummary) {
            const s = data.aiSummary;

            // --- SLIDE 2: Market Overview + Coverage ---
            const slide2 = pptx.addSlide();
            addBranding(slide2);
            slide2.addText('Przegląd rynku', { x: 0.5, y: 0.8, w: 12, h: 0.5, fontSize: 22, bold: true, color: DARK, fontFace: 'Arial' });
            slide2.addText(s.marketOverview || '', { x: 0.5, y: 1.5, w: 12, h: 1.5, fontSize: 13, color: DARK, fontFace: 'Arial', lineSpacing: 20 });

            const coverageLabel = s.coverageAssessment === 'HIGH' ? 'Wysokie' : s.coverageAssessment === 'MEDIUM' ? 'Średnie' : 'Niskie';
            const coverageColor = s.coverageAssessment === 'HIGH' ? '16A34A' : s.coverageAssessment === 'MEDIUM' ? 'CA8A04' : 'DC2626';
            slide2.addShape(pptx.ShapeType.rect, { x: 0.5, y: 3.3, w: 12, h: 1.2, fill: { color: LIGHT_BG }, rectRadius: 0.1 });
            slide2.addText(`Pokrycie rynku: ${coverageLabel}`, { x: 0.7, y: 3.4, w: 5, h: 0.4, fontSize: 14, bold: true, color: coverageColor, fontFace: 'Arial' });
            slide2.addText(s.coverageNote || '', { x: 0.7, y: 3.8, w: 11.5, h: 0.6, fontSize: 11, color: GRAY, fontFace: 'Arial' });

            // --- SLIDE 3: Key Players ---
            if (s.keyPlayers?.length > 0) {
                const slide3 = pptx.addSlide();
                addBranding(slide3);
                slide3.addText('Kluczowi gracze', { x: 0.5, y: 0.8, w: 12, h: 0.5, fontSize: 22, bold: true, color: DARK, fontFace: 'Arial' });

                const rows: any[][] = [
                    [
                        { text: '#', options: { bold: true, fontSize: 11, color: WHITE, fill: { color: BRAND }, align: 'center' } },
                        { text: 'Firma', options: { bold: true, fontSize: 11, color: WHITE, fill: { color: BRAND } } },
                        { text: 'Dlaczego wyróżniający się', options: { bold: true, fontSize: 11, color: WHITE, fill: { color: BRAND } } },
                    ],
                ];
                s.keyPlayers.slice(0, 5).forEach((kp: any, i: number) => {
                    const bg = i % 2 === 0 ? LIGHT_BG : WHITE;
                    rows.push([
                        { text: `${i + 1}`, options: { fontSize: 11, align: 'center', fill: { color: bg } } },
                        { text: kp.name, options: { fontSize: 11, bold: true, fill: { color: bg } } },
                        { text: kp.why, options: { fontSize: 10, color: GRAY, fill: { color: bg } } },
                    ]);
                });

                slide3.addTable(rows, { x: 0.5, y: 1.5, w: 12, colW: [0.6, 3.5, 7.9], border: { type: 'solid', pt: 0.5, color: 'E5E7EB' } });
            }

            // --- SLIDE 4: Geographic + Price ---
            if (s.geographicAnalysis || s.priceInsight) {
                const slide4 = pptx.addSlide();
                addBranding(slide4);
                let yPos = 0.8;
                if (s.geographicAnalysis) {
                    slide4.addText('Analiza geograficzna', { x: 0.5, y: yPos, w: 12, h: 0.5, fontSize: 22, bold: true, color: DARK, fontFace: 'Arial' });
                    yPos += 0.6;
                    slide4.addText(s.geographicAnalysis, { x: 0.5, y: yPos, w: 12, h: 1.5, fontSize: 12, color: DARK, fontFace: 'Arial', lineSpacing: 20 });
                    yPos += 1.8;
                }
                if (s.priceInsight) {
                    slide4.addText('Kontekst cenowy', { x: 0.5, y: yPos, w: 12, h: 0.5, fontSize: 22, bold: true, color: DARK, fontFace: 'Arial' });
                    yPos += 0.6;
                    slide4.addText(s.priceInsight, { x: 0.5, y: yPos, w: 12, h: 1.5, fontSize: 12, color: DARK, fontFace: 'Arial', lineSpacing: 20 });
                }
            }

            // --- SLIDE 5: Recommendations + Risks ---
            if (s.recommendations?.length > 0 || s.riskFactors?.length > 0) {
                const slide5 = pptx.addSlide();
                addBranding(slide5);

                if (s.recommendations?.length > 0) {
                    slide5.addText('Rekomendacje', { x: 0.5, y: 0.8, w: 6, h: 0.5, fontSize: 18, bold: true, color: DARK, fontFace: 'Arial' });
                    const recText = s.recommendations.map((r: string) => `✓  ${r}`).join('\n');
                    slide5.addText(recText, { x: 0.5, y: 1.4, w: 6, h: 3, fontSize: 11, color: DARK, fontFace: 'Arial', lineSpacing: 22 });
                }
                if (s.riskFactors?.length > 0) {
                    slide5.addText('Czynniki ryzyka', { x: 6.8, y: 0.8, w: 6, h: 0.5, fontSize: 18, bold: true, color: DARK, fontFace: 'Arial' });
                    const riskText = s.riskFactors.map((r: string) => `⚠  ${r}`).join('\n');
                    slide5.addText(riskText, { x: 6.8, y: 1.4, w: 6, h: 3, fontSize: 11, color: 'B45309', fontFace: 'Arial', lineSpacing: 22 });
                }
            }
        }

        // --- SLIDE: Country Breakdown ---
        const countries = Object.entries(data.countryBreakdown)
            .sort((a, b) => b[1] - a[1]).slice(0, 10);
        if (countries.length > 0) {
            const slideC = pptx.addSlide();
            addBranding(slideC);
            slideC.addText('Rozkład krajów', { x: 0.5, y: 0.8, w: 12, h: 0.5, fontSize: 22, bold: true, color: DARK, fontFace: 'Arial' });

            const maxCount = countries[0][1];
            countries.forEach(([country, count], i) => {
                const yPos = 1.6 + i * 0.5;
                slideC.addText(country, { x: 0.5, y: yPos, w: 2.5, h: 0.4, fontSize: 12, color: DARK, fontFace: 'Arial' });
                const barWidth = Math.max(0.3, (count / maxCount) * 7);
                slideC.addShape(pptx.ShapeType.rect, { x: 3.2, y: yPos + 0.05, w: barWidth, h: 0.3, fill: { color: BRAND }, rectRadius: 0.05 });
                slideC.addText(`${count}`, { x: 3.2 + barWidth + 0.2, y: yPos, w: 1, h: 0.4, fontSize: 12, bold: true, color: DARK, fontFace: 'Arial' });
            });
        }

        // --- SLIDE: Top Suppliers ---
        const topSuppliers = data.suppliers.slice(0, 15);
        if (topSuppliers.length > 0) {
            const slideSup = pptx.addSlide();
            addBranding(slideSup);
            slideSup.addText('Top dostawcy', { x: 0.5, y: 0.8, w: 12, h: 0.5, fontSize: 22, bold: true, color: DARK, fontFace: 'Arial' });

            const headerRow: any[] = [
                { text: 'Firma', options: { bold: true, fontSize: 10, color: WHITE, fill: { color: BRAND } } },
                { text: 'Kraj', options: { bold: true, fontSize: 10, color: WHITE, fill: { color: BRAND } } },
                { text: 'Specjalizacja', options: { bold: true, fontSize: 10, color: WHITE, fill: { color: BRAND } } },
                { text: 'Score', options: { bold: true, fontSize: 10, color: WHITE, fill: { color: BRAND }, align: 'center' } },
            ];
            const supRows: any[][] = [headerRow];
            topSuppliers.forEach((sup, i) => {
                const bg = i % 2 === 0 ? LIGHT_BG : WHITE;
                const score = sup.analysisScore != null ? `${Math.round(sup.analysisScore * 10)}%` : '—';
                supRows.push([
                    { text: (sup.name || '').substring(0, 35), options: { fontSize: 9, fill: { color: bg } } },
                    { text: normalizeCountry(sup.country) || '', options: { fontSize: 9, fill: { color: bg } } },
                    { text: (sup.specialization || '').substring(0, 30), options: { fontSize: 9, fill: { color: bg } } },
                    { text: score, options: { fontSize: 9, fill: { color: bg }, align: 'center' } },
                ]);
            });

            slideSup.addTable(supRows, { x: 0.5, y: 1.5, w: 12, colW: [4, 2.5, 4, 1.5], border: { type: 'solid', pt: 0.5, color: 'E5E7EB' } });
        }

        const output = await pptx.write({ outputType: 'nodebuffer' });
        return output as Buffer;
    }

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
