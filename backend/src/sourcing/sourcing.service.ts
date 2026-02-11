import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StrategyAgentService } from './agents/strategy.agent';
import { ExplorerAgentService } from './agents/explorer.agent';
import { AnalystAgentService } from './agents/analyst.agent';
import { EnrichmentAgentService } from './agents/enrichment.agent';
import { AuditorAgentService } from './agents/auditor.agent';
import { GoogleSearchService } from '../common/services/google-search.service';
import { ScrapingService } from '../common/services/scraping.service';
import { QueryCacheService, CachedSearchResult } from '../common/services/query-cache.service';
import { CompanyRegistryService } from '../common/services/company-registry.service';
import { CreateCampaignDto } from './sourcing.controller';
import { SourcingGateway } from './sourcing.gateway';
import { v4 as uuidv4 } from 'uuid';

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

    constructor(
        private readonly prisma: PrismaService,
        private readonly strategyAgent: StrategyAgentService,
        private readonly explorerAgent: ExplorerAgentService,
        private readonly analystAgent: AnalystAgentService,
        private readonly enrichmentAgent: EnrichmentAgentService,
        private readonly auditorAgent: AuditorAgentService,
        private readonly searchService: GoogleSearchService,
        private readonly scrapingService: ScrapingService,
        private readonly sourcingGateway: SourcingGateway,
        private readonly queryCache: QueryCacheService,
        private readonly companyRegistry: CompanyRegistryService,
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
        this.sourcingGateway.emitLog(campaignId, message);
    }

    async create(dto: CreateCampaignDto) {
        const campaign = await this.prisma.campaign.create({
            data: {
                name: dto.name || 'New Campaign',
                status: 'RUNNING',
                stage: 'STRATEGY'
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
        });

        return { id: campaign.id, status: 'STARTED' };
    }

    async findAll() {
        const campaigns = await this.prisma.campaign.findMany({
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
                        contacts: { // Include structured contacts
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
                        status: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return campaigns.map(c => ({
            id: c.id,
            name: c.name,
            status: c.status,
            stage: c.stage,
            createdAt: c.createdAt,
            rfqRequestId: c.rfqRequest?.id || null,
            rfqRequest: c.rfqRequest || null,
            stats: {
                suppliersFound: c._count.suppliers,
                suppliersContacted: c.suppliers.filter(s => s.contactEmails && s.contactEmails.length > 5).length, // Rough heuristic
                offersReceived: Math.floor(c._count.suppliers * 0.1) // Mock logic for now
            },
            tags: [...new Set(c.suppliers.map(s => s.originCountry).filter(Boolean))]
        }));
    }

    async findOne(id: string) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id },
            include: {
                suppliers: {
                    include: {
                        contacts: true // Full contact details
                    }
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

        return {
            logs: logs.map(l => ({
                message: l.message,
                timestamp: l.timestamp
            })),
            status: campaign?.status || 'UNKNOWN',
            stage: campaign?.stage || 'UNKNOWN',
            suppliersFound: campaign?._count.suppliers || 0
        };
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
        // LIMITS RESTORED - user request: find 10 qualified companies
        const MAX_TOTAL_QUALIFIED = 10;
        const MAX_PER_LANGUAGE = 5; // Balanced distribution

        try {
            // --- PHASE 1: STRATEGY GENERATION ---
            const strategyParams = {
                category: dto.searchCriteria.industry || 'General',
                material: dto.searchCriteria.material || 'Metal',
                region: dto.searchCriteria.region || 'EU',
                eau: dto.searchCriteria.eau || 1000
            };

            await this.log(id, `🎯 [STRATEGY] Generating multimodal search strategy for region: ${strategyParams.region}`);
            await this.log(id, `📊 [STRATEGY] Parameters: Category=${strategyParams.category}, Material=${strategyParams.material}, EAU=${strategyParams.eau}`);
            const strategyResult = await this.strategyAgent.execute(strategyParams);
            await this.log(id, `✅ [STRATEGY] Generated ${strategyResult.strategies?.length || 0} language-specific strategies`);
            this.sourcingGateway.emitProgress(id, 'STRATEGY', 100);

            // Extract language strategies
            const languageStrategies = strategyResult.strategies || [];

            if (languageStrategies.length === 0) {
                await this.log(id, `[ERROR] No language strategies generated. Using fallback.`);
                // Fallback to basic queries
                languageStrategies.push({
                    country: 'Global',
                    language: 'en',
                    queries: dto.searchCriteria.keywords || ['manufacturer'],
                    negatives: ['-amazon', '-ebay']
                });
            }

            await this.log(id, `🔍 [SCANNING] Spawning ${languageStrategies.length} parallel language workers...`);

            // --- PHASE 2: EXECUTE LANGUAGE WORKERS SEQUENTIALLY (to avoid API rate limits) ---
            // COST OPTIMIZATION: Limit to top 5 markets/strategies to save API credits
            const optimizedStrategies = languageStrategies.slice(0, 5);

            await this.log(id, `⚡ [SCANNING] Optimized: Starting ${optimizedStrategies.length} language workers (limited from ${languageStrategies.length} for efficiency)...`);

            const workerResults: PromiseSettledResult<LanguageWorkerResult>[] = [];

            for (const langStrategy of optimizedStrategies) {
                try {
                    const result = await this.executeLanguageWorker(
                        id,
                        dto,
                        langStrategy,
                        processedDomains,
                        processedCompanyNames,
                        MAX_PER_LANGUAGE,
                        () => globalQualifiedCount,
                        () => MAX_TOTAL_QUALIFIED,
                        (count: number) => { globalQualifiedCount += count; }
                    );
                    workerResults.push({ status: 'fulfilled', value: result });
                } catch (err: any) {
                    workerResults.push({ status: 'rejected', reason: err });
                }
            }

            // --- PHASE 3: AGGREGATE RESULTS ---
            let totalFound = 0;
            let totalErrors = 0;
            const languageStats: string[] = [];

            workerResults.forEach((result, idx) => {
                const lang = languageStrategies[idx]?.language || 'unknown';
                const country = languageStrategies[idx]?.country || 'unknown';

                if (result.status === 'fulfilled') {
                    const workerResult = result.value as LanguageWorkerResult;
                    totalFound += workerResult.suppliersFound;
                    languageStats.push(`${country}/${lang}: ${workerResult.suppliersFound} suppliers`);
                } else {
                    totalErrors++;
                    languageStats.push(`${country}/${lang}: FAILED`);
                }
            });

            await this.log(id, `[MULTIMODAL] Results: ${languageStats.join(' | ')}`);
            await this.log(id, `📈 [ANALYSIS] Total suppliers found: ${totalFound} from ${languageStrategies.length} languages`);
            await this.log(id, `✅ [COMPLETED] Pipeline finished successfully!`);

            await this.prisma.campaign.update({
                where: { id },
                data: { stage: 'COMPLETED', status: 'COMPLETED' }
            });
            this.sourcingGateway.emitProgress(id, 'COMPLETED', 100);

        } catch (e: any) {
            this.logger.error(`Pipeline error: ${e.message}`);
            await this.prisma.campaign.update({
                where: { id },
                data: { status: 'ERROR' }
            });
            await this.log(id, `Error: ${e.message}`);
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
        incrementGlobalCount: (count: number) => void
    ): Promise<LanguageWorkerResult> {
        const { country, language, queries, negatives } = langStrategy;
        const workerTag = `[${country.toUpperCase()}/${language.toUpperCase()}]`;

        await this.log(campaignId, `${workerTag} Worker started with ${queries.length} queries`);

        let localQualified = 0;
        const errors: string[] = [];

        try {
            for (const query of queries) {
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
                    await this.log(campaignId, `${workerTag} [SEARCH] "${query.substring(0, 25)}..."`);
                    const rawResults = await this.searchService.searchExtended(fullQuery);
                    urls = rawResults.map(r => r.link);

                    if (rawResults.length > 0) {
                        await this.queryCache.cacheResults(query, rawResults);
                    }
                }

                // --- PROCESS EACH URL ---
                for (const url of urls) {
                    if (getGlobalCount() >= getMaxTotal() || localQualified >= maxPerLanguage) break;

                    // Deduplication by domain (global across all workers)
                    const domain = this.extractDomain(url);
                    if (globalProcessedDomains.has(domain)) continue;
                    globalProcessedDomains.add(domain);

                    try {
                        const supplierResult = await this.processSupplierUrl(
                            campaignId,
                            dto,
                            url,
                            workerTag,
                            globalProcessedCompanyNames, // Pass company name set for deduplication
                            language,
                            country
                        );
                        if (supplierResult) {
                            localQualified++;
                            incrementGlobalCount(1);
                        }
                    } catch (err: any) {
                        errors.push(`${url}: ${err.message}`);
                    }
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
        processedCompanyNames: Set<string>, // NEW: Company name deduplication
        originLanguage: string,
        originCountry: string
    ): Promise<boolean> {
        try {
            const domain = this.extractDomain(url);

            // 0. CHECK GLOBAL REGISTRY CACHE FIRST!
            const cachedSupplier = await this.companyRegistry.getByDomain(domain);

            if (cachedSupplier && !this.companyRegistry.isStale(cachedSupplier.lastProcessedAt)) {
                // CACHE HIT - Check if has email (required)
                if (cachedSupplier.contactEmails && cachedSupplier.contactEmails.length > 0) {
                    await this.log(campaignId, `${workerTag} [CACHE HIT] ${cachedSupplier.name || domain} - reusing cached data`);

                    // Use cached data directly - skip expensive agents!
                    const enrichedData = {
                        company_name: cachedSupplier.name,
                        website: `https://${cachedSupplier.domain}`,
                        country: cachedSupplier.country,
                        city: cachedSupplier.city,
                        specialization: cachedSupplier.specialization,
                        certificates: cachedSupplier.certificates,
                        employee_count: cachedSupplier.employeeCount,
                        contact_emails: cachedSupplier.contactEmails?.split(',').map(e => e.trim()) || []
                    };

                    // Skip to validation and save (bypass agents)
                    return await this.saveSupplierFromCache(
                        campaignId,
                        workerTag,
                        cachedSupplier,
                        enrichedData,

                        processedCompanyNames,
                        originLanguage,
                        originCountry
                    );
                } else {
                    await this.log(campaignId, `${workerTag} [CACHE HIT NO EMAIL] ${domain} - running enrichment for emails`);
                }
            }

            // 1. EXPLORER
            await this.log(campaignId, `${workerTag} Exploring: ${domain}`);
            this.sourcingGateway.emitSupplierUpdate(campaignId, { url, status: 'EXPLORING' });

            const content = await this.scrapingService.fetchContent(url);
            const explorerResult = await this.explorerAgent.execute(url, content);

            if (!explorerResult.is_relevant) {
                await this.log(campaignId, `${workerTag} Skipped: Not relevant`);
                return false;
            }

            // 2. ANALYST
            this.sourcingGateway.emitSupplierUpdate(campaignId, { url, status: 'ANALYZING' });
            const analystResult = await this.analystAgent.execute(content, dto);

            if ((analystResult.capability_match_score || 0) < 40) {
                await this.log(campaignId, `${workerTag} Skipped: Low match (${analystResult.capability_match_score}%)`);
                return false;
            }

            // 3. ENRICHMENT (includes domain discovery and aggressive email search)
            this.sourcingGateway.emitSupplierUpdate(campaignId, { url, status: 'ENRICHING' });
            const enrichmentResult = await this.enrichmentAgent.execute(analystResult.extracted_data || {}, url);

            // 4. AUDITOR - STRICT VALIDATION
            this.sourcingGateway.emitSupplierUpdate(campaignId, { url, status: 'VERIFYING' });
            const enrichedData = enrichmentResult.enriched_data || analystResult.extracted_data;
            const registryData = {
                name: enrichedData.company_name || 'Unknown',
                status: 'Active',
                activities: ['Manufacturing']
            };
            const auditorResult = await this.auditorAgent.execute(enrichedData, registryData);

            // CRITICAL: Filter out rejected records
            if (auditorResult.validation_result === 'REJECTED' || auditorResult.is_valid === false) {
                await this.log(campaignId, `${workerTag} REJECTED: ${auditorResult.rejection_reason || 'Validation failed'}`);
                return false;
            }

            // 4.5. EMAIL REQUIRED CHECK - No email = unusable supplier
            const emailArray = enrichedData.contact_emails || [];
            if (!Array.isArray(emailArray) || emailArray.length === 0) {
                await this.log(campaignId, `${workerTag} NO EMAIL: "${enrichedData.company_name}" - skipping (unreachable)`);
                return false;
            }

            // 4.6. COMPANY NAME DEDUPLICATION CHECK
            const companyName = enrichedData.company_name || analystResult.extracted_data?.company_name || '';
            const normalizedCompanyName = companyName.toLowerCase().trim();

            if (normalizedCompanyName && processedCompanyNames.has(normalizedCompanyName)) {
                await this.log(campaignId, `${workerTag} DUPLICATE: Company "${companyName}" already processed`);
                return false;
            }
            if (normalizedCompanyName) {
                processedCompanyNames.add(normalizedCompanyName);
            }

            // 5. SAVE (only approved, non-duplicate records with email)
            const capabilityScore = analystResult.capability_match_score || 50;
            const trustScore = enrichmentResult.verification?.confidence_score || 50;
            const finalScore = Math.round((capabilityScore * 0.6) + (trustScore * 0.4));

            // Use enriched website (discovered real domain) instead of original URL
            const finalWebsite = enrichedData.website || this.normalizeToRootDomain(url);
            const contactEmailsString = emailArray.join(', ');

            // 5. UPDATE/CREATE GLOBAL REGISTRY ENTRY FIRST (to get ID)
            const supplierDomain = this.extractDomain(finalWebsite);
            const registryEntry = await this.companyRegistry.upsert(supplierDomain, {
                name: enrichedData.company_name || analystResult?.extracted_data?.company_name || 'Unknown',
                country: enrichmentResult?.enriched_data?.country || analystResult?.extracted_data?.country || 'Europe',
                city: enrichmentResult?.enriched_data?.city || analystResult?.extracted_data?.city || null,
                specialization: enrichmentResult?.enriched_data?.specialization || analystResult?.extracted_data?.specialization || 'General',
                certificates: Array.isArray(enrichedData.certificates) ? enrichedData.certificates.join(', ') : (enrichedData.certificates || ''),
                employeeCount: enrichmentResult?.enriched_data?.employee_count || analystResult?.extracted_data?.employee_count || 'N/A',
                contactEmails: contactEmailsString, // CRITICAL: Save emails!
                explorerResult: explorerResult,
                analystResult: analystResult,
                enrichmentResult: enrichmentResult,
                auditorResult: auditorResult,
                lastAnalysisScore: finalScore / 10
            }, campaignId);

            const newSupplier = await this.prisma.supplier.create({
                data: {
                    campaignId: campaignId,
                    url: finalWebsite, // Use discovered/enriched domain
                    name: enrichedData.company_name || analystResult.extracted_data?.company_name || 'Unknown Company',
                    country: enrichmentResult?.enriched_data?.country || analystResult?.extracted_data?.country || 'Europe',
                    city: enrichmentResult?.enriched_data?.city || analystResult?.extracted_data?.city || null,
                    website: finalWebsite, // Use discovered/enriched domain
                    specialization: enrichmentResult?.enriched_data?.specialization || analystResult?.extracted_data?.specialization || 'General',
                    certificates: Array.isArray(enrichedData.certificates) ? enrichedData.certificates.join(', ') : (enrichedData.certificates || ''),
                    employeeCount: enrichmentResult?.enriched_data?.employee_count || analystResult?.extracted_data?.employee_count || 'N/A',
                    contactEmails: contactEmailsString,
                    explorerResult: JSON.stringify(explorerResult),
                    analystResult: JSON.stringify(analystResult),
                    enrichmentResult: JSON.stringify(enrichmentResult),
                    auditorResult: JSON.stringify(auditorResult),
                    analysisScore: finalScore / 10,

                    analysisReason: enrichmentResult.verification?.verification_notes || analystResult.match_reason,
                    originLanguage: originLanguage,
                    originCountry: originCountry,
                    sourceAgent: 'MultimodalWorker',

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
            this.sourcingGateway.emitSupplierUpdate(campaignId, { url, status: 'QUALIFIED', data: newSupplier });


            return true;

        } catch (err: any) {
            await this.log(campaignId, `${workerTag} Error processing ${url}: ${err.message}`);
            return false;
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
                    country: enrichedData.country || 'Unknown',
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
}
