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
const normalize_country_1 = require("../common/normalize-country");
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
const email_service_1 = require("../email/email.service");
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
    emailService;
    logger = new common_1.Logger(SourcingService_1.name);
    constructor(prisma, strategyAgent, explorerAgent, analystAgent, enrichmentAgent, auditorAgent, searchService, scrapingService, sourcingGateway, queryCache, companyRegistry, emailService) {
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
        this.emailService = emailService;
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
                stage: 'STRATEGY',
                sequenceTemplateId: dto.sequenceTemplateId || null,
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
    async findAll(filters) {
        const where = { deletedAt: null };
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.search) {
            where.name = { contains: filters.search, mode: 'insensitive' };
        }
        const campaigns = await this.prisma.campaign.findMany({
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
                offersReceived: c.rfqRequest?._count?.offers || 0,
                pendingOffers: c.rfqRequest?.offers?.length || 0,
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
    async updateCampaign(id, data) {
        return this.prisma.campaign.update({
            where: { id },
            data,
        });
    }
    async softDelete(id) {
        const campaign = await this.prisma.campaign.findUnique({ where: { id } });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        await this.prisma.campaign.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'ARCHIVED' },
        });
        return { success: true };
    }
    async exportCSV(id) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id },
            include: {
                suppliers: {
                    where: { deletedAt: null },
                    include: { contacts: true },
                },
            },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        const header = 'Name,Country,City,Website,ContactEmails,Score,Specialization,Certificates';
        const rows = campaign.suppliers.map(s => {
            const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
            return [
                esc(s.name), esc(s.country), esc(s.city), esc(s.website),
                esc(s.contactEmails), esc(s.analysisScore), esc(s.specialization), esc(s.certificates),
            ].join(',');
        });
        return [header, ...rows].join('\n');
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
                productName: dto.name || '',
                description: dto.searchCriteria.description || dto.name || '',
                keywords: dto.searchCriteria.keywords || [],
                category: dto.searchCriteria.industry || dto.searchCriteria.category || '',
                material: dto.searchCriteria.material || '',
                region: dto.searchCriteria.region || 'EU',
                eau: dto.searchCriteria.eau || 1000
            };
            await this.log(id, `🎯 [STRATEGY] Generating multimodal search strategy for region: ${strategyParams.region}`);
            await this.log(id, `📊 [STRATEGY] Product: "${strategyParams.productName}", Material: ${strategyParams.material || 'N/A'}, Category: ${strategyParams.category || 'N/A'}, Keywords: [${strategyParams.keywords.join(', ')}]`);
            const strategyResult = await this.strategyAgent.execute(strategyParams);
            await this.log(id, `✅ [STRATEGY] Generated ${strategyResult.strategies?.length || 0} language-specific strategies`);
            this.sourcingGateway.emitProgress(id, 'STRATEGY', 100);
            const languageStrategies = strategyResult.strategies || [];
            if (languageStrategies.length === 0) {
                await this.log(id, `[ERROR] No language strategies generated. Using fallback.`);
                const keywords = dto.searchCriteria.keywords?.filter(Boolean) || [];
                const material = dto.searchCriteria.material;
                const category = dto.searchCriteria.category || dto.searchCriteria.industry;
                const description = dto.searchCriteria.description;
                const region = dto.searchCriteria.region || 'EU';
                const fallbackQueries = [];
                const negatives = ['-amazon', '-ebay', '-aliexpress', '-alibaba', '-allegro'];
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
                if (fallbackQueries.length === 0) {
                    fallbackQueries.push('manufacturer producer supplier');
                }
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
            const optimizedStrategies = languageStrategies.slice(0, 3);
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
                    const remaining = this.searchService.getRemainingBudget(campaignId);
                    if (remaining <= 0) {
                        await this.log(campaignId, `${workerTag} [BUDGET] Search budget exhausted. Stopping.`);
                        break;
                    }
                    await this.log(campaignId, `${workerTag} [SEARCH] "${query.substring(0, 25)}..." (budget: ${remaining})`);
                    const rawResults = await this.searchService.searchExtended(fullQuery, undefined, undefined, campaignId);
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
                        country: (0, normalize_country_1.normalizeCountry)(cachedSupplier.country),
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
            const enrichmentResult = await this.enrichmentAgent.execute(analystResult.extracted_data || {}, url, campaignId);
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
                country: (0, normalize_country_1.normalizeCountry)(enrichmentResult?.enriched_data?.country || analystResult?.extracted_data?.country || 'Europe'),
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
                    country: (0, normalize_country_1.normalizeCountry)(enrichmentResult?.enriched_data?.country || analystResult?.extracted_data?.country || 'Europe'),
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
                    country: (0, normalize_country_1.normalizeCountry)(enrichedData.country || 'Unknown'),
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
    async acceptCampaign(campaignId, excludedSupplierIds) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                suppliers: { include: { contacts: true } },
                sequenceTemplate: {
                    include: { steps: { orderBy: { dayOffset: 'asc' } } },
                },
                rfqRequest: {
                    include: {
                        owner: { include: { organization: true } },
                    },
                },
            },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        if (campaign.status !== 'COMPLETED') {
            throw new Error(`Campaign status must be COMPLETED, got: ${campaign.status}`);
        }
        if (excludedSupplierIds.length > 0) {
            await this.prisma.supplier.updateMany({
                where: { id: { in: excludedSupplierIds }, campaignId },
                data: { deletedAt: new Date() },
            });
        }
        const qualifiedSuppliers = campaign.suppliers.filter(s => !excludedSupplierIds.includes(s.id) && !s.deletedAt);
        this.logger.log(`[ACCEPT] Campaign ${campaignId}: ${qualifiedSuppliers.length} qualified, ${excludedSupplierIds.length} excluded`);
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'ACCEPTED' },
        });
        const rfqRequestId = campaign.rfqRequest?.id;
        if (!rfqRequestId) {
            this.logger.warn(`[ACCEPT] Campaign ${campaignId} has no rfqRequest — skipping offer creation`);
            return { qualified: qualifiedSuppliers.length, excluded: excludedSupplierIds.length, offersSent: 0 };
        }
        let emailsSent = 0;
        const initialStep = campaign.sequenceTemplate?.steps?.[0];
        for (const supplier of qualifiedSuppliers) {
            const offer = await this.prisma.offer.create({
                data: {
                    rfqRequestId,
                    supplierId: supplier.id,
                    status: 'PENDING',
                },
            });
            if (initialStep && campaign.sequenceTemplate) {
                const emails = this.getSupplierEmails(supplier);
                if (emails.length > 0) {
                    try {
                        const subject = this.resolveTemplateVars(initialStep.subject, campaign.rfqRequest, supplier);
                        const body = this.resolveTemplateVars(initialStep.bodySnippet, campaign.rfqRequest, supplier);
                        const org = campaign.rfqRequest?.owner?.organization;
                        const footerHtml = org ? this.buildAcceptFooterHtml(org) : '';
                        const portalUrl = `${process.env.FRONTEND_URL || 'https://app.procurea.pl'}/offers/${offer.accessToken}`;
                        const html = `
                            <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h1 style="color: #4F46E5; margin: 0; font-size: 28px;">Procurea</h1>
                                </div>
                                <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                                    <p style="color: #475569; line-height: 1.6; white-space: pre-line;">${body}</p>
                                    <div style="text-align: center; margin: 24px 0;">
                                        <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                            Złóż ofertę
                                        </a>
                                    </div>
                                </div>
                                ${footerHtml}
                            </div>
                        `;
                        const sent = await this.emailService.sendEmail({
                            to: emails[0],
                            subject,
                            html,
                        });
                        if (sent) {
                            await this.prisma.sequenceExecution.create({
                                data: { offerId: offer.id, stepId: initialStep.id, status: 'SENT' },
                            });
                            emailsSent++;
                        }
                        else {
                            await this.prisma.sequenceExecution.create({
                                data: { offerId: offer.id, stepId: initialStep.id, status: 'FAILED' },
                            });
                        }
                    }
                    catch (err) {
                        this.logger.error(`[ACCEPT] Failed to send INITIAL to ${supplier.name}: ${err.message}`);
                        await this.prisma.sequenceExecution.create({
                            data: { offerId: offer.id, stepId: initialStep.id, status: 'FAILED' },
                        });
                    }
                }
            }
        }
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
    getSupplierEmails(supplier) {
        const contactEmails = supplier.contacts
            ?.map((c) => c.email)
            .filter(Boolean) || [];
        if (contactEmails.length > 0)
            return contactEmails;
        if (supplier.contactEmails) {
            return supplier.contactEmails.split(',').map((e) => e.trim()).filter(Boolean);
        }
        return [];
    }
    resolveTemplateVars(template, rfq, supplier) {
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
    buildAcceptFooterHtml(org) {
        if (!org.footerEnabled)
            return '';
        const lines = [];
        if (org.footerFirstName || org.footerLastName) {
            lines.push(`${org.footerFirstName || ''} ${org.footerLastName || ''}`.trim());
        }
        if (org.footerPosition)
            lines.push(org.footerPosition);
        if (org.footerCompany)
            lines.push(org.footerCompany);
        if (org.footerEmail)
            lines.push(org.footerEmail);
        if (org.footerPhone)
            lines.push(org.footerPhone);
        if (lines.length === 0)
            return '';
        return `<div style="border-top: 1px solid #E2E8F0; margin-top: 24px; padding-top: 16px;"><p style="color: #64748B; font-size: 13px; line-height: 1.6; margin: 0;">${lines.join('<br/>')}</p></div>`;
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
        company_registry_service_1.CompanyRegistryService,
        email_service_1.EmailService])
], SourcingService);
//# sourceMappingURL=sourcing.service.js.map