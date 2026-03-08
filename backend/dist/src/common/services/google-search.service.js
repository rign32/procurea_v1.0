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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var GoogleSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSearchService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const api_usage_service_1 = require("./api-usage.service");
class SearchBudget {
    usage = new Map();
    maxPerCampaign;
    constructor(max) {
        this.maxPerCampaign = max;
    }
    canSearch(campaignId) {
        if (!campaignId)
            return true;
        return (this.usage.get(campaignId) || 0) < this.maxPerCampaign;
    }
    record(campaignId) {
        if (!campaignId)
            return;
        this.usage.set(campaignId, (this.usage.get(campaignId) || 0) + 1);
    }
    remaining(campaignId) {
        if (!campaignId)
            return this.maxPerCampaign;
        return this.maxPerCampaign - (this.usage.get(campaignId) || 0);
    }
    used(campaignId) {
        if (!campaignId)
            return 0;
        return this.usage.get(campaignId) || 0;
    }
}
let GoogleSearchService = GoogleSearchService_1 = class GoogleSearchService {
    apiUsageService;
    logger = new common_1.Logger(GoogleSearchService_1.name);
    serpApiKey = process.env.SERP_API_KEY || '';
    serperApiKey = process.env.SERPER_API_KEY || '';
    provider;
    budget;
    lastRequestTime = 0;
    MIN_DELAY_MS = 1500;
    requestQueue = Promise.resolve();
    constructor(apiUsageService) {
        this.apiUsageService = apiUsageService;
        const configuredProvider = (process.env.SEARCH_PROVIDER || 'serpapi').toLowerCase();
        if (configuredProvider === 'serper' && this.serperApiKey) {
            this.provider = 'serper';
        }
        else {
            this.provider = 'serpapi';
        }
        const maxSearches = parseInt(process.env.MAX_SEARCHES_PER_CAMPAIGN || '20', 10);
        this.budget = new SearchBudget(maxSearches);
        const hasKey = this.provider === 'serper'
            ? !!this.serperApiKey
            : !!this.serpApiKey && this.serpApiKey !== 'PLACEHOLDER_KEY';
        this.logger.log(`[SEARCH INIT] Provider: ${this.provider}, API Key present: ${hasKey}, Budget: ${maxSearches}/campaign`);
        if (!hasKey) {
            this.logger.warn('[SEARCH INIT] Running in MOCK MODE - will return example.com results');
        }
    }
    get hasValidKey() {
        if (this.provider === 'serper')
            return !!this.serperApiKey;
        return !!this.serpApiKey && this.serpApiKey !== 'PLACEHOLDER_KEY';
    }
    async search(query, userId, campaignId) {
        const results = await this.searchExtended(query, undefined, userId, campaignId);
        return results.map(r => r.link);
    }
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async rateLimitedRequest(requestFn) {
        this.requestQueue = this.requestQueue.then(async () => {
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;
            if (timeSinceLastRequest < this.MIN_DELAY_MS) {
                await this.delay(this.MIN_DELAY_MS - timeSinceLastRequest);
            }
            this.lastRequestTime = Date.now();
        });
        await this.requestQueue;
        return requestFn();
    }
    async withRetry(requestFn, maxRetries = 3, baseDelayMs = 2000) {
        let lastError;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await this.rateLimitedRequest(requestFn);
            }
            catch (e) {
                lastError = e;
                if (e.response?.status === 429 || e.message?.includes('429')) {
                    const delay = baseDelayMs * Math.pow(2, attempt);
                    this.logger.warn(`[RATE LIMIT] Attempt ${attempt + 1}/${maxRetries}, waiting ${delay}ms...`);
                    await this.delay(delay);
                }
                else {
                    throw e;
                }
            }
        }
        throw lastError;
    }
    getRemainingBudget(campaignId) {
        return this.budget.remaining(campaignId);
    }
    async searchExtended(query, options, userId, campaignId) {
        if (!this.budget.canSearch(campaignId)) {
            this.logger.warn(`[BUDGET] Campaign ${campaignId} exceeded search limit. Remaining: 0`);
            return [];
        }
        this.logger.log(`[SEARCH] ${this.provider}: "${query.substring(0, 50)}..." (budget: ${this.budget.remaining(campaignId)} left)`);
        if (!this.hasValidKey) {
            return [
                { title: "Mock 1", link: "https://example.com/1", snippet: "Mock Company Manufacturer info@example.com" },
                { title: "Mock 2", link: "https://example.com/2", snippet: "Mock Company Producer sales@example.com" }
            ];
        }
        this.budget.record(campaignId);
        const startTime = Date.now();
        let status = 'success';
        let errorMessage;
        let results = [];
        try {
            if (this.provider === 'serper') {
                results = await this.searchWithSerper(query, options);
            }
            else {
                results = await this.searchWithSerpApi(query, options);
            }
        }
        catch (e) {
            status = 'error';
            errorMessage = e.message;
            this.logger.error(`[SEARCH] ${this.provider} failed: ${e.message}`);
        }
        finally {
            if (this.apiUsageService) {
                await this.apiUsageService.logCall({
                    service: this.provider,
                    endpoint: 'searchExtended',
                    userId,
                    requestPayload: query.substring(0, 200),
                    status,
                    errorMessage,
                    responseTimeMs: Date.now() - startTime,
                }).catch(() => { });
            }
        }
        return results;
    }
    async searchWithSerpApi(query, options) {
        const response = await this.withRetry(async () => {
            return axios_1.default.get('https://serpapi.com/search.json', {
                params: {
                    engine: 'google',
                    q: query,
                    api_key: this.serpApiKey,
                    num: options?.num || 10,
                    gl: options?.gl || 'pl',
                    hl: options?.hl || 'pl'
                },
                timeout: 30000
            });
        });
        if (response.data.organic_results) {
            const results = response.data.organic_results.map((r) => ({
                title: r.title || '',
                link: r.link || '',
                snippet: r.snippet || ''
            }));
            this.logger.log(`[SERPAPI] Found ${results.length} results`);
            return results;
        }
        return [];
    }
    async searchWithSerper(query, options) {
        const response = await this.withRetry(async () => {
            return axios_1.default.post('https://google.serper.dev/search', {
                q: query,
                gl: options?.gl || 'pl',
                hl: options?.hl || 'pl',
                num: options?.num || 10,
            }, {
                headers: {
                    'X-API-KEY': this.serperApiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            });
        });
        if (response.data.organic) {
            const results = response.data.organic.map((r) => ({
                title: r.title || '',
                link: r.link || '',
                snippet: r.snippet || ''
            }));
            this.logger.log(`[SERPER] Found ${results.length} results`);
            return results;
        }
        return [];
    }
    async searchGlobal(query, userId, campaignId) {
        return this.searchExtended(query, { gl: 'us', hl: 'en', num: 15 }, userId, campaignId);
    }
};
exports.GoogleSearchService = GoogleSearchService;
exports.GoogleSearchService = GoogleSearchService = GoogleSearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => api_usage_service_1.ApiUsageService))),
    __metadata("design:paramtypes", [api_usage_service_1.ApiUsageService])
], GoogleSearchService);
//# sourceMappingURL=google-search.service.js.map