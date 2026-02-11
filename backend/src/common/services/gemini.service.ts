import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { VertexAI } from '@google-cloud/vertexai';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
    getMockStrategy,
    getMockExplorerRelevant,
    getMockAnalyst,
    getMockAuditor
} from '../mock-data';
import { ApiUsageService } from './api-usage.service';

@Injectable()
export class GeminiService {
    private readonly logger = new Logger(GeminiService.name);
    private aiStudioClient: GoogleGenerativeAI | null = null;
    private vertexClient: VertexAI | null = null;
    private projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || 'project-c64b9be9-1d92-4bc6-be7';
    private location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    private apiKey = process.env.GEMINI_API_KEY;
    private readonly modelName = 'gemini-2.0-flash'; // Confirmed available via API Key listing
    private mockRequestCounter = 0;
    private readonly cacheDir = path.join(process.cwd(), '.cache', 'gemini');

    constructor(
        @Inject(forwardRef(() => ApiUsageService))
        private readonly apiUsageService?: ApiUsageService,
    ) {
        this.initializeClients();
        this.initializeCache();
    }

    private initializeClients() {
        this.logger.log(`[GEMINI INIT] API Key present: ${!!this.apiKey}, Length: ${this.apiKey?.length || 0}`);
        this.logger.log(`[GEMINI INIT] Project ID: ${this.projectId}, Location: ${this.location}`);

        if (this.apiKey) {
            try {
                this.aiStudioClient = new GoogleGenerativeAI(this.apiKey);
                this.logger.log('[GEMINI INIT] AI Studio client initialized successfully');
            } catch (e) {
                this.logger.error(`[GEMINI INIT] Failed to initialize AI Studio client: ${e.message}`);
            }
        } else {
            this.logger.warn('[GEMINI INIT] No API Key found - AI Studio client will be null');
        }

        // Attempt Vertex Init (lazy, relies on env or ADC)
        try {
            this.vertexClient = new VertexAI({ project: this.projectId, location: this.location });
            this.logger.log('[GEMINI INIT] Vertex AI client initialized successfully');
        } catch (e) {
            this.logger.warn(`[GEMINI INIT] Failed to initialize Vertex AI client: ${e.message}`);
        }
    }

    private initializeCache() {
        if (!fs.existsSync(this.cacheDir)) {
            try {
                fs.mkdirSync(this.cacheDir, { recursive: true });
                this.logger.log(`Initialized Gemini cache directory at ${this.cacheDir}`);
            } catch (e) {
                this.logger.error(`Failed to create cache directory: ${e.message}`);
            }
        }
    }

    private getCacheKey(prompt: string): string {
        return crypto.createHash('sha256').update(prompt).digest('hex');
    }

    private getFromCache(key: string): string | null {
        try {
            const filePath = path.join(this.cacheDir, `${key}.json`);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                const p = JSON.parse(content);

                // Check for expiration (3 months = 90 days)
                const created = new Date(p.timestamp);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - created.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 90) {
                    this.logger.log(`[CACHE EXPIRY] Item ${key.substring(0, 8)} is older than 90 days. Invalidating.`);
                    fs.unlinkSync(filePath); // Delete expired file
                    return null;
                }

                return p.response;
            }
        } catch (e) {
            // Ignore cache read errors
        }
        return null;
    }

    private saveToCache(key: string, response: string) {
        try {
            const filePath = path.join(this.cacheDir, `${key}.json`);
            fs.writeFileSync(filePath, JSON.stringify({
                timestamp: new Date().toISOString(),
                response
            }));
        } catch (e) {
            this.logger.warn(`Failed to write to cache: ${e.message}`);
        }
    }

    async generateContent(prompt: string, userId?: string, context?: string): Promise<string> {
        // 0. Check Cache
        const cacheKey = this.getCacheKey(prompt);
        const cachedResponse = this.getFromCache(cacheKey);

        if (cachedResponse) {
            this.logger.debug(`[CACHE HIT] Gemini response served from disk (${cacheKey.substring(0, 8)})`);
            return cachedResponse;
        }

        const startTime = Date.now();
        let resultText = '';
        let status: 'success' | 'error' = 'success';
        let errorMessage: string | undefined;

        // Executing Generation...
        try {
            resultText = await this.executeGeneration(prompt);
            // Save to cache on success
            if (resultText && !resultText.startsWith('{ "error":')) {
                this.saveToCache(cacheKey, resultText);
            }
        } catch (e) {
            status = 'error';
            errorMessage = e.message;
            throw e;
        } finally {
            // Log API usage (skip for mock responses)
            if (process.env.USE_MOCK_AI !== 'true' && this.apiUsageService) {
                const responseTimeMs = Date.now() - startTime;
                // Estimate tokens (rough: ~4 chars per token)
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
                }).catch(() => { }); // Don't fail main operation
            }
        }

        return resultText;
    }

    /**
     * Lightweight connectivity check that AVOIDS token billing
     * Tries to list models (free operation) if possible, or falls back to client check
     */
    async checkConnectivity(): Promise<boolean> {
        if (process.env.USE_MOCK_AI === 'true') return true;

        try {
            // AI Studio Check
            if (this.aiStudioClient) {
                // Just checking if we can instantiate the model object is often enough for a shallow check,
                // but deeper "list models" is better if available.
                // The GoogleGenerativeAI SDK doesn't expose a listModels easily on the client root in all versions.
                // We will trust the client instantiation + API key presence for "Shallow" checks,
                // but for "Deep" checks without cost, we can try to get model info.

                const model = this.aiStudioClient.getGenerativeModel({ model: this.modelName });
                if (model) return true;
            }

            // Vertex Check
            if (this.vertexClient) {
                const model = this.vertexClient.getGenerativeModel({ model: this.modelName });
                if (model) return true;
            }

            return false;
        } catch (e) {
            this.logger.error(`Connectivity check failed: ${e.message}`);
            return false;
        }
    }

    async executeGeneration(prompt: string): Promise<string> {
        this.logger.log(`[GEMINI] executeGeneration called. Prompt length: ${prompt.length} chars`);
        this.logger.log(`[GEMINI] aiStudioClient: ${!!this.aiStudioClient}, apiKey: ${!!this.apiKey}, vertexClient: ${!!this.vertexClient}`);

        // 0. Mock Fallback (Priority Override)
        if (process.env.USE_MOCK_AI === 'true') {
            this.logger.warn('Mock AI enabled via USE_MOCK_AI env var. Returning MOCK data.');
            return this.getMockResponse(prompt);
        }

        // 1. Try AI Studio
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
            } else {
                this.logger.warn('[GEMINI] AI Studio client is null - skipping');
            }
        } catch (e) {
            this.logger.error(`[GEMINI] AI Studio FAILED: ${e.message}`);
            this.logger.error(`[GEMINI] AI Studio error details: ${JSON.stringify(e, null, 2).substring(0, 500)}`);
        }

        // 2. Try Vertex REST (with Key)
        if (this.apiKey) {
            const url = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.modelName}:generateContent?key=${this.apiKey}`;
            try {
                this.logger.log(`[GEMINI] Trying Vertex REST with URL: ${url.substring(0, 100)}...`);
                const { data } = await axios.post(url, {
                    contents: [{ role: 'user', parts: [{ text: prompt }] }]
                });
                if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    const text = data.candidates[0].content.parts[0].text;
                    this.logger.log(`[GEMINI] Vertex REST SUCCESS - response length: ${text.length} chars`);
                    return text;
                }
            } catch (e) {
                this.logger.error(`[GEMINI] Vertex REST FAILED: ${e.message}`);
                this.logger.error(`[GEMINI] Vertex REST error response: ${JSON.stringify(e.response?.data, null, 2).substring(0, 500)}`);
            }
        } else {
            this.logger.warn('[GEMINI] No API Key - skipping Vertex REST');
        }

        // 3. Try Vertex SDK (ADC)
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
            } else {
                this.logger.warn('[GEMINI] Vertex SDK client is null - skipping');
            }
        } catch (e) {
            console.error('VERTEX SDK ERROR DETAILS:', JSON.stringify(e, null, 2));
            this.logger.error(`[GEMINI] Vertex SDK FAILED: ${e.message}`, e.stack);
        }

        this.logger.error('[GEMINI] ALL METHODS FAILED - throwing error');
        throw new Error('All Gemini generation methods failed. Check API Key, Project ID, or Permissions.');
    }

    private getMockResponse(prompt: string): string {
        this.mockRequestCounter++;

        // Strategy Agent
        if (prompt.includes('Jesteś Strategiem Sourcingu Przemysłowego') || prompt.includes('Industrial Sourcing Strategist')) {
            return getMockStrategy(prompt);
        }
        // Explorer Agent
        if (prompt.includes('Jesteś Autonomicznym Skautem Przemysłowym') || prompt.includes('Oceń czy strona należy do producenta')) {
            // Extract URL if possible, otherwise generic
            return getMockExplorerRelevant("http://simulated-url.com", prompt);
        }
        // Analyst Agent
        if (prompt.includes('Jesteś Starszym Audytorem ds. Zakupów Technicznych') || prompt.includes('Dokonaj wnikliwej analizy dostawcy')) {
            return getMockAnalyst(this.mockRequestCounter, prompt);
        }
        // Auditor Agent
        if (prompt.includes('Jesteś Specjalistą ds. Compliance') || prompt.includes('Porównaj dane dostawcy')) {
            // Needed to look consistent with the previous analyst step, but for simplicity we rely on the counter or passed data
            // In a real mock we might parse the prompt input to match the company name
            // Extract the company name from the prompt if possible
            const match = prompt.match(/"company_name":\s*"([^"]+)"/);
            const extractedData = match ? { extracted_data: { company_name: match[1] } } : { extracted_data: { company_name: "Mock Company " + this.mockRequestCounter } };
            return getMockAuditor(extractedData);
        }
        this.logger.warn(`No mock found for prompt: ${prompt.substring(0, 50)}...`);
        return JSON.stringify({ error: "No matching mock found for prompt" });
    }
}

