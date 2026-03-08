"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var GeminiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const vertexai_1 = require("@google-cloud/vertexai");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const mock_data_1 = require("../mock-data");
const api_usage_service_1 = require("./api-usage.service");
let GeminiService = GeminiService_1 = class GeminiService {
    apiUsageService;
    logger = new common_1.Logger(GeminiService_1.name);
    aiStudioClient = null;
    vertexClient = null;
    projectId = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || 'project-c64b9be9-1d92-4bc6-be7';
    location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    apiKey = process.env.GEMINI_API_KEY;
    modelName = 'gemini-2.0-flash';
    mockRequestCounter = 0;
    cacheDir = path.join(process.cwd(), '.cache', 'gemini');
    constructor(apiUsageService) {
        this.apiUsageService = apiUsageService;
        this.initializeClients();
        this.initializeCache();
    }
    initializeClients() {
        this.logger.log(`[GEMINI INIT] API Key present: ${!!this.apiKey}, Length: ${this.apiKey?.length || 0}`);
        this.logger.log(`[GEMINI INIT] Project ID: ${this.projectId}, Location: ${this.location}`);
        if (this.apiKey) {
            try {
                this.aiStudioClient = new generative_ai_1.GoogleGenerativeAI(this.apiKey);
                this.logger.log('[GEMINI INIT] AI Studio client initialized successfully');
            }
            catch (e) {
                this.logger.error(`[GEMINI INIT] Failed to initialize AI Studio client: ${e.message}`);
            }
        }
        else {
            this.logger.warn('[GEMINI INIT] No API Key found - AI Studio client will be null');
        }
        try {
            this.vertexClient = new vertexai_1.VertexAI({ project: this.projectId, location: this.location });
            this.logger.log('[GEMINI INIT] Vertex AI client initialized successfully');
        }
        catch (e) {
            this.logger.warn(`[GEMINI INIT] Failed to initialize Vertex AI client: ${e.message}`);
        }
    }
    initializeCache() {
        if (!fs.existsSync(this.cacheDir)) {
            try {
                fs.mkdirSync(this.cacheDir, { recursive: true });
                this.logger.log(`Initialized Gemini cache directory at ${this.cacheDir}`);
            }
            catch (e) {
                this.logger.error(`Failed to create cache directory: ${e.message}`);
            }
        }
    }
    getCacheKey(prompt) {
        return crypto.createHash('sha256').update(prompt).digest('hex');
    }
    getFromCache(key) {
        try {
            const filePath = path.join(this.cacheDir, `${key}.json`);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                const p = JSON.parse(content);
                const created = new Date(p.timestamp);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - created.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 90) {
                    this.logger.log(`[CACHE EXPIRY] Item ${key.substring(0, 8)} is older than 90 days. Invalidating.`);
                    fs.unlinkSync(filePath);
                    return null;
                }
                return p.response;
            }
        }
        catch (e) {
        }
        return null;
    }
    saveToCache(key, response) {
        try {
            const filePath = path.join(this.cacheDir, `${key}.json`);
            fs.writeFileSync(filePath, JSON.stringify({
                timestamp: new Date().toISOString(),
                response
            }));
        }
        catch (e) {
            this.logger.warn(`Failed to write to cache: ${e.message}`);
        }
    }
    async generateContent(prompt, userId, context) {
        const cacheKey = this.getCacheKey(prompt);
        const cachedResponse = this.getFromCache(cacheKey);
        if (cachedResponse) {
            this.logger.debug(`[CACHE HIT] Gemini response served from disk (${cacheKey.substring(0, 8)})`);
            return cachedResponse;
        }
        const startTime = Date.now();
        let resultText = '';
        let status = 'success';
        let errorMessage;
        try {
            resultText = await this.executeGeneration(prompt);
            if (resultText && !resultText.startsWith('{ "error":')) {
                this.saveToCache(cacheKey, resultText);
            }
        }
        catch (e) {
            status = 'error';
            errorMessage = e.message;
            throw e;
        }
        finally {
            if (process.env.USE_MOCK_AI !== 'true' && this.apiUsageService) {
                const responseTimeMs = Date.now() - startTime;
                const tokensUsed = Math.ceil((prompt.length + (resultText?.length || 0)) / 4);
                await this.apiUsageService.logCall({
                    service: 'gemini',
                    endpoint: this.modelName + (context ? `:${context}` : ''),
                    userId,
                    requestPayload: prompt.substring(0, 200),
                    status,
                    errorMessage,
                    tokensUsed,
                    responseTimeMs,
                }).catch(() => { });
            }
        }
        return resultText;
    }
    async checkConnectivity() {
        if (process.env.USE_MOCK_AI === 'true')
            return true;
        try {
            if (this.aiStudioClient) {
                const model = this.aiStudioClient.getGenerativeModel({ model: this.modelName });
                if (model)
                    return true;
            }
            if (this.vertexClient) {
                const model = this.vertexClient.getGenerativeModel({ model: this.modelName });
                if (model)
                    return true;
            }
            return false;
        }
        catch (e) {
            this.logger.error(`Connectivity check failed: ${e.message}`);
            return false;
        }
    }
    async executeGeneration(prompt) {
        this.logger.log(`[GEMINI] executeGeneration called. Prompt length: ${prompt.length} chars`);
        this.logger.log(`[GEMINI] aiStudioClient: ${!!this.aiStudioClient}, apiKey: ${!!this.apiKey}, vertexClient: ${!!this.vertexClient}`);
        if (process.env.USE_MOCK_AI === 'true') {
            this.logger.warn('Mock AI enabled via USE_MOCK_AI env var. Returning MOCK data.');
            return this.getMockResponse(prompt);
        }
        try {
            if (this.aiStudioClient) {
                this.logger.log('[GEMINI] Trying AI Studio with API Key...');
                const model = this.aiStudioClient.getGenerativeModel({ model: this.modelName });
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }]
                });
                const text = result.response.text();
                this.logger.log(`[GEMINI] AI Studio SUCCESS - response length: ${text.length} chars`);
                return text;
            }
            else {
                this.logger.warn('[GEMINI] AI Studio client is null - skipping');
            }
        }
        catch (e) {
            this.logger.error(`[GEMINI] AI Studio FAILED: ${e.message}`);
            this.logger.error(`[GEMINI] AI Studio error details: ${JSON.stringify(e, null, 2).substring(0, 500)}`);
        }
        if (this.apiKey) {
            const url = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.modelName}:generateContent?key=${this.apiKey}`;
            try {
                this.logger.log(`[GEMINI] Trying Vertex REST with URL: ${url.substring(0, 100)}...`);
                const { data } = await axios_1.default.post(url, {
                    contents: [{ role: 'user', parts: [{ text: prompt }] }]
                });
                if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    const text = data.candidates[0].content.parts[0].text;
                    this.logger.log(`[GEMINI] Vertex REST SUCCESS - response length: ${text.length} chars`);
                    return text;
                }
            }
            catch (e) {
                this.logger.error(`[GEMINI] Vertex REST FAILED: ${e.message}`);
                this.logger.error(`[GEMINI] Vertex REST error response: ${JSON.stringify(e.response?.data, null, 2).substring(0, 500)}`);
            }
        }
        else {
            this.logger.warn('[GEMINI] No API Key - skipping Vertex REST');
        }
        try {
            if (this.vertexClient) {
                this.logger.log('[GEMINI] Trying Vertex SDK with ADC...');
                const model = this.vertexClient.getGenerativeModel({ model: this.modelName });
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }]
                });
                const text = result.response.candidates?.[0].content.parts[0].text;
                if (text) {
                    this.logger.log(`[GEMINI] Vertex SDK SUCCESS - response length: ${text.length} chars`);
                    return text;
                }
            }
            else {
                this.logger.warn('[GEMINI] Vertex SDK client is null - skipping');
            }
        }
        catch (e) {
            console.error('VERTEX SDK ERROR DETAILS:', JSON.stringify(e, null, 2));
            this.logger.error(`[GEMINI] Vertex SDK FAILED: ${e.message}`, e.stack);
        }
        this.logger.error('[GEMINI] ALL METHODS FAILED - throwing error');
        throw new Error('All Gemini generation methods failed. Check API Key, Project ID, or Permissions.');
    }
    getMockResponse(prompt) {
        this.mockRequestCounter++;
        if (prompt.includes('Ekspert') && prompt.includes('Sourcingu') || prompt.includes('Industrial Sourcing Strategist')) {
            return (0, mock_data_1.getMockStrategy)(prompt);
        }
        if (prompt.includes('Analitykiem Skautingu') || prompt.includes('Procurement Analyst') || prompt.includes('capability_match_score')) {
            return (0, mock_data_1.getMockAnalyst)(this.mockRequestCounter, prompt);
        }
        if (prompt.includes('Skautem Przemysłowym') || prompt.includes('Oceń czy strona')) {
            return (0, mock_data_1.getMockExplorerRelevant)("http://simulated-url.com", prompt);
        }
        if (prompt.includes('Inżynier') || prompt.includes('Data Enrichment') || prompt.includes('enriched_data')) {
            const emailMatch = prompt.match(/ZNALEZIONE EMAILE:\s*(.+)/);
            const emails = emailMatch?.[1]?.split(',').map(e => e.trim()).filter(Boolean) || ['info@example.com'];
            const nameMatch = prompt.match(/"company_name":\s*"([^"]+)"/);
            const companyName = nameMatch?.[1] || 'Unknown Company';
            return JSON.stringify({
                enriched_data: {
                    company_name: companyName,
                    contact_emails: emails,
                    country: 'Poland',
                    specialization: 'Manufacturing',
                },
                verification: {
                    is_verified_manufacturer: true,
                    has_contact_email: emails.length > 0,
                    confidence_score: 70,
                    verification_notes: 'Mock enrichment - real AI needed for full verification',
                }
            });
        }
        if (prompt.includes('Compliance') || prompt.includes('Porównaj dane') || prompt.includes('golden_record')) {
            const match = prompt.match(/"company_name":\s*"([^"]+)"/);
            const extractedData = match ? { extracted_data: { company_name: match[1] } } : { extracted_data: { company_name: "Mock Company " + this.mockRequestCounter } };
            return (0, mock_data_1.getMockAuditor)(extractedData);
        }
        this.logger.warn(`[MOCK] No mock pattern matched for prompt: ${prompt.substring(0, 80)}...`);
        return JSON.stringify({ capability_match_score: 60, extracted_data: { company_name: "Unmatched Mock " + this.mockRequestCounter } });
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => api_usage_service_1.ApiUsageService))),
    __metadata("design:paramtypes", [api_usage_service_1.ApiUsageService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map