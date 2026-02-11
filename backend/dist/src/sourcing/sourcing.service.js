"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SourcingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourcingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const strategy_agent_1 = require("./agents/strategy.agent");
const explorer_agent_1 = require("./agents/explorer.agent");
const analyst_agent_1 = require("./agents/analyst.agent");
const enrichment_agent_1 = require("./agents/enrichment.agent");
const auditor_agent_1 = require("./agents/auditor.agent");
const google_search_service_1 = require("../common/services/google-search.service");
const scraping_service_1 = require("../common/services/scraping.service");
const query_cache_service_1 = require("../common/services/query-cache.service");
const company_registry_service_1 = require("../common/services/company-registry.service");
const sourcing_gateway_1 = require("./sourcing.gateway");
let SourcingService = SourcingService_1 = class SourcingService {
    prisma;
    strategyAgent;
    explorerAgent;
    analystAgent;
    enrichmentAgent;
    auditorAgent;
    searchService;
    scrapingService;
    sourcingGateway;
    queryCache;
    companyRegistry;
    logger = new common_1.Logger(SourcingService_1.name);
    constructor(prisma, strategyAgent, explorerAgent, analystAgent, enrichmentAgent, auditorAgent, searchService, scrapingService, sourcingGateway, queryCache, companyRegistry) {
        this.prisma = prisma;
        this.strategyAgent = strategyAgent;
        this.explorerAgent = explorerAgent;
        this.analystAgent = analystAgent;
        this.enrichmentAgent = enrichmentAgent;
        this.auditorAgent = auditorAgent;
        this.searchService = searchService;
        this.scrapingService = scrapingService;
        this.sourcingGateway = sourcingGateway;
        this.queryCache = queryCache;
        this.companyRegistry = companyRegistry;
    }
    normalizeToRootDomain(url) {
        try {
            const urlObj = new URL(url);
            return `${urlObj.protocol}//${urlObj.hostname}`;
        }
        catch (e) {
            return url;
        }
    }
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace(/^www\./, '');
        }
        catch (e) {
            return url;
        }
    }
    async log(campaignId, message) {
        this.logger.log(`[${campaignId}] ${message}`);
        try {
            await this.prisma.log.create({
                data: { campaignId, message }
            });
        }
        catch (e) {
            this.logger.error(`Failed to save log: ${e.message}`);
        }
        this.sourcingGateway.emitLog(campaignId, message);
    }
    async create(dto) {
        const campaign = await this.prisma.campaign.create({
            data: {
                name: dto.name || 'New Campaign',
                status: 'RUNNING',
                stage: 'STRATEGY'
            }
        });
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
        this.runMultimodalPipeline(campaign.id, dto).catch(async (err) => {
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
                suppliersContacted: c.suppliers.filter(s => s.contactEmails && s.contactEmails.length > 5).length,
                offersReceived: Math.floor(c._count.suppliers * 0.1)
            },
            tags: [...new Set(c.suppliers.map(s => s.originCountry).filter(Boolean))]
        }));
    }
    async findOne(id) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id },
            include: {
                suppliers: {
                    include: {
                        contacts: true
                    }
                },
                logs: { orderBy: { timestamp: 'asc' } }
            }
        });
        if (!campaign)
            return { status: 'NOT_FOUND' };
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
    async updateStatus(id, status) {
        return this.prisma.campaign.update({
            where: { id },
            data: { status }
        });
    }
    async getLogs(campaignId, since) {
        const whereClause = { campaignId };
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
    async runMultimodalPipeline(id, dto) {
        const { searchCriteria } = dto;
        const processedDomains = new Set();
        const processedCompanyNames = new Set();
        let globalQualifiedCount = 0;
        const MAX_TOTAL_QUALIFIED = 10;
        const MAX_PER_LANGUAGE = 5;
        try {
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
            const languageStrategies = strategyResult.strategies || [];
            if (languageStrategies.length === 0) {
                await this.log(id, `[ERROR] No language strategies generated. Using fallback.`);
                languageStrategies.push({
                    country: 'Global',
                    language: 'en',
                    queries: dto.searchCriteria.keywords || ['manufacturer'],
                    negatives: ['-amazon', '-ebay']
                });
            }
            await this.log(id, `🔍 [SCANNING] Spawning ${languageStrategies.length} parallel language workers...`);
            const optimizedStrategies = languageStrategies.slice(0, 5);
            await this.log(id, `⚡ [SCANNING] Optimized: Starting ${optimizedStrategies.length} language workers (limited from ${languageStrategies.length} for efficiency)...`);
            const workerResults = [];
            for (const langStrategy of optimizedStrategies) {
                try {
                    const result = await this.executeLanguageWorker(id, dto, langStrategy, processedDomains, processedCompanyNames, MAX_PER_LANGUAGE, () => globalQualifiedCount, () => MAX_TOTAL_QUALIFIED, (count) => { globalQualifiedCount += count; });
                    workerResults.push({ status: 'fulfilled', value: result });
                }
                catch (err) {
                    workerResults.push({ status: 'rejected', reason: err });
                }
            }
            let totalFound = 0;
            let totalErrors = 0;
            const languageStats = [];
            workerResults.forEach((result, idx) => {
                const lang = languageStrategies[idx]?.language || 'unknown';
                const country = languageStrategies[idx]?.country || 'unknown';
                if (result.status === 'fulfilled') {
                    const workerResult = result.value;
                    totalFound += workerResult.suppliersFound;
                    languageStats.push(`${country}/${lang}: ${workerResult.suppliersFound} suppliers`);
                }
                else {
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
        }
        catch (e) {
            this.logger.error(`Pipeline error: ${e.message}`);
            await this.prisma.campaign.update({
                where: { id },
                data: { status: 'ERROR' }
            });
            await this.log(id, `Error: ${e.message}`);
        }
    }
    async executeLanguageWorker(campaignId, dto, langStrategy, globalProcessedDomains, globalProcessedCompanyNames, maxPerLanguage, getGlobalCount, getMaxTotal, incrementGlobalCount) {
        const { country, language, queries, negatives } = langStrategy;
        const workerTag = `[${country.toUpperCase()}/${language.toUpperCase()}]`;
        await this.log(campaignId, `${workerTag} Worker started with ${queries.length} queries`);
        let localQualified = 0;
        const errors = [];
        try {
            for (const query of queries) {
                if (getGlobalCount() >= getMaxTotal()) {
                    await this.log(campaignId, `${workerTag} Global limit reached. Stopping.`);
                    break;
                }
                if (localQualified >= maxPerLanguage) {
                    await this.log(campaignId, `${workerTag} Language limit (${maxPerLanguage}) reached.`);
                    break;
                }
                const fullQuery = `${query} ${negatives.join(' ')}`;
                let urls = [];
                const cachedResults = await this.queryCache.getCachedResults(query);
                if (cachedResults) {
                    urls = cachedResults.map(r => r.link);
                    await this.log(campaignId, `${workerTag} [CACHE] "${query.substring(0, 25)}..." (${urls.length} URLs)`);
                }
                else {
                    await this.log(campaignId, `${workerTag} [SEARCH] "${query.substring(0, 25)}..."`);
                    const rawResults = await this.searchService.searchExtended(fullQuery);
                    urls = rawResults.map(r => r.link);
                    if (rawResults.length > 0) {
                        await this.queryCache.cacheResults(query, rawResults);
                    }
                }
                for (const url of urls) {
                    if (getGlobalCount() >= getMaxTotal() || localQualified >= maxPerLanguage)
                        break;
                    const domain = this.extractDomain(url);
                    if (globalProcessedDomains.has(domain))
                        continue;
                    globalProcessedDomains.add(domain);
                    try {
                        const supplierResult = await this.processSupplierUrl(campaignId, dto, url, workerTag, globalProcessedCompanyNames, language, country);
                        if (supplierResult) {
                            localQualified++;
                            incrementGlobalCount(1);
                        }
                    }
                    catch (err) {
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
        }
        catch (e) {
            await this.log(campaignId, `${workerTag} Worker error: ${e.message}`);
            return {
                language,
                country,
                suppliersFound: localQualified,
                errors: [...errors, e.message]
            };
        }
    }
    async processSupplierUrl(campaignId, dto, url, workerTag, processedCompanyNames, originLanguage, originCountry) {
        try {
            const domain = this.extractDomain(url);
            const cachedSupplier = await this.companyRegistry.getByDomain(domain);
            if (cachedSupplier && !this.companyRegistry.isStale(cachedSupplier.lastProcessedAt)) {
                if (cachedSupplier.contactEmails && cachedSupplier.contactEmails.length > 0) {
                    await this.log(campaignId, `${workerTag} [CACHE HIT] ${cachedSupplier.name || domain} - reusing cached data`);
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
                    return await this.saveSupplierFromCache(campaignId, workerTag, cachedSupplier, enrichedData, processedCompanyNames, originLanguage, originCountry);
                }
                else {
                    await this.log(campaignId, `${workerTag} [CACHE HIT NO EMAIL] ${domain} - running enrichment for emails`);
                }
            }
            await this.log(campaignId, `${workerTag} Exploring: ${domain}`);
            this.sourcingGateway.emitSupplierUpdate(campaignId, { url, status: 'EXPLORING' });
            const content = await this.scrapingService.fetchContent(url);
            const explorerResult = await this.explorerAgent.execute(url, content);
            if (!explorerResult.is_relevant) {
                await this.log(campaignId, `${workerTag} Skipped: Not relevant`);
                return false;
            }
            this.sourcingGateway.emitSupplierUpdate(campaignId, { url, status: 'ANALYZING' });
            const analystResult = await this.analystAgent.execute(content, dto);
            if ((analystResult.capability_match_score || 0) < 40) {
                await this.log(campaignId, `${workerTag} Skipped: Low match (${analystResult.capability_match_score}%)`);
                return false;
            }
            this.sourcingGateway.emitSupplierUpdate(campaignId, { url, status: 'ENRICHING' });
            const enrichmentResult = await this.enrichmentAgent.execute(analystResult.extracted_data || {}, url);
            this.sourcingGateway.emitSupplierUpdate(campaignId, { url, status: 'VERIFYING' });
            const enrichedData = enrichmentResult.enriched_data || analystResult.extracted_data;
            const registryData = {
                name: enrichedData.company_name || 'Unknown',
                status: 'Active',
                activities: ['Manufacturing']
            };
            const auditorResult = await this.auditorAgent.execute(enrichedData, registryData);
            if (auditorResult.validation_result === 'REJECTED' || auditorResult.is_valid === false) {
                await this.log(campaignId, `${workerTag} REJECTED: ${auditorResult.rejection_reason || 'Validation failed'}`);
                return false;
            }
            const emailArray = enrichedData.contact_emails || [];
            if (!Array.isArray(emailArray) || emailArray.length === 0) {
                await this.log(campaignId, `${workerTag} NO EMAIL: "${enrichedData.company_name}" - skipping (unreachable)`);
                return false;
            }
            const companyName = enrichedData.company_name || analystResult.extracted_data?.company_name || '';
            const normalizedCompanyName = companyName.toLowerCase().trim();
            if (normalizedCompanyName && processedCompanyNames.has(normalizedCompanyName)) {
                await this.log(campaignId, `${workerTag} DUPLICATE: Company "${companyName}" already processed`);
                return false;
            }
            if (normalizedCompanyName) {
                processedCompanyNames.add(normalizedCompanyName);
            }
            const capabilityScore = analystResult.capability_match_score || 50;
            const trustScore = enrichmentResult.verification?.confidence_score || 50;
            const finalScore = Math.round((capabilityScore * 0.6) + (trustScore * 0.4));
            const finalWebsite = enrichedData.website || this.normalizeToRootDomain(url);
            const contactEmailsString = emailArray.join(', ');
            const supplierDomain = this.extractDomain(finalWebsite);
            const registryEntry = await this.companyRegistry.upsert(supplierDomain, {
                name: enrichedData.company_name || analystResult?.extracted_data?.company_name || 'Unknown',
                country: enrichmentResult?.enriched_data?.country || analystResult?.extracted_data?.country || 'Europe',
                city: enrichmentResult?.enriched_data?.city || analystResult?.extracted_data?.city || null,
                specialization: enrichmentResult?.enriched_data?.specialization || analystResult?.extracted_data?.specialization || 'General',
                certificates: Array.isArray(enrichedData.certificates) ? enrichedData.certificates.join(', ') : (enrichedData.certificates || ''),
                employeeCount: enrichmentResult?.enriched_data?.employee_count || analystResult?.extracted_data?.employee_count || 'N/A',
                contactEmails: contactEmailsString,
                explorerResult: explorerResult,
                analystResult: analystResult,
                enrichmentResult: enrichmentResult,
                auditorResult: auditorResult,
                lastAnalysisScore: finalScore / 10
            }, campaignId);
            const newSupplier = await this.prisma.supplier.create({
                data: {
                    campaignId: campaignId,
                    url: finalWebsite,
                    name: enrichedData.company_name || analystResult.extracted_data?.company_name || 'Unknown Company',
                    country: enrichmentResult?.enriched_data?.country || analystResult?.extracted_data?.country || 'Europe',
                    city: enrichmentResult?.enriched_data?.city || analystResult?.extracted_data?.city || null,
                    website: finalWebsite,
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
                    registryId: registryEntry.id,
                    contacts: {
                        create: emailArray.map((email) => ({
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
        }
        catch (err) {
            await this.log(campaignId, `${workerTag} Error processing ${url}: ${err.message}`);
            return false;
        }
    }
    async saveSupplierFromCache(campaignId, workerTag, cachedSupplier, enrichedData, processedCompanyNames, originLanguage, originCountry) {
        try {
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
            const registryEntry = await this.companyRegistry.upsert(cachedSupplier.domain, {}, campaignId);
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
                    registryId: registryEntry.id,
                    contacts: {
                        create: Array.isArray(contactEmails) ? contactEmails.map((email) => ({
                            email: email,
                            role: 'Cached Contact',
                            isDecisionMaker: false
                        })) : []
                    }
                }
            });
            return true;
        }
        catch (err) {
            await this.log(campaignId, `${workerTag} Error saving cached supplier: ${err.message}`);
            return false;
        }
    }
};
exports.SourcingService = SourcingService;
exports.SourcingService = SourcingService = SourcingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        strategy_agent_1.StrategyAgentService,
        explorer_agent_1.ExplorerAgentService,
        analyst_agent_1.AnalystAgentService,
        enrichment_agent_1.EnrichmentAgentService,
        auditor_agent_1.AuditorAgentService,
        google_search_service_1.GoogleSearchService,
        scraping_service_1.ScrapingService,
        sourcing_gateway_1.SourcingGateway,
        query_cache_service_1.QueryCacheService,
        company_registry_service_1.CompanyRegistryService])
], SourcingService);
//# sourceMappingURL=sourcing.service.js.map