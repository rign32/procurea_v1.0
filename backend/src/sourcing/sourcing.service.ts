import { Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import { normalizeCountry, getLanguageForCountry } from '../common/normalize-country';
import { PrismaService } from '../prisma/prisma.service';
import { ProductContext } from './agents/screener.agent';
import { StrategyAgentService, REGION_LANGUAGE_CONFIG } from './agents/strategy.agent';
import { ScreenerAgentService } from './agents/screener.agent';
import { EnrichmentAgentService } from './agents/enrichment.agent';
import { AuditorAgentService } from './agents/auditor.agent';
import { ExpansionAgentService } from './agents/expansion.agent';
import { GoogleSearchService } from '../common/services/google-search.service';
import { ScrapingService } from '../common/services/scraping.service';
import { QueryCacheService, CachedSearchResult } from '../common/services/query-cache.service';
import { CompanyRegistryService } from '../common/services/company-registry.service';
import { CreateCampaignDto } from './sourcing.controller';
import { SourcingGateway } from './sourcing.gateway';
import { EmailService } from '../email/email.service';
import { GeminiService } from '../common/services/gemini.service';
import { v4 as uuidv4 } from 'uuid';
import pLimit = require('p-limit');
import * as XLSX from 'xlsx';

// Known industry portals / directories — never save as suppliers, always mine
const PORTAL_DOMAINS = new Set([
    // Polish portals
    'tworzywa.org', 'plastech.pl', 'tworzywa.pl',
    'panoramafirm.pl', 'pkt.pl', 'firmy.net', 'baza-firm.pl',
    'pfrn.pl', 'firmeo.com',
    // European B2B directories
    'europages.com', 'europages.co.uk', 'europages.de', 'europages.fr',
    'europages.it', 'europages.es', 'europages.nl',
    'kompass.com', 'thomasnet.com', 'globalspec.com',
    'wer-liefert-was.de', 'wlw.de',
    'industrystock.com', 'exportpages.com',
    // Global directories
    'alibaba.com', 'made-in-china.com', 'indiamart.com',
    'directindustry.com', 'tradekey.com', 'go4worldbusiness.com',
    'globalsources.com', 'ec21.com', 'ecvv.com',
    // Business data
    'yellow-pages.com', 'dnb.com', 'hoovers.com',
    'zoominfo.com', 'crunchbase.com',
    // Industry-specific
    'plasteurope.com', 'plasticsportal.net', 'plasticsnews.com',
    'manufacturing.net', 'zycon.com', 'mfg.com',
    // Social / non-supplier
    'linkedin.com', 'facebook.com', 'twitter.com', 'youtube.com',
    'wikipedia.org', 'reddit.com',
]);

// Known e-commerce / marketplace domains — hard-reject before scraping
const SHOP_DOMAINS = new Set([
    'allegro.pl', 'ceneo.pl', 'olx.pl', 'amazon.com', 'amazon.de',
    'ebay.com', 'ebay.de', 'aliexpress.com', 'wish.com',
    'empik.com', 'morele.net', 'x-kom.pl', 'mediamarkt.pl',
]);

function isPortalDomain(domain: string): boolean {
    const clean = domain.replace(/^www\./, '').toLowerCase();
    return PORTAL_DOMAINS.has(clean) || [...PORTAL_DOMAINS].some(p => clean.endsWith('.' + p));
}

function parseEmployeeCount(raw: string | undefined): number | null {
    if (!raw || raw === 'N/A') return null;
    const cleaned = raw.replace(/[^\d\-+]/g, '');
    const parts = cleaned.split('-');
    const last = parts[parts.length - 1].replace('+', '');
    const num = parseInt(last, 10);
    return isNaN(num) ? null : num;
}

const MAX_EMPLOYEE_COUNT = 10000;

/**
 * Normalize company name for fuzzy deduplication.
 * Strips legal suffixes, special chars, and normalizes whitespace.
 */
function normalizeCompanyNameForDedup(name: string): string {
    return name
        .toLowerCase()
        .trim()
        // Remove legal suffixes (Polish, German, English, Dutch, Italian, French, etc.)
        .replace(/\b(sp\.?\s*z\s*o\.?\s*o\.?|sp\.?\s*j\.?|sp\.?\s*k\.?|s\.?\s*a\.?|s\.?\s*c\.?)\b/gi, '')
        .replace(/\b(gmbh|ag|kg|ohg|e\.?\s*k\.?|ug|mbh|co\.?\s*kg)\b/gi, '')
        .replace(/\b(ltd\.?|limited|llc|inc\.?|corp\.?|corporation|plc|co\.?)\b/gi, '')
        .replace(/\b(b\.?\s*v\.?|n\.?\s*v\.?|v\.?\s*o\.?\s*f\.?|c\.?\s*v\.?)\b/gi, '')
        .replace(/\b(s\.?\s*r\.?\s*l\.?|s\.?\s*p\.?\s*a\.?|s\.?\s*a\.?\s*s\.?|s\.?\s*n\.?\s*c\.?)\b/gi, '')
        .replace(/\b(sarl|sas|eurl|sa)\b/gi, '')
        .replace(/\b(ab|oy|as|aps|a\/s)\b/gi, '')
        // Remove punctuation and special chars
        .replace(/[.,\-–—&+()'"\/\\]/g, ' ')
        // Collapse whitespace
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Maps language code to Google Search locale parameters (gl=country, hl=language)
 * This ensures search results are localized for each target market.
 */
function languageToGoogleLocale(lang: string): { gl: string; hl: string } {
    const mapping: Record<string, { gl: string; hl: string }> = {
        pl: { gl: 'pl', hl: 'pl' },
        de: { gl: 'de', hl: 'de' },
        en: { gl: 'gb', hl: 'en' },
        fr: { gl: 'fr', hl: 'fr' },
        cs: { gl: 'cz', hl: 'cs' },
        it: { gl: 'it', hl: 'it' },
        es: { gl: 'es', hl: 'es' },
        pt: { gl: 'pt', hl: 'pt' },
        nl: { gl: 'nl', hl: 'nl' },
        sv: { gl: 'se', hl: 'sv' },
        ro: { gl: 'ro', hl: 'ro' },
        da: { gl: 'dk', hl: 'da' },
        hu: { gl: 'hu', hl: 'hu' },
        fi: { gl: 'fi', hl: 'fi' },
        ja: { gl: 'jp', hl: 'ja' },
        ko: { gl: 'kr', hl: 'ko' },
        zh: { gl: 'cn', hl: 'zh' },
        tr: { gl: 'tr', hl: 'tr' },
        ar: { gl: 'ae', hl: 'ar' },
        he: { gl: 'il', hl: 'he' },
        el: { gl: 'gr', hl: 'el' },
        vi: { gl: 'vn', hl: 'vi' },
        th: { gl: 'th', hl: 'th' },
        id: { gl: 'id', hl: 'id' },
        ms: { gl: 'my', hl: 'ms' },
        hi: { gl: 'in', hl: 'hi' },
    };
    return mapping[lang] || { gl: 'us', hl: 'en' };
}

export interface Supplier {
    url: string;
    explorerResult?: any;
    analystResult?: any;
    enrichmentResult?: any;
    auditorResult?: any;
    name?: string;
    country?: string;
    website?: string;
    analysis?: {
        suitabilityScore: number;
        reasoning: string;
    };
}

export interface CampaignState {
    id: string;
    status: string;
    stage: string;
    results: Supplier[];
    logs: string[];
}

// Language-specific worker result
interface LanguageWorkerResult {
    language: string;
    country: string;
    suppliersFound: number;
    errors: string[];
}

@Injectable()
export class SourcingService {
    private readonly logger = new Logger(SourcingService.name);

    // Concurrency limit for parallel URL processing within each worker
    private readonly urlLimit = pLimit(parseInt(process.env.URL_LIMIT || '10', 10));

    constructor(
        private readonly prisma: PrismaService,
        private readonly strategyAgent: StrategyAgentService,
        private readonly screenerAgent: ScreenerAgentService,
        private readonly enrichmentAgent: EnrichmentAgentService,
        private readonly auditorAgent: AuditorAgentService,
        private readonly expansionAgent: ExpansionAgentService,
        private readonly searchService: GoogleSearchService,
        private readonly scrapingService: ScrapingService,
        @Optional() private readonly sourcingGateway: SourcingGateway,
        private readonly queryCache: QueryCacheService,
        private readonly companyRegistry: CompanyRegistryService,
        private readonly emailService: EmailService,
        private readonly geminiService: GeminiService,
    ) { }

    /**
     * CRITICAL: Normalize URL to ROOT DOMAIN only.
     */
    private normalizeToRootDomain(url: string): string {
        try {
            const urlObj = new URL(url);
            return `${urlObj.protocol}//${urlObj.hostname}`;
        } catch (e) {
            return url;
        }
    }

    /**
     * Extract domain for deduplication
     */
    private extractDomain(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace(/^www\./, '');
        } catch (e) {
            return url;
        }
    }

    private async log(campaignId: string, message: string) {
        this.logger.log(`[${campaignId}] ${message}`);
        try {
            await this.prisma.log.create({
                data: { campaignId, message }
            });
        } catch (e) {
            this.logger.error(`Failed to save log: ${e.message}`);
        }
        this.sourcingGateway?.emitLog(campaignId, message);
    }

    async create(dto: CreateCampaignDto, userId?: string) {
        const campaign = await this.prisma.campaign.create({
            data: {
                name: dto.name || 'New Campaign',
                status: 'RUNNING',
                stage: 'STRATEGY',
                sequenceTemplateId: dto.sequenceTemplateId || null,
            }
        });

        // Always create an RfqRequest shell to maintain campaign-registry linkage
        await this.prisma.rfqRequest.create({
            data: {
                productName: dto.name || 'New RFQ',
                quantity: dto.searchCriteria?.quantity || 0,
                status: 'DRAFT',
                campaignId: campaign.id,
                deliveryLocationId: dto.searchCriteria?.deliveryLocationId || null,
                category: dto.searchCriteria?.category || null,
                material: dto.searchCriteria?.material || null,
                ownerId: userId || null,
                targetPrice: dto.searchCriteria?.targetPrice || null,
                currency: dto.searchCriteria?.currency || 'EUR',
                incoterms: dto.searchCriteria?.incoterms || null,
                paymentTerms: dto.searchCriteria?.paymentTerms || null,
                desiredDeliveryDate: dto.searchCriteria?.desiredDeliveryDate ? new Date(dto.searchCriteria.desiredDeliveryDate) : null,
                offerDeadline: dto.searchCriteria?.offerDeadline ? new Date(dto.searchCriteria.offerDeadline) : null,
            }
        });

        // Run async to not block request
        this.runMultimodalPipeline(campaign.id, dto).catch(async err => {
            this.logger.error(`Campaign ${campaign.id} failed`, err);
            await this.prisma.campaign.update({
                where: { id: campaign.id },
                data: { status: 'FAILED' }
            });
            await this.log(campaign.id, `Error: ${err.message}`);
            this.sourcingGateway?.emitError(campaign.id, err.message);
        });

        return { id: campaign.id, status: 'STARTED' };
    }

    async findAll(filters?: { status?: string; search?: string }, userId?: string, pagination?: { page: number; pageSize: number }) {
        const where: any = { deletedAt: null };
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.search) {
            where.name = { contains: filters.search, mode: 'insensitive' };
        }

        // Organization isolation + campaign access permissions
        if (userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { organizationId: true, campaignAccess: true, role: true },
            });
            if (user?.organizationId) {
                // "own" access: only user's own campaigns; "all"/"readonly": all org campaigns
                if (user.campaignAccess === 'own' && user.role !== 'ADMIN') {
                    where.rfqRequest = { ownerId: userId };
                } else {
                    where.rfqRequest = { owner: { organizationId: user.organizationId } };
                }
            } else {
                // User without org: only show their own campaigns
                where.rfqRequest = { ownerId: userId };
            }
        }

        const page = pagination?.page || 1;
        const pageSize = pagination?.pageSize || 50;
        const skip = (page - 1) * pageSize;

        const [campaigns, total] = await Promise.all([
            this.prisma.campaign.findMany({
                where,
                include: {
                    _count: {
                        select: { suppliers: true }
                    },
                    suppliers: {
                        select: {
                            id: true,
                            name: true,
                            country: true,
                            website: true,
                            contactEmails: true,
                            contacts: {
                                select: {
                                    name: true,
                                    role: true,
                                    email: true,
                                    phone: true
                                }
                            },
                            originLanguage: true,
                            originCountry: true
                        }
                    },
                    rfqRequest: {
                        select: {
                            id: true,
                            publicId: true,
                            productName: true,
                            status: true,
                            _count: { select: { offers: true } },
                            offers: {
                                where: { status: { in: ['PENDING', 'SUBMITTED', 'VIEWED'] } },
                                select: { id: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            this.prisma.campaign.count({ where }),
        ]);

        const data = campaigns.map(c => ({
            id: c.id,
            name: c.name,
            status: c.status,
            stage: c.stage,
            createdAt: c.createdAt,
            rfqRequestId: c.rfqRequest?.id || null,
            rfqRequest: c.rfqRequest || null,
            stats: {
                suppliersFound: c._count.suppliers,
                // Show 0 qualified suppliers while RUNNING or COMPLETED (awaiting user review)
                // Only count suppliers with emails after campaign is ACCEPTED
                suppliersContacted: (c.status === 'RUNNING' || c.status === 'COMPLETED')
                    ? 0
                    : c.suppliers.filter(s => s.contactEmails && s.contactEmails.length > 0).length,
                offersReceived: (c.rfqRequest as any)?._count?.offers || 0,
                pendingOffers: (c.rfqRequest as any)?.offers?.length || 0,
            },
            tags: [...new Set(c.suppliers.map(s => s.originCountry).filter(Boolean))]
        }));
        return { data, total, page, pageSize };
    }

    async findOne(id: string) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id },
            include: {
                suppliers: {
                    include: { contacts: true },
                    orderBy: { analysisScore: 'desc' },
                },
                logs: { orderBy: { timestamp: 'asc' } }
            }
        });

        if (!campaign) return { status: 'NOT_FOUND' };

        return {
            ...campaign,
            logs: campaign.logs.map(l => l.message),
            results: campaign.suppliers.map(s => ({
                ...s,
                analysis: {
                    suitabilityScore: s.analysisScore || 0,
                    reasoning: s.analysisReason || ''
                }
            }))
        };
    }

    async updateCampaign(id: string, data: { name?: string }) {
        return this.prisma.campaign.update({
            where: { id },
            data,
        });
    }

    async softDelete(id: string) {
        const campaign = await this.prisma.campaign.findUnique({ where: { id } });
        if (!campaign) throw new NotFoundException('Campaign not found');
        await this.prisma.campaign.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'ARCHIVED' },
        });
        return { success: true };
    }

    async exportCSV(id: string) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id },
            include: {
                suppliers: {
                    where: { deletedAt: null },
                    include: { contacts: true },
                },
            },
        });
        if (!campaign) throw new NotFoundException('Campaign not found');

        // Create Excel-friendly data rows
        const rows = campaign.suppliers.map(s => ({
            'Company Name': s.name || '',
            'Website': s.website || '',
            'Country': s.country || '',
            'City': s.city || '',
            'Contact Emails': s.contactEmails || '',
            'Analysis Score': s.analysisScore || 0,
            'Reason': s.analysisReason || '',
            'Specialization': s.specialization || '',
            'Certificates': s.certificates || '',
            'Employee Count': s.employeeCount || '',
        }));

        // Generate Excel workbook
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers');

        return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    }

    async updateStatus(id: string, status: string) {
        return this.prisma.campaign.update({
            where: { id },
            data: { status }
        });
    }

    async getLogs(campaignId: string, since?: string) {
        const whereClause: any = { campaignId };

        if (since) {
            whereClause.timestamp = {
                gt: new Date(since)
            };
        }

        const logs = await this.prisma.log.findMany({
            where: whereClause,
            orderBy: { timestamp: 'asc' },
            select: {
                message: true,
                timestamp: true
            }
        });

        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            select: {
                status: true,
                stage: true,
                _count: {
                    select: { suppliers: true }
                }
            }
        });

        // Fetch suppliers for real-time polling feed
        const suppliers = await this.prisma.supplier.findMany({
            where: { campaignId },
            include: { contacts: true },
            orderBy: { analysisScore: 'desc' },
        });

        return {
            logs: logs.map(l => ({
                message: l.message,
                timestamp: l.timestamp
            })),
            status: campaign?.status || 'UNKNOWN',
            stage: campaign?.stage || 'UNKNOWN',
            suppliersFound: campaign?._count.suppliers || 0,
            suppliers: suppliers.map(s => ({
                ...s,
                analysisScore: s.analysisScore || 0,
                analysisReason: s.analysisReason || '',
            })),
        };
    }

    /**
     * ========================================
     * PRODUCT CONTEXT ANALYSIS (Phase 0)
     * ========================================
     * Single Gemini call that analyzes product semantics to distinguish
     * companies that PRODUCE the target product from those that merely USE it.
     * Returns null on failure — pipeline proceeds without disambiguation.
     */
    private async analyzeProductContext(dto: CreateCampaignDto, cleanProductName: string): Promise<ProductContext | null> {
        try {
            const prompt = `
You are a Product Semantics Analyst. Analyze the following product request and provide disambiguation context.

PRODUCT NAME: "${cleanProductName}"
DESCRIPTION: "${dto.searchCriteria?.description || cleanProductName || ''}"
KEYWORDS: [${(dto.searchCriteria?.keywords || []).join(', ')}]
CATEGORY: "${dto.searchCriteria?.category || dto.searchCriteria?.industry || ''}"
MATERIAL: "${dto.searchCriteria?.material || ''}"

YOUR TASK:
1. Identify the CORE PRODUCT the user wants to source (not ambiguous specification attributes)
2. Identify AMBIGUOUS TERMS that could match wrong companies (e.g., "RAL 9005" is a color code used everywhere, not specific to paint)
3. Generate POSITIVE SIGNALS — keywords that indicate a company PRODUCES this product
4. Generate NEGATIVE SIGNALS — keywords that indicate a company USES this product but doesn't produce it
5. Provide a disambiguation note explaining potential confusion
6. Translate the product name for key languages (de, pl, en, fr, it, es, cs)
7. List INDUSTRY ASSOCIATIONS related to this product (international and regional)
8. List MAJOR TRADE SHOWS / EXHIBITIONS for this product category
9. List ALTERNATIVE NAMES this product goes by in the industry (synonyms, trade names)
10. Identify SUPPLY CHAIN POSITION (raw material, component, sub-assembly, finished good)

EXAMPLES:
- "farba RAL 9005" → core product is "powder paint / farba proszkowa", RAL 9005 is just a color code
  - Positive: ["paint manufacturer", "powder coating producer", "lakiernia proszkowa", "Pulverlack Hersteller"]
  - Negative: ["door manufacturer", "window frames", "roofing", "producent drzwi", "producent okien"]
  - Associations: ["European Powder Coating Association", "Stowarzyszenie Producentów Farb i Lakierów"]
  - Trade shows: ["PaintExpo", "European Coatings Show"]
  - Alternative names: ["powder paint", "thermosetting paint", "farba elektrostatyczna", "Pulverlack"]
- "śruba M8x40" → core product is "śruba / bolt / screw", M8x40 is a dimension spec
  - Positive: ["fastener manufacturer", "producent śrub", "Schraubenhersteller"]
  - Negative: ["furniture assembly", "montaż mebli"]

OUTPUT FORMAT (JSON only):
{
  "coreProduct": "the actual product being sourced (bilingual: native + English)",
  "productCategory": "broad industry category",
  "specAttributes": ["list of specification attributes that are ambiguous"],
  "positiveSignals": ["5-10 keywords indicating PRODUCER of this product, in relevant languages"],
  "negativeSignals": ["5-10 keywords indicating companies that USE but don't PRODUCE this product"],
  "disambiguationNote": "1-2 sentence explanation of why search results might be confused",
  "productTranslations": {"de": "German name", "pl": "Polish name", "en": "English name", "fr": "French name", "it": "Italian name", "es": "Spanish name", "cs": "Czech name"},
  "industryAssociations": ["3-5 relevant industry associations (international + regional)"],
  "majorTradeShows": ["3-5 major trade fairs/exhibitions for this product category"],
  "alternativeNames": ["3-7 alternative names / synonyms / trade names for this product"],
  "supplyChainPosition": "raw material | component | sub-assembly | finished good"
}
`;

            const responseText = await this.geminiService.generateContent(prompt);
            const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(jsonString);

            // Validate required fields
            if (!parsed.coreProduct || !parsed.productCategory) {
                this.logger.warn('[CONTEXT] Product context response missing required fields');
                return null;
            }

            return {
                coreProduct: parsed.coreProduct || '',
                productCategory: parsed.productCategory || '',
                specAttributes: Array.isArray(parsed.specAttributes) ? parsed.specAttributes : [],
                positiveSignals: Array.isArray(parsed.positiveSignals) ? parsed.positiveSignals : [],
                negativeSignals: Array.isArray(parsed.negativeSignals) ? parsed.negativeSignals : [],
                disambiguationNote: parsed.disambiguationNote || '',
                productTranslations: parsed.productTranslations || {},
                industryAssociations: Array.isArray(parsed.industryAssociations) ? parsed.industryAssociations : [],
                majorTradeShows: Array.isArray(parsed.majorTradeShows) ? parsed.majorTradeShows : [],
                alternativeNames: Array.isArray(parsed.alternativeNames) ? parsed.alternativeNames : [],
                supplyChainPosition: parsed.supplyChainPosition || '',
            } as ProductContext;
        } catch (e) {
            this.logger.error(`[CONTEXT] Product context analysis failed: ${e.message}`);
            return null; // Safe fallback — pipeline continues without disambiguation
        }
    }

    /**
     * ========================================
     * MULTIMODAL PARALLEL PIPELINE
     * ========================================
     * Architecture:
     * 1. Strategy Agent generates language-specific strategies
     * 2. For EACH language strategy, spawn a parallel worker
     * 3. Each worker executes FULL pipeline (Search → Explorer → Analyst → Enrichment → Auditor)
     * 4. All workers run SIMULTANEOUSLY (Promise.allSettled)
     * 5. Aggregate and deduplicate results
     */
    private async runMultimodalPipeline(id: string, dto: CreateCampaignDto) {
        const { searchCriteria } = dto;
        const processedDomains = new Set<string>(); // Global deduplication by domain
        const processedCompanyNames = new Set<string>(); // Global deduplication by company name
        let globalQualifiedCount = 0;
        const MAX_TOTAL_QUALIFIED = parseInt(process.env.MAX_TOTAL_QUALIFIED || '200', 10);
        const MAX_PER_LANGUAGE = parseInt(process.env.MAX_PER_LANGUAGE || '60', 10);

        try {
            // Extract clean product name — strip "Kampania: ..." prefix from ANY source
            const rawProductName = dto.searchCriteria?.keywords?.[0] || dto.name || '';
            const cleanProductName = rawProductName.replace(/^Kampania:\s*/i, '').trim() || rawProductName;

            // --- PHASE 0: PRODUCT CONTEXT ANALYSIS (NEW) ---
            await this.log(id, `🔬 [CONTEXT] Analyzing product semantics for: "${cleanProductName}"`);
            const productContext = await this.analyzeProductContext(dto, cleanProductName);
            if (productContext) {
                await this.log(id, `🔬 [CONTEXT] Core product: "${productContext.coreProduct}"`);
                await this.log(id, `🔬 [CONTEXT] Category: ${productContext.productCategory}`);
                await this.log(id, `🔬 [CONTEXT] Disambiguation: ${productContext.disambiguationNote}`);
                await this.log(id, `🔬 [CONTEXT] Positive signals: [${productContext.positiveSignals.join(', ')}]`);
                await this.log(id, `🔬 [CONTEXT] Negative signals: [${productContext.negativeSignals.join(', ')}]`);
            } else {
                await this.log(id, `⚠️ [CONTEXT] Product context analysis unavailable — pipeline proceeds without disambiguation`);
            }

            // --- PHASE 0.5: MARKET INTELLIGENCE ---
            let knownManufacturers: { name: string; country?: string; website?: string; size?: string }[] = [];
            try {
                await this.log(id, `[INTELLIGENCE] Identifying known manufacturers for: "${cleanProductName}"`);
                const intelligencePrompt = `
You are a Market Intelligence Analyst specializing in industrial supply chains.

TASK: Identify the TOP known manufacturers/producers of this product in the given region.

PRODUCT: ${cleanProductName}
CATEGORY: ${productContext?.productCategory || 'N/A'}
REGION: ${searchCriteria.region || 'EU'}

Return a JSON array of known manufacturers. Include:
- Global leaders that operate in this region
- Regional champions
- Niche specialists

Focus on PRODUCERS (companies that MAKE the product), NOT distributors or traders.

Return JSON:
{
  "known_manufacturers": [
    {"name": "Company Name", "country": "PL", "website": "https://example.com", "size": "large|medium|small"},
  ]
}

LIMIT: 10-20 most important manufacturers. Quality over quantity.
`;
                const intelligenceResponse = await this.geminiService.generateContent(intelligencePrompt);
                const intelligenceJson = JSON.parse(
                    intelligenceResponse.replace(/```json/g, '').replace(/```/g, '').trim()
                );
                knownManufacturers = intelligenceJson.known_manufacturers || [];
                await this.log(id, `[INTELLIGENCE] Identified ${knownManufacturers.length} known manufacturers: ${knownManufacturers.map(m => m.name).join(', ')}`);
            } catch (intelligenceErr: any) {
                await this.log(id, `[INTELLIGENCE] Market intelligence failed (non-fatal): ${intelligenceErr.message}`);
            }

            // --- PHASE 1: STRATEGY GENERATION ---
            const strategyParams = {
                productName: cleanProductName,
                description: dto.searchCriteria.description || cleanProductName || '',
                keywords: dto.searchCriteria.keywords || [],
                category: dto.searchCriteria.industry || dto.searchCriteria.category || '',
                material: dto.searchCriteria.material || '',
                region: dto.searchCriteria.region || 'EU',
                eau: dto.searchCriteria.eau || 1000,
                productContext: productContext || undefined
            };

            await this.log(id, `🎯 [STRATEGY] Generating multimodal search strategy for region: ${strategyParams.region}`);
            await this.log(id, `📊 [STRATEGY] Product: "${strategyParams.productName}", Material: ${strategyParams.material || 'N/A'}, Category: ${strategyParams.category || 'N/A'}, Keywords: [${strategyParams.keywords.join(', ')}]`);
            const strategyResult = await this.strategyAgent.execute(strategyParams);
            await this.log(id, `✅ [STRATEGY] Generated ${strategyResult.strategies?.length || 0} language-specific strategies`);
            this.sourcingGateway?.emitProgress(id, 'STRATEGY', 100);

            // Extract language strategies
            const languageStrategies = strategyResult.strategies || [];

            if (languageStrategies.length === 0) {
                await this.log(id, `[ERROR] No language strategies generated. Using fallback.`);

                // Build meaningful fallback queries from campaign data
                const keywords = dto.searchCriteria.keywords?.filter(Boolean) || [];
                const material = dto.searchCriteria.material;
                const category = dto.searchCriteria.category || dto.searchCriteria.industry;
                const description = dto.searchCriteria.description;
                const region = dto.searchCriteria.region || 'EU';

                const fallbackQueries: string[] = [];
                const negatives = ['-amazon', '-ebay', '-aliexpress', '-alibaba', '-allegro'];

                // Build queries from available data
                if (keywords.length > 0) {
                    fallbackQueries.push(`${keywords.join(' ')} manufacturer producer`);
                }
                if (material && description) {
                    fallbackQueries.push(`"${material}" "${description}" manufacturer`);
                }
                if (category) {
                    fallbackQueries.push(`${category} ${material || ''} manufacturer supplier`.trim());
                }
                if (description) {
                    fallbackQueries.push(`${description} producer manufacturer`);
                }

                // Ensure at least one query exists
                if (fallbackQueries.length === 0) {
                    fallbackQueries.push('manufacturer producer supplier');
                }

                // Add region-specific strategies
                if (region === 'PL' || region === 'EU') {
                    const plQueries = fallbackQueries.map(q => q.replace(/manufacturer/g, 'producent').replace(/producer/g, 'producent'));
                    languageStrategies.push({
                        country: 'Polska',
                        language: 'pl',
                        queries: plQueries,
                        negatives: [...negatives, '-olx', '-ceneo'],
                    });
                }

                languageStrategies.push({
                    country: 'Global',
                    language: 'en',
                    queries: fallbackQueries,
                    negatives,
                });

                await this.log(id, `[FALLBACK] Generated ${languageStrategies.length} fallback strategies with ${fallbackQueries.length} queries each`);
            }

            await this.log(id, `🔍 [SCANNING] Spawning ${languageStrategies.length} parallel language workers...`);

            // --- PHASE 2: EXECUTE LANGUAGE WORKERS IN PARALLEL ---
            const optimizedStrategies = languageStrategies;

            // Adaptive parallelism: match the number of strategies, cap at MAX_WORKER_LIMIT
            const maxWorkerLimit = parseInt(process.env.MAX_WORKER_LIMIT || '15', 10);
            const effectiveWorkers = Math.min(optimizedStrategies.length, maxWorkerLimit);
            const effectiveWorkerLimit = pLimit(effectiveWorkers);
            await this.log(id, `⚡ [SCANNING] Starting ${optimizedStrategies.length} language workers (${effectiveWorkers} parallel)...`);

            const workerPromises = optimizedStrategies.map(langStrategy =>
                effectiveWorkerLimit(() =>
                    this.executeLanguageWorker(
                        id,
                        dto,
                        langStrategy,
                        processedDomains,
                        processedCompanyNames,
                        MAX_PER_LANGUAGE,
                        () => globalQualifiedCount,
                        () => MAX_TOTAL_QUALIFIED,
                        (count: number) => { globalQualifiedCount += count; },
                        productContext || undefined
                    )
                )
            );

            const workerResults = await Promise.allSettled(workerPromises);

            // --- PHASE 2.5: EXPANSION PASS (second sweep for missed suppliers) ---
            if (globalQualifiedCount < MAX_TOTAL_QUALIFIED * 0.8) {
                await this.log(id, `[EXPANSION] Coverage at ${globalQualifiedCount}/${MAX_TOTAL_QUALIFIED} (${Math.round(globalQualifiedCount / MAX_TOTAL_QUALIFIED * 100)}%) — running expansion pass...`);
                this.sourcingGateway?.emitProgress(id, 'EXPANSION', 0);

                try {
                    // Gather top suppliers for competitor discovery
                    const topSuppliers = await this.prisma.supplier.findMany({
                        where: { campaignId: id, deletedAt: null },
                        orderBy: { analysisScore: 'desc' },
                        take: 10,
                        select: { name: true, country: true, city: true, specialization: true, website: true },
                    });

                    // Identify countries with low coverage
                    const countryCounts = new Map<string, { count: number; language: string }>();
                    for (const strategy of languageStrategies) {
                        const key = strategy.country;
                        if (!countryCounts.has(key)) {
                            countryCounts.set(key, { count: 0, language: strategy.language });
                        }
                    }
                    workerResults.forEach((result, idx) => {
                        if (result.status === 'fulfilled') {
                            const wr = result.value as LanguageWorkerResult;
                            const key = languageStrategies[idx]?.country;
                            if (key && countryCounts.has(key)) {
                                countryCounts.get(key)!.count = wr.suppliersFound;
                            }
                        }
                    });
                    const lowCoverageCountries = Array.from(countryCounts.entries())
                        .filter(([_, v]) => v.count < 3)
                        .map(([country, v]) => ({ country, language: v.language, count: v.count }));

                    const expansionResult = await this.expansionAgent.execute({
                        productContext: productContext || null,
                        topSuppliers: topSuppliers.map(s => ({
                            name: s.name || '',
                            country: s.country || '',
                            city: s.city || undefined,
                            specialization: s.specialization || undefined,
                            website: s.website || undefined,
                        })),
                        lowCoverageCountries,
                        discoveredDirectories: [],
                        region: dto.searchCriteria?.region || 'EU',
                    });

                    await this.log(id, `[EXPANSION] Generated ${expansionResult.expansion_queries.length} expansion queries`);

                    // Group expansion queries by language/country and execute through worker pipeline
                    const expansionStrategies = new Map<string, { country: string; language: string; queries: string[]; negatives: string[] }>();

                    for (const eq of expansionResult.expansion_queries) {
                        const key = `${eq.country}/${eq.language}`;
                        if (!expansionStrategies.has(key)) {
                            expansionStrategies.set(key, {
                                country: eq.country,
                                language: eq.language,
                                queries: [],
                                negatives: ['-amazon', '-ebay', '-aliexpress', '-allegro'],
                            });
                        }
                        expansionStrategies.get(key)!.queries.push(eq.query);
                    }

                    const expansionWorkerPromises = Array.from(expansionStrategies.values()).map(strategy =>
                        effectiveWorkerLimit(() =>
                            this.executeLanguageWorker(
                                id, dto, strategy,
                                processedDomains, processedCompanyNames,
                                MAX_PER_LANGUAGE,
                                () => globalQualifiedCount,
                                () => MAX_TOTAL_QUALIFIED,
                                (count: number) => { globalQualifiedCount += count; },
                                productContext || undefined
                            )
                        )
                    );

                    const expansionWorkerResults = await Promise.allSettled(expansionWorkerPromises);
                    let expansionFound = 0;
                    expansionWorkerResults.forEach(result => {
                        if (result.status === 'fulfilled') {
                            expansionFound += (result.value as LanguageWorkerResult).suppliersFound;
                        }
                    });

                    await this.log(id, `[EXPANSION] Expansion pass found ${expansionFound} additional suppliers. Total: ${globalQualifiedCount}`);
                    this.sourcingGateway?.emitProgress(id, 'EXPANSION', 100);
                } catch (expansionErr: any) {
                    await this.log(id, `[EXPANSION] Expansion pass error (non-fatal): ${expansionErr.message}`);
                }
            } else {
                await this.log(id, `[EXPANSION] Coverage at ${globalQualifiedCount}/${MAX_TOTAL_QUALIFIED} — expansion pass not needed.`);
            }

            // --- PHASE 2.7: COVERAGE CHECK — find missing known manufacturers ---
            if (knownManufacturers.length > 0) {
                try {
                    const foundSuppliers = await this.prisma.supplier.findMany({
                        where: { campaignId: id, deletedAt: null },
                        select: { name: true, website: true },
                    });

                    const foundNames = new Set(foundSuppliers.map(s => (s.name || '').toLowerCase().trim()));
                    const foundDomains = new Set(foundSuppliers.map(s => this.extractDomain(s.website || '')).filter(Boolean));

                    const missingLeaders = knownManufacturers.filter(km => {
                        const nameMatch = foundNames.has(km.name.toLowerCase().trim()) ||
                            [...foundNames].some(fn => fn.includes(km.name.toLowerCase().split(' ')[0]) || km.name.toLowerCase().includes(fn.split(' ')[0]));
                        const domainMatch = km.website ? foundDomains.has(this.extractDomain(km.website)) : false;
                        return !nameMatch && !domainMatch;
                    });

                    await this.log(id, `[COVERAGE] ${foundSuppliers.length} suppliers found, ${knownManufacturers.length} known leaders, ${missingLeaders.length} missing`);

                    if (missingLeaders.length > 0) {
                        await this.log(id, `[COVERAGE] Missing leaders: ${missingLeaders.map(m => m.name).join(', ')}`);

                        for (const leader of missingLeaders.slice(0, 10)) {
                            if (globalQualifiedCount >= MAX_TOTAL_QUALIFIED) break;

                            if (leader.website) {
                                // Direct URL — try processSupplierUrl
                                const leaderDomain = this.extractDomain(leader.website);
                                if (!processedDomains.has(leaderDomain)) {
                                    processedDomains.add(leaderDomain);
                                    await this.log(id, `[LEADER-DIRECT] Trying ${leader.name} → ${leader.website}`);
                                    const result = await this.processSupplierUrl(
                                        id, dto, leader.website, '[LEADER-DIRECT]',
                                        processedCompanyNames, 'en', leader.country || 'EU',
                                        productContext || undefined, processedDomains, 0
                                    );
                                    if (result > 0) {
                                        globalQualifiedCount += result;
                                        await this.log(id, `[LEADER-DIRECT] ${leader.name} QUALIFIED`);
                                    }
                                }
                            } else {
                                // Search for the company
                                await this.log(id, `[LEADER-SEARCH] Searching for: ${leader.name}`);
                                try {
                                    const searchResults = await this.searchService.searchExtended(
                                        `"${leader.name}" official website ${cleanProductName}`,
                                        { gl: 'us', hl: 'en' }, undefined, id
                                    );
                                    for (const sr of searchResults.slice(0, 3)) {
                                        const srDomain = this.extractDomain(sr.link);
                                        if (processedDomains.has(srDomain)) continue;
                                        processedDomains.add(srDomain);
                                        const result = await this.processSupplierUrl(
                                            id, dto, sr.link, '[LEADER-SEARCH]',
                                            processedCompanyNames, 'en', leader.country || 'EU',
                                            productContext || undefined, processedDomains, 0
                                        );
                                        if (result > 0) {
                                            globalQualifiedCount += result;
                                            await this.log(id, `[LEADER-SEARCH] ${leader.name} QUALIFIED via ${srDomain}`);
                                            break;
                                        }
                                    }
                                } catch { /* skip */ }
                            }
                        }
                    }

                    // Coverage report
                    const finalFoundCount = await this.prisma.supplier.count({ where: { campaignId: id, deletedAt: null } });
                    const coveragePercent = knownManufacturers.length > 0
                        ? Math.round((1 - missingLeaders.length / knownManufacturers.length) * 100) : 100;
                    await this.log(id, `[COVERAGE REPORT] Leaders coverage: ${coveragePercent}% (${knownManufacturers.length - missingLeaders.length}/${knownManufacturers.length}). Total suppliers: ${finalFoundCount}`);
                } catch (coverageErr: any) {
                    await this.log(id, `[COVERAGE] Coverage check failed (non-fatal): ${coverageErr.message}`);
                }
            }

            // --- PHASE 3: AGGREGATE RESULTS ---
            let totalFound = 0;
            let totalErrors = 0;
            const languageStats: string[] = [];

            // Re-count from DB for accuracy (includes expansion results)
            const finalSupplierCount = await this.prisma.supplier.count({
                where: { campaignId: id, deletedAt: null },
            });
            totalFound = finalSupplierCount;

            workerResults.forEach((result, idx) => {
                const lang = languageStrategies[idx]?.language || 'unknown';
                const country = languageStrategies[idx]?.country || 'unknown';

                if (result.status === 'fulfilled') {
                    const workerResult = result.value as LanguageWorkerResult;
                    languageStats.push(`${country}/${lang}: ${workerResult.suppliersFound} suppliers`);
                } else {
                    totalErrors++;
                    languageStats.push(`${country}/${lang}: FAILED`);
                }
            });

            await this.log(id, `[MULTIMODAL] Results: ${languageStats.join(' | ')}`);
            await this.log(id, `[ANALYSIS] Total suppliers found: ${totalFound} (including expansion pass)`);
            await this.log(id, `[COMPLETED] Pipeline finished successfully!`);

            await this.prisma.campaign.update({
                where: { id },
                data: { stage: 'COMPLETED', status: 'COMPLETED' }
            });
            this.sourcingGateway?.emitProgress(id, 'COMPLETED', 100);
            this.sourcingGateway?.emitCompleted(id);

        } catch (e: any) {
            this.logger.error(`Pipeline error: ${e.message}`);
            await this.prisma.campaign.update({
                where: { id },
                data: { status: 'ERROR' }
            });
            await this.log(id, `Error: ${e.message}`);
            this.sourcingGateway?.emitError(id, e.message);
        }
    }

    /**
     * ========================================
     * LANGUAGE WORKER
     * ========================================
     * Executes FULL pipeline for a single language/country:
     * Search → Explorer → Analyst → Enrichment → Auditor
     */
    private async executeLanguageWorker(
        campaignId: string,
        dto: CreateCampaignDto,
        langStrategy: { country: string; language: string; queries: string[]; negatives: string[] },
        globalProcessedDomains: Set<string>,
        globalProcessedCompanyNames: Set<string>, // NEW: Company name deduplication
        maxPerLanguage: number,
        getGlobalCount: () => number,
        getMaxTotal: () => number,
        incrementGlobalCount: (count: number) => void,
        productContext?: ProductContext
    ): Promise<LanguageWorkerResult> {
        const { country, language, queries, negatives } = langStrategy;
        const workerTag = `[${country.toUpperCase()}/${language.toUpperCase()}]`;

        await this.log(campaignId, `${workerTag} Worker started with ${queries.length} queries`);

        let localQualified = 0;
        let consecutiveRejects = 0;
        let totalRejects = 0;
        const MAX_CONSECUTIVE_REJECTS_PER_QUERY = parseInt(process.env.MAX_CONSECUTIVE_REJECTS || '15', 10);
        const MAX_TOTAL_REJECTS = parseInt(process.env.MAX_TOTAL_REJECTS || '50', 10);
        const errors: string[] = [];

        try {
            for (const query of queries) {
                // Reset per-query consecutive rejects (don't let one bad query kill the next good one)
                consecutiveRejects = 0;

                // Check total rejects safety net
                if (totalRejects >= MAX_TOTAL_REJECTS) {
                    await this.log(campaignId, `${workerTag} Total reject limit (${MAX_TOTAL_REJECTS}) reached. Stopping worker.`);
                    break;
                }

                // Check global limit
                if (getGlobalCount() >= getMaxTotal()) {
                    await this.log(campaignId, `${workerTag} Global limit reached. Stopping.`);
                    break;
                }
                if (localQualified >= maxPerLanguage) {
                    await this.log(campaignId, `${workerTag} Language limit (${maxPerLanguage}) reached.`);
                    break;
                }

                // Build query with negatives
                const fullQuery = `${query} ${negatives.join(' ')}`;

                // --- SEARCH ---
                let urls: string[] = [];
                const cachedResults = await this.queryCache.getCachedResults(query);

                if (cachedResults) {
                    urls = cachedResults.map(r => r.link);
                    await this.log(campaignId, `${workerTag} [CACHE] "${query.substring(0, 25)}..." (${urls.length} URLs)`);
                } else {
                    // Check search budget before making API call
                    const remaining = this.searchService.getRemainingBudget(campaignId, 'main');
                    if (remaining <= 0) {
                        await this.log(campaignId, `${workerTag} [BUDGET] Search budget exhausted. Stopping.`);
                        break;
                    }
                    const locale = languageToGoogleLocale(language);
                    await this.log(campaignId, `${workerTag} [SEARCH] "${query.substring(0, 25)}..." (budget: ${remaining}, locale: ${locale.gl}${language === 'en' ? '+us' : ''})`);

                    // For English: search BOTH US and UK markets for maximum coverage
                    let rawResults: { title: string; link: string; snippet: string }[];
                    if (language === 'en') {
                        const [usResults, gbResults] = await Promise.all([
                            this.searchService.searchExtended(fullQuery, { gl: 'us', hl: 'en' }, undefined, campaignId),
                            this.searchService.searchExtended(fullQuery, { gl: 'gb', hl: 'en' }, undefined, campaignId),
                        ]);
                        const seen = new Set<string>();
                        rawResults = [];
                        for (const r of [...usResults, ...gbResults]) {
                            if (!seen.has(r.link)) { seen.add(r.link); rawResults.push(r); }
                        }
                    } else {
                        rawResults = await this.searchService.searchExtended(fullQuery, locale, undefined, campaignId);
                    }
                    urls = rawResults.map(r => r.link);

                    if (rawResults.length > 0) {
                        await this.queryCache.cacheResults(query, rawResults);
                    }
                }

                // --- PROCESS URLs IN PARALLEL (concurrency limited to 3) ---
                // Pre-filter: deduplicate and check limits before spawning parallel work
                const urlsToProcess: string[] = [];
                for (const url of urls) {
                    if (getGlobalCount() + urlsToProcess.length >= getMaxTotal()) break;
                    if (localQualified + urlsToProcess.length >= maxPerLanguage) break;

                    const domain = this.extractDomain(url);
                    if (globalProcessedDomains.has(domain)) continue;
                    globalProcessedDomains.add(domain);
                    urlsToProcess.push(url);
                }

                const urlResults = await Promise.allSettled(
                    urlsToProcess.map(url =>
                        this.urlLimit(async () => {
                            // Re-check limits (may have changed during parallel execution)
                            if (getGlobalCount() >= getMaxTotal() || localQualified >= maxPerLanguage) {
                                return 0;
                            }
                            return this.processSupplierUrl(
                                campaignId,
                                dto,
                                url,
                                workerTag,
                                globalProcessedCompanyNames,
                                language,
                                country,
                                productContext,
                                globalProcessedDomains,
                                0
                            );
                        })
                    )
                );

                for (const result of urlResults) {
                    if (result.status === 'fulfilled' && (result.value as number) > 0) {
                        const count = result.value as number;
                        localQualified += count;
                        incrementGlobalCount(count);
                        consecutiveRejects = 0; // reset on success
                        totalRejects = 0; // reset total on any success
                    } else {
                        consecutiveRejects++;
                        totalRejects++;
                        if (result.status === 'rejected') {
                            errors.push(result.reason?.message || 'Unknown error');
                        }
                    }
                }

                // Smart termination: stop this query if too many consecutive rejects
                if (consecutiveRejects >= MAX_CONSECUTIVE_REJECTS_PER_QUERY) {
                    await this.log(campaignId, `${workerTag} Diminishing returns for current query (${consecutiveRejects} consecutive rejects). Moving to next query.`);
                    continue; // Move to next query instead of killing the entire worker
                }
            }

            await this.log(campaignId, `${workerTag} Worker completed. Found ${localQualified} suppliers.`);

            return {
                language,
                country,
                suppliersFound: localQualified,
                errors
            };

        } catch (e: any) {
            await this.log(campaignId, `${workerTag} Worker error: ${e.message}`);
            return {
                language,
                country,
                suppliersFound: localQualified,
                errors: [...errors, e.message]
            };
        }
    }

    /**
     * ========================================
     * PROCESS SINGLE SUPPLIER URL
     * ========================================
     * Full A-Z pipeline for one URL:
     * Explorer → Analyst → Enrichment → Auditor → Save
     */
    private async processSupplierUrl(
        campaignId: string,
        dto: CreateCampaignDto,
        url: string,
        workerTag: string,
        processedCompanyNames: Set<string>,
        originLanguage: string,
        originCountry: string,
        productContext?: ProductContext,
        globalProcessedDomains?: Set<string>,
        depth: number = 0
    ): Promise<number> {
        try {
            const domain = this.extractDomain(url);

            // BLACKLIST CHECK — must happen before ANY processing
            if (await this.companyRegistry.isBlacklisted(domain)) {
                await this.log(campaignId, `${workerTag} [BLACKLISTED] ${domain} — skipping`);
                return 0;
            }

            // SHOP CHECK — known marketplaces/e-commerce, hard-reject
            const cleanDomain = domain.replace(/^www\./, '').toLowerCase();
            if (SHOP_DOMAINS.has(domain) || SHOP_DOMAINS.has(cleanDomain)) {
                await this.log(campaignId, `${workerTag} SHOP REJECTED: ${domain}`);
                return 0;
            }

            // PORTAL CHECK — portals are not suppliers, force directory mining
            if (isPortalDomain(domain)) {
                await this.log(campaignId, `${workerTag} [PORTAL] ${domain} — forcing directory mining`);
                const content = await this.scrapingService.fetchContent(url);
                const screenerResult = await this.screenerAgent.execute(url, content, dto, productContext);
                const mentionedCompanies = screenerResult.mentioned_companies || [];
                if (depth === 0 && mentionedCompanies.length > 0) {
                    await this.log(campaignId, `${workerTag} [PORTAL] ${domain} → ${mentionedCompanies.length} companies to mine`);
                    let mined = 0;
                    for (const company of mentionedCompanies) {
                        if (!company.url) continue;
                        const companyDomain = this.extractDomain(company.url);
                        if (globalProcessedDomains?.has(companyDomain)) continue;
                        globalProcessedDomains?.add(companyDomain);
                        const result = await this.processSupplierUrl(
                            campaignId, dto, company.url, workerTag,
                            processedCompanyNames, originLanguage, originCountry,
                            productContext, globalProcessedDomains, 1
                        );
                        mined += result;
                    }
                    return mined;
                }
                return 0;
            }

            // 0. CHECK GLOBAL REGISTRY CACHE FIRST!
            const cachedSupplier = await this.companyRegistry.getByDomain(domain);

            if (cachedSupplier && !this.companyRegistry.isStale(cachedSupplier.lastProcessedAt)) {
                await this.log(campaignId, `${workerTag} [CACHE HIT] ${cachedSupplier.name || domain} - reusing cached data`);

                // Use cached data directly - skip expensive agents!
                const enrichedData = {
                    company_name: cachedSupplier.name,
                    website: `https://${cachedSupplier.domain}`,
                    country: normalizeCountry(cachedSupplier.country),
                    city: cachedSupplier.city,
                    specialization: cachedSupplier.specialization,
                    certificates: cachedSupplier.certificates,
                    employee_count: cachedSupplier.employeeCount,
                    contact_emails: cachedSupplier.contactEmails?.split(',').map(e => e.trim()).filter(Boolean) || []
                };

                // Skip to validation and save (bypass agents)
                const cached = await this.saveSupplierFromCache(
                    campaignId,
                    workerTag,
                    cachedSupplier,
                    enrichedData,
                    dto,
                    processedCompanyNames,
                    originLanguage,
                    originCountry
                );
                return cached ? 1 : 0;
            }

            // 1. SCREENER (merged Explorer + Analyst — single Gemini call)
            await this.log(campaignId, `${workerTag} Screening: ${domain}`);
            this.sourcingGateway?.emitSupplierUpdate(campaignId, { url, status: 'SCREENING' });

            const content = await this.scrapingService.fetchContent(url);
            const screenerResult = await this.screenerAgent.execute(url, content, dto, productContext);

            if (!screenerResult.is_relevant) {
                // DIRECTORY MINING: extract leads from industry portals
                const mentionedCompanies = screenerResult.mentioned_companies || [];
                if (depth === 0
                    && screenerResult.page_type === 'Directory'
                    && mentionedCompanies.length > 0
                ) {
                    await this.log(campaignId, `${workerTag} [DIRECTORY] ${domain} → ${mentionedCompanies.length} mentioned companies`);

                    let directoryQualified = 0;
                    for (const company of mentionedCompanies) {
                        if (!company.url) continue;

                        const companyDomain = this.extractDomain(company.url);
                        if (globalProcessedDomains?.has(companyDomain)) continue;
                        globalProcessedDomains?.add(companyDomain);

                        await this.log(campaignId, `${workerTag} [DIRECTORY] Following lead: ${company.name} → ${companyDomain}`);
                        const result = await this.processSupplierUrl(
                            campaignId, dto, company.url, workerTag,
                            processedCompanyNames, originLanguage, originCountry,
                            productContext, globalProcessedDomains, 1
                        );
                        directoryQualified += result;
                    }
                    return directoryQualified;
                }

                await this.log(campaignId, `${workerTag} Skipped: Not relevant (${screenerResult.page_type})`);
                return 0;
            }

            const capScore = screenerResult.capability_match_score || 0;
            let isBorderline = false;

            if (capScore < 35) {
                // HARD REJECT — clearly irrelevant, but still mine directory leads
                const mentionedFromLowScore = screenerResult.mentioned_companies || [];
                if (depth === 0 && mentionedFromLowScore.length > 0) {
                    await this.log(campaignId, `${workerTag} [DIRECTORY] Low-score page ${domain} (${capScore}%) has ${mentionedFromLowScore.length} leads — mining before rejecting`);
                    let mined = 0;
                    for (const company of mentionedFromLowScore) {
                        if (!company.url) continue;
                        const companyDomain = this.extractDomain(company.url);
                        if (globalProcessedDomains?.has(companyDomain)) continue;
                        globalProcessedDomains?.add(companyDomain);
                        await this.log(campaignId, `${workerTag} [DIRECTORY] Following lead: ${company.name} → ${companyDomain}`);
                        const result = await this.processSupplierUrl(
                            campaignId, dto, company.url, workerTag,
                            processedCompanyNames, originLanguage, originCountry,
                            productContext, globalProcessedDomains, 1
                        );
                        mined += result;
                    }
                    return mined;
                }

                await this.log(campaignId, `${workerTag} Skipped: Low match (${capScore}%)`);
                return 0;
            }

            if (capScore < 60) {
                // BORDERLINE (35-59) — proceed to enrichment, but apply stricter auditing
                await this.log(campaignId, `${workerTag} BORDERLINE (${capScore}%) — running enrichment for verification: ${domain}`);
                isBorderline = true;

                // Still mine directory leads from borderline pages
                const mentionedFromBorderline = screenerResult.mentioned_companies || [];
                if (depth === 0 && mentionedFromBorderline.length > 0) {
                    await this.log(campaignId, `${workerTag} [DIRECTORY] Borderline page ${domain} has ${mentionedFromBorderline.length} leads — mining in parallel`);
                    for (const company of mentionedFromBorderline) {
                        if (!company.url) continue;
                        const companyDomain = this.extractDomain(company.url);
                        if (globalProcessedDomains?.has(companyDomain)) continue;
                        globalProcessedDomains?.add(companyDomain);
                        // Fire-and-forget directory mining (don't block borderline processing)
                        this.processSupplierUrl(
                            campaignId, dto, company.url, workerTag,
                            processedCompanyNames, originLanguage, originCountry,
                            productContext, globalProcessedDomains, 1
                        ).catch(() => {});
                    }
                }
            }

            // 1.5. COMPANY TYPE CLASSIFICATION — hard filter
            const allowedTypes = dto.searchCriteria?.supplierTypes || ['PRODUCENT'];
            const companyType = screenerResult.company_type || 'NIEJASNY';

            if (companyType === 'HANDLOWIEC' && !allowedTypes.includes('HANDLOWIEC')) {
                await this.log(campaignId, `${workerTag} HANDLOWIEC ODRZUCONY: "${screenerResult.extracted_data?.company_name || domain}"`);
                return 0;
            }

            // 1.6. DEEP RESEARCH — when classification is unclear, scrape subpages for more evidence
            if (companyType === 'NIEJASNY' || (screenerResult.company_type_confidence || 0) < 60) {
                await this.log(campaignId, `${workerTag} DEEP RESEARCH: ${domain} (type=${companyType}, conf=${screenerResult.company_type_confidence})`);

                const deepResearchPaths = ['/o-nas', '/about', '/about-us', '/o-firmie',
                    '/produkty', '/products', '/oferta', '/ueber-uns', '/kontakt', '/impressum'];

                let combinedContent = content;
                let pagesChecked = 0;

                for (const path of deepResearchPaths) {
                    if (pagesChecked >= 3) break;
                    try {
                        const subpageUrl = new URL(path, url).toString();
                        const subContent = await this.scrapingService.fetchContent(subpageUrl);
                        if (subContent && !subContent.startsWith('Error') && subContent.length > 100) {
                            combinedContent += '\n\n--- PODSTRONA: ' + path + ' ---\n' + subContent;
                            pagesChecked++;
                        }
                    } catch { /* skip */ }
                }

                if (pagesChecked > 0) {
                    const deepResult = await this.screenerAgent.execute(url, combinedContent, dto, productContext);
                    if (deepResult.company_type !== 'NIEJASNY' ||
                        (deepResult.company_type_confidence || 0) > (screenerResult.company_type_confidence || 0)) {
                        Object.assign(screenerResult, deepResult);
                    }

                    // Re-check company type after deep research
                    const deepCompanyType = screenerResult.company_type || 'NIEJASNY';
                    if (deepCompanyType === 'HANDLOWIEC' && !allowedTypes.includes('HANDLOWIEC')) {
                        await this.log(campaignId, `${workerTag} DEEP RESEARCH -> HANDLOWIEC ODRZUCONY: ${domain}`);
                        return 0;
                    }
                }
            }

            // 2. ENRICHMENT (skip Gemini call for high-confidence results — screener data is sufficient)
            let enrichmentResult;
            const currentCompanyType = screenerResult.company_type || 'NIEJASNY';
            if (capScore >= 80 && screenerResult.extracted_data?.country && currentCompanyType !== 'NIEJASNY') {
                const displayDomain = this.extractDomain(url);
                const screenerEmail = screenerResult.extracted_data?.email;
                enrichmentResult = {
                    enriched_data: {
                        ...screenerResult.extracted_data,
                        website: this.normalizeToRootDomain(url),
                        domain_display: displayDomain,
                        contact_emails: screenerEmail ? [screenerEmail] : [],
                    },
                    verification: {
                        is_verified_manufacturer: currentCompanyType === 'PRODUCENT',
                        has_contact_email: !!screenerEmail,
                        confidence_score: capScore,
                    },
                };
                await this.log(campaignId, `${workerTag} FAST TRACK (${capScore}%): ${domain} [${currentCompanyType}] — skipping enrichment`);
            } else {
                this.sourcingGateway?.emitSupplierUpdate(campaignId, { url, status: 'ENRICHING' });
                enrichmentResult = await this.enrichmentAgent.execute(screenerResult.extracted_data || {}, url);
            }

            // 3. AUDITOR - STRICT VALIDATION
            this.sourcingGateway?.emitSupplierUpdate(campaignId, { url, status: 'VERIFYING' });
            const enrichedData = enrichmentResult.enriched_data || screenerResult.extracted_data;
            const registryData = {
                name: enrichedData.company_name || 'Unknown',
                status: 'Active',
                company_type: screenerResult.company_type || 'NIEJASNY',
            };
            const auditorResult = await this.auditorAgent.execute(enrichedData, registryData);

            // CRITICAL: Filter out rejected records
            if (auditorResult.validation_result === 'REJECTED' || auditorResult.is_valid === false) {
                await this.log(campaignId, `${workerTag} REJECTED: ${auditorResult.rejection_reason || 'Validation failed'}`);
                return 0;
            }

            // BORDERLINE suppliers need higher auditor confidence to pass
            if (isBorderline && (auditorResult.confidence_score || 0) < 0.7) {
                await this.log(campaignId, `${workerTag} BORDERLINE REJECTED: Low auditor confidence (${auditorResult.confidence_score}) for borderline supplier ${domain}`);
                return 0;
            }

            // 3.05. AUDITOR RECLASSIFICATION — auditor may override screener's company_type
            const verifiedType = auditorResult?.golden_record?.verified_company_type;
            if (verifiedType && verifiedType !== 'NIEJASNY' && verifiedType !== currentCompanyType) {
                await this.log(campaignId, `${workerTag} AUDITOR REKLASYFIKACJA: ${domain} ${currentCompanyType}->${verifiedType}`);
                if (!allowedTypes.includes(verifiedType)) {
                    await this.log(campaignId, `${workerTag} AUDITOR REKLASYFIKACJA -> ODRZUCONY: ${domain} (${verifiedType})`);
                    return 0;
                }
            }

            // 3.1. COUNTRY EXCLUSION — hard filter based on region config
            const regionKey = dto.searchCriteria?.region;
            const regionConfig = regionKey ? REGION_LANGUAGE_CONFIG[regionKey] : undefined;
            if (regionConfig?.excludedCountries) {
                const supplierCountry = normalizeCountry(
                    enrichmentResult?.enriched_data?.country || screenerResult.extracted_data?.country || ''
                );
                const excluded = regionConfig.excludedCountries.some(
                    (ex: string) => supplierCountry.toLowerCase().includes(ex.toLowerCase())
                );
                if (excluded) {
                    await this.log(campaignId, `${workerTag} EXCLUDED COUNTRY: "${enrichedData.company_name}" from ${supplierCountry}`);
                    return 0;
                }
            }

            // 3.2. EMPLOYEE SIZE FILTER — skip mega-corporations
            const employeeStr = enrichmentResult?.enriched_data?.employee_count
                || screenerResult.extracted_data?.employee_count;
            const employeeCount = parseEmployeeCount(employeeStr);
            if (employeeCount !== null && employeeCount > MAX_EMPLOYEE_COUNT) {
                await this.log(campaignId, `${workerTag} TOO LARGE: "${enrichedData.company_name}" (${employeeStr} employees)`);
                return 0;
            }

            // 3.5. EMAIL — collect if available, but don't reject without it
            const emailArray = enrichedData.contact_emails || [];

            // 3.6. COMPANY NAME DEDUPLICATION CHECK (fuzzy — strips legal suffixes)
            const companyName = enrichedData.company_name || screenerResult.extracted_data?.company_name || '';
            const normalizedCompanyName = normalizeCompanyNameForDedup(companyName);

            if (normalizedCompanyName && normalizedCompanyName.length > 2) {
                if (processedCompanyNames.has(normalizedCompanyName)) {
                    await this.log(campaignId, `${workerTag} DUPLICATE: Company "${companyName}" already processed (fuzzy match)`);
                    return 0;
                }
                processedCompanyNames.add(normalizedCompanyName);
            }

            // 4. SAVE (only approved, non-duplicate records with email)
            const capabilityScore = screenerResult.capability_match_score || 50;
            const trustScore = enrichmentResult.verification?.confidence_score || 50;
            const finalScore = Math.round((capabilityScore * 0.6) + (trustScore * 0.4));

            // Use enriched website (discovered real domain) instead of original URL
            const finalWebsite = enrichedData.website || this.normalizeToRootDomain(url);

            // If finalWebsite is still a portal domain, skip (directory-mined without real URL)
            if (isPortalDomain(this.extractDomain(finalWebsite))) {
                await this.log(campaignId, `${workerTag} SKIPPED: "${enrichedData.company_name}" has portal URL only (${finalWebsite})`);
                return 0;
            }

            const contactEmailsString = emailArray.join(', ');

            // 4.1. UPDATE/CREATE GLOBAL REGISTRY ENTRY FIRST (to get ID)
            const supplierDomain = this.extractDomain(finalWebsite);
            const registryEntry = await this.companyRegistry.upsert(supplierDomain, {
                name: enrichedData.company_name || screenerResult.extracted_data?.company_name || 'Unknown',
                country: normalizeCountry(enrichmentResult?.enriched_data?.country || screenerResult.extracted_data?.country || 'Europe'),
                city: enrichmentResult?.enriched_data?.city || screenerResult.extracted_data?.city || null,
                specialization: enrichmentResult?.enriched_data?.specialization || screenerResult.extracted_data?.specialization || 'General',
                certificates: Array.isArray(enrichedData.certificates) ? enrichedData.certificates.join(', ') : (enrichedData.certificates || ''),
                employeeCount: enrichmentResult?.enriched_data?.employee_count || screenerResult.extracted_data?.employee_count || 'N/A',
                contactEmails: contactEmailsString,
                explorerResult: screenerResult,
                analystResult: screenerResult,
                enrichmentResult: enrichmentResult,
                auditorResult: auditorResult,
                lastAnalysisScore: finalScore / 10
            }, campaignId);

            const newSupplier = await this.prisma.supplier.create({
                data: {
                    campaignId: campaignId,
                    url: finalWebsite,
                    name: enrichedData.company_name || screenerResult.extracted_data?.company_name || 'Unknown Company',
                    country: normalizeCountry(enrichmentResult?.enriched_data?.country || screenerResult.extracted_data?.country || 'Europe'),
                    city: enrichmentResult?.enriched_data?.city || screenerResult.extracted_data?.city || null,
                    website: finalWebsite,
                    specialization: enrichmentResult?.enriched_data?.specialization || screenerResult.extracted_data?.specialization || 'General',
                    certificates: Array.isArray(enrichedData.certificates) ? enrichedData.certificates.join(', ') : (enrichedData.certificates || ''),
                    employeeCount: enrichmentResult?.enriched_data?.employee_count || screenerResult.extracted_data?.employee_count || 'N/A',
                    contactEmails: contactEmailsString,
                    explorerResult: JSON.stringify(screenerResult),
                    analystResult: JSON.stringify(screenerResult),
                    enrichmentResult: JSON.stringify(enrichmentResult),
                    auditorResult: JSON.stringify(auditorResult),
                    analysisScore: finalScore / 10,

                    analysisReason: enrichmentResult.verification?.verification_notes || screenerResult.match_reason,
                    originLanguage: originLanguage,
                    originCountry: originCountry,
                    sourceAgent: 'ParallelPipeline',

                    // Company Classification
                    companyType: verifiedType || screenerResult.company_type || 'NIEJASNY',
                    companyTypeConfidence: screenerResult.company_type_confidence || 0,
                    needsManualClassification: ((screenerResult.company_type || 'NIEJASNY') === 'NIEJASNY' && (screenerResult.company_type_confidence || 0) < 60),
                    sourceType: workerTag.includes('LEADER') ? (workerTag.includes('DIRECT') ? 'LEADER_DIRECT' : 'LEADER_SEARCH') : 'SEARCH',

                    // Link to Global Registry
                    registryId: registryEntry.id,

                    // CREATE STRUCTURED CONTACTS
                    contacts: {
                        create: emailArray.map((email: string) => ({
                            email: email,
                            role: 'Discovered Contact',
                            isDecisionMaker: false
                        }))
                    }
                }
            });

            await this.log(campaignId, `${workerTag} QUALIFIED: ${newSupplier.name} (${finalScore}%) | Emails: ${emailArray.length}`);
            this.sourcingGateway?.emitSupplierUpdate(campaignId, { url, status: 'QUALIFIED', data: newSupplier });

            return 1;

        } catch (err: any) {
            await this.log(campaignId, `${workerTag} Error processing ${url}: ${err.message}`);
            return 0;
        }
    }

    /**
     * Save supplier from CACHE (skip agents, use cached data)
     */
    private async saveSupplierFromCache(
        campaignId: string,
        workerTag: string,
        cachedSupplier: any,
        enrichedData: any,
        dto: CreateCampaignDto,
        processedCompanyNames: Set<string>,
        originLanguage: string,
        originCountry: string
    ): Promise<boolean> {
        try {
            // Company name deduplication
            const companyName = enrichedData.company_name || '';
            const normalizedCompanyName = companyName.toLowerCase().trim();

            if (normalizedCompanyName && processedCompanyNames.has(normalizedCompanyName)) {
                await this.log(campaignId, `${workerTag} DUPLICATE: Company "${companyName}" already processed`);
                return false;
            }
            if (normalizedCompanyName) {
                processedCompanyNames.add(normalizedCompanyName);
            }

            // COUNTRY EXCLUSION — same filter as fresh pipeline
            const supplierCountry = normalizeCountry(enrichedData.country || '');
            const regionKey = dto?.searchCriteria?.region;
            const regionConfig = regionKey ? REGION_LANGUAGE_CONFIG[regionKey] : undefined;
            if (regionConfig?.excludedCountries) {
                const excluded = regionConfig.excludedCountries.some(
                    (ex: string) => supplierCountry.toLowerCase().includes(ex.toLowerCase())
                );
                if (excluded) {
                    await this.log(campaignId, `${workerTag} CACHE EXCLUDED COUNTRY: "${companyName}" from ${supplierCountry}`);
                    return false;
                }
            }

            // EMPLOYEE SIZE FILTER — same as fresh pipeline
            const employeeCount = parseEmployeeCount(enrichedData.employee_count);
            if (employeeCount !== null && employeeCount > MAX_EMPLOYEE_COUNT) {
                await this.log(campaignId, `${workerTag} CACHE TOO LARGE: "${companyName}" (${enrichedData.employee_count})`);
                return false;
            }

            // PORTAL URL GUARD — same as fresh pipeline
            if (isPortalDomain(this.extractDomain(enrichedData.website || ''))) {
                await this.log(campaignId, `${workerTag} CACHE PORTAL URL: "${companyName}" — skipping`);
                return false;
            }

            const contactEmails = enrichedData.contact_emails || [];
            const contactEmailsString = Array.isArray(contactEmails) ? contactEmails.join(', ') : contactEmails;
            const finalScore = (cachedSupplier.lastAnalysisScore || 5) * 10;

            // Increment usage in registry (and ensure it exists/get ID)
            const registryEntry = await this.companyRegistry.upsert(cachedSupplier.domain, {}, campaignId);

            // Save to campaign suppliers
            const newSupplier = await this.prisma.supplier.create({
                data: {
                    campaignId: campaignId,
                    url: enrichedData.website,
                    name: enrichedData.company_name || 'Unknown Company',
                    country: normalizeCountry(enrichedData.country || 'Unknown'),
                    city: enrichedData.city || null,
                    website: enrichedData.website,
                    specialization: enrichedData.specialization || 'General',
                    certificates: enrichedData.certificates || '',
                    employeeCount: enrichedData.employee_count || 'N/A',
                    contactEmails: contactEmailsString,
                    explorerResult: JSON.stringify(cachedSupplier.explorerResult || {}),
                    analystResult: JSON.stringify(cachedSupplier.analystResult || {}),
                    enrichmentResult: JSON.stringify(cachedSupplier.enrichmentResult || {}),
                    auditorResult: JSON.stringify(cachedSupplier.auditorResult || {}),
                    analysisScore: finalScore / 10,

                    analysisReason: 'Data from Global Registry Cache',
                    originLanguage: originLanguage,
                    originCountry: originCountry,
                    sourceAgent: 'Cache/MultimodalWorker',

                    // Company Classification (from cache — best effort)
                    companyType: cachedSupplier.explorerResult?.company_type || 'NIEJASNY',
                    companyTypeConfidence: cachedSupplier.explorerResult?.company_type_confidence || 0,
                    needsManualClassification: false,
                    sourceType: 'SEARCH',

                    // Link to Global Registry
                    registryId: registryEntry.id,

                    // CREATE STRUCTURED CONTACTS FROM CACHE
                    contacts: {
                        create: Array.isArray(contactEmails) ? contactEmails.map((email: string) => ({
                            email: email,
                            role: 'Cached Contact',
                            isDecisionMaker: false
                        })) : []
                    }
                }
            });

            return true;
        } catch (err: any) {
            await this.log(campaignId, `${workerTag} Error saving cached supplier: ${err.message}`);
            return false;
        }
    }

    /**
     * Accept campaign: qualify suppliers, create Offers, send INITIAL sequence step.
     */
    async acceptCampaign(campaignId: string, excludedSupplierIds: string[]) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                suppliers: { include: { contacts: true } },
                sequenceTemplate: {
                    include: { steps: { orderBy: { dayOffset: 'asc' as const } } },
                },
                rfqRequest: {
                    include: {
                        owner: { include: { organization: true } },
                    },
                },
            },
        });

        if (!campaign) throw new NotFoundException('Campaign not found');
        if (campaign.status !== 'COMPLETED') {
            throw new Error(`Campaign status must be COMPLETED, got: ${campaign.status}`);
        }

        // 1. Soft-delete excluded suppliers
        if (excludedSupplierIds.length > 0) {
            await this.prisma.supplier.updateMany({
                where: { id: { in: excludedSupplierIds }, campaignId },
                data: { deletedAt: new Date() },
            });
        }

        // 2. Get qualified (non-excluded) suppliers
        const qualifiedSuppliers = campaign.suppliers.filter(
            s => !excludedSupplierIds.includes(s.id) && !s.deletedAt,
        );

        this.logger.log(`[ACCEPT] Campaign ${campaignId}: ${qualifiedSuppliers.length} qualified, ${excludedSupplierIds.length} excluded`);

        // 3. Update campaign status
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'ACCEPTED' },
        });

        // 4. Create Offers for each qualified supplier
        const rfqRequestId = campaign.rfqRequest?.id;
        if (!rfqRequestId) {
            this.logger.warn(`[ACCEPT] Campaign ${campaignId} has no rfqRequest — skipping offer creation`);
            return { qualified: qualifiedSuppliers.length, excluded: excludedSupplierIds.length, offersSent: 0 };
        }

        let emailsSent = 0;
        const initialStep = campaign.sequenceTemplate?.steps?.[0]; // dayOffset=0

        for (const supplier of qualifiedSuppliers) {
            // Create Offer
            const offer = await this.prisma.offer.create({
                data: {
                    rfqRequestId,
                    supplierId: supplier.id,
                    status: 'PENDING',
                },
            });

            // Send INITIAL email if sequence template exists
            if (initialStep && campaign.sequenceTemplate) {
                const emails = this.getSupplierEmails(supplier);
                if (emails.length > 0) {
                    try {
                        let subject = this.resolveTemplateVars(
                            initialStep.subject,
                            campaign.rfqRequest!,
                            supplier,
                        );
                        let body = this.resolveTemplateVars(
                            initialStep.bodySnippet,
                            campaign.rfqRequest!,
                            supplier,
                        );

                        // Translate email to supplier's language
                        const targetLang = getLanguageForCountry(supplier.country);
                        let ctaText = 'Złóż ofertę';
                        if (targetLang.code !== 'pl') {
                            this.logger.log(`[ACCEPT] Translating email to ${targetLang.name} for ${supplier.name} (${supplier.country})`);
                            const translated = await this.translateEmail(subject, body, targetLang);
                            subject = translated.subject;
                            body = translated.body;
                            ctaText = translated.ctaText;
                        }

                        const org = campaign.rfqRequest?.owner?.organization;
                        const footerHtml = org ? this.buildAcceptFooterHtml(org) : '';
                        const portalUrl = `${process.env.FRONTEND_URL || 'https://app.procurea.pl'}/offers/${offer.accessToken}`;
                        const recipientEmail = emails[0];

                        const html = `
                            <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #4F46E5; margin: 0; font-size: 28px;">Procurea</h1>
                                </div>
                                <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                                    <p style="color: #475569; line-height: 1.6; white-space: pre-line;">${body}</p>
                                    <div style="text-align: center; margin: 24px 0;">
                                        <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                            ${ctaText}
                                        </a>
                                    </div>
                                </div>
                                ${footerHtml}
                            </div>
                        `;

                        const sent = await this.emailService.sendEmail({
                            to: recipientEmail,
                            subject,
                            html,
                        });

                        if (sent) {
                            await this.prisma.sequenceExecution.create({
                                data: { offerId: offer.id, stepId: initialStep.id, recipientEmail, status: 'SENT' },
                            });
                            emailsSent++;
                        } else {
                            await this.prisma.sequenceExecution.create({
                                data: { offerId: offer.id, stepId: initialStep.id, recipientEmail, status: 'FAILED' },
                            });
                        }
                    } catch (err: any) {
                        this.logger.error(`[ACCEPT] Failed to send INITIAL to ${supplier.name}: ${err.message}`);
                        await this.prisma.sequenceExecution.create({
                            data: { offerId: offer.id, stepId: initialStep.id, recipientEmail: emails[0], status: 'FAILED' },
                        });
                    }
                }
            }
        }

        // 5. Update status to SENDING
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'SENDING' },
        });

        this.logger.log(`[ACCEPT] Campaign ${campaignId}: ${emailsSent} initial emails sent`);

        return {
            qualified: qualifiedSuppliers.length,
            excluded: excludedSupplierIds.length,
            offersSent: emailsSent,
        };
    }

    private getSupplierEmails(supplier: any): string[] {
        const contactEmails = supplier.contacts
            ?.map((c: any) => c.email)
            .filter(Boolean) || [];
        if (contactEmails.length > 0) return contactEmails;

        if (supplier.contactEmails) {
            return supplier.contactEmails.split(',').map((e: string) => e.trim()).filter(Boolean);
        }
        return [];
    }

    private resolveTemplateVars(template: string, rfq: any, supplier: any): string {
        const owner = rfq.owner;
        const org = owner?.organization;
        return template
            .replace(/\{\{Product_Name\}\}/g, rfq.productName || '')
            .replace(/\{\{Supplier_Name\}\}/g, supplier.name || '')
            .replace(/\{\{Sender_Name\}\}/g, owner?.name || '')
            .replace(/\{\{Sender_Company\}\}/g, org?.name || '')
            .replace(/\{\{Quantity\}\}/g, String(rfq.quantity || ''))
            .replace(/\{\{Currency\}\}/g, rfq.currency || 'EUR');
    }

    private buildAcceptFooterHtml(org: any): string {
        if (!org.footerEnabled) return '';
        const lines: string[] = [];
        if (org.footerFirstName || org.footerLastName) {
            lines.push(`${org.footerFirstName || ''} ${org.footerLastName || ''}`.trim());
        }
        if (org.footerPosition) lines.push(org.footerPosition);
        if (org.footerCompany) lines.push(org.footerCompany);
        if (org.footerEmail) lines.push(org.footerEmail);
        if (org.footerPhone) lines.push(org.footerPhone);
        if (lines.length === 0) return '';
        return `<div style="border-top: 1px solid #E2E8F0; margin-top: 24px; padding-top: 16px;"><p style="color: #64748B; font-size: 13px; line-height: 1.6; margin: 0;">${lines.join('<br/>')}</p></div>`;
    }

    /**
     * Translate email subject and body to the target language using Gemini.
     * Returns original text if language is Polish (templates are already in Polish).
     */
    async translateEmail(
        subject: string,
        body: string,
        targetLang: { code: string; name: string },
    ): Promise<{ subject: string; body: string; ctaText: string }> {
        if (targetLang.code === 'pl') {
            return { subject, body, ctaText: 'Złóż ofertę' };
        }

        try {
            const prompt = `Translate the following business email to ${targetLang.name}.
Keep the tone professional and natural - write as a native speaker would.
Do NOT translate company names, person names, or product names.
Also translate the CTA button text "Złóż ofertę" (meaning "Submit your offer/quote").

Subject: ${subject}

Body:
${body}

Respond ONLY with valid JSON (no markdown, no code blocks):
{"subject": "translated subject", "body": "translated body", "ctaText": "translated CTA"}`;

            const response = await this.geminiService.generateContent(prompt);

            // Parse JSON from response (handle potential markdown wrapping)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    subject: parsed.subject || subject,
                    body: parsed.body || body,
                    ctaText: parsed.ctaText || 'Submit Quote',
                };
            }

            this.logger.warn(`[TRANSLATE] Failed to parse Gemini response, using original`);
            return { subject, body, ctaText: 'Submit Quote' };
        } catch (err: any) {
            this.logger.error(`[TRANSLATE] Translation failed: ${err.message}`);
            return { subject, body, ctaText: 'Submit Quote' };
        }
    }
}
