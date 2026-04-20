import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { VertexAI } from '@google-cloud/vertexai';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';
import {
    getMockStrategy,
    getMockExplorerRelevant,
    getMockAnalyst,
    getMockAuditor
} from '../mock-data';
import { ApiUsageService } from './api-usage.service';
import { ErrorTrackingService } from './error-tracking.service';

@Injectable()
export class GeminiService {
    private readonly logger = new Logger(GeminiService.name);
    private aiStudioClient: GoogleGenerativeAI | null = null;
    private vertexClient: VertexAI | null = null;
    private projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID || 'project-c64b9be9-1d92-4bc6-be7';
    private location = process.env.GOOGLE_CLOUD_LOCATION || 'europe-west1';
    private apiKey = process.env.GEMINI_API_KEY;
    private readonly modelName = 'gemini-2.0-flash'; // Confirmed available via API Key listing
    private readonly GEMINI_TIMEOUT_MS = parseInt(process.env.GEMINI_TIMEOUT_MS || '45000', 10); // 45s per call
    private mockRequestCounter = 0;
    // Cloud Functions have read-only filesystem except /tmp
    private readonly cacheDir = path.join(
        process.env.K_SERVICE ? os.tmpdir() : process.cwd(),
        '.cache', 'gemini'
    );

    constructor(
        @Inject(forwardRef(() => ApiUsageService))
        private readonly apiUsageService?: ApiUsageService,
        @Inject(forwardRef(() => ErrorTrackingService))
        private readonly errorTrackingService?: ErrorTrackingService,
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

    // Circuit breaker: track consecutive failures to back off when Gemini is overloaded
    private consecutiveFailures = 0;
    private lastFailureTime = 0;
    private readonly MAX_RETRIES = parseInt(process.env.GEMINI_MAX_RETRIES || '4', 10);
    private readonly CIRCUIT_BREAKER_THRESHOLD = 8; // After 8 consecutive failures, add cooldown
    private readonly CIRCUIT_BREAKER_COOLDOWN_MS = 30_000; // 30s cooldown when circuit open

    async generateContent(prompt: string, userId?: string, context?: string): Promise<string> {
        // 0. Check Cache
        const cacheKey = this.getCacheKey(prompt);
        const cachedResponse = this.getFromCache(cacheKey);

        if (cachedResponse) {
            this.logger.debug(`[CACHE HIT] Gemini response served from disk (${cacheKey.substring(0, 8)})`);
            return cachedResponse;
        }

        // Circuit breaker: if many consecutive failures, wait before retrying
        if (this.consecutiveFailures >= this.CIRCUIT_BREAKER_THRESHOLD) {
            const timeSinceLastFailure = Date.now() - this.lastFailureTime;
            if (timeSinceLastFailure < this.CIRCUIT_BREAKER_COOLDOWN_MS) {
                const waitMs = this.CIRCUIT_BREAKER_COOLDOWN_MS - timeSinceLastFailure;
                this.logger.warn(`[GEMINI] Circuit breaker active (${this.consecutiveFailures} failures) — waiting ${waitMs}ms`);
                await new Promise(r => setTimeout(r, waitMs));
            }
        }

        const startTime = Date.now();
        let resultText = '';
        let status: 'success' | 'error' = 'success';
        let errorMessage: string | undefined;
        let lastError: Error | undefined;

        // Retry with exponential backoff
        for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
            if (attempt > 0) {
                const jitter = Math.floor(Math.random() * 2000);
                const backoffMs = Math.min(3000 * Math.pow(2, attempt - 1), 30000) + jitter; // 3s, 6s, 12s, 24s + jitter
                this.logger.warn(`[GEMINI] Retry ${attempt}/${this.MAX_RETRIES} after ${backoffMs}ms backoff (jitter=${jitter}ms)`);
                await new Promise(r => setTimeout(r, backoffMs));
            }

            try {
                resultText = await Promise.race([
                    this.executeGeneration(prompt),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error(`Gemini API timeout after ${this.GEMINI_TIMEOUT_MS}ms`)), this.GEMINI_TIMEOUT_MS)
                    ),
                ]);
                // Success — reset circuit breaker
                this.consecutiveFailures = 0;
                // Save to cache on success
                if (resultText && !resultText.startsWith('{ "error":')) {
                    this.saveToCache(cacheKey, resultText);
                }
                lastError = undefined;
                break; // Success — exit retry loop
            } catch (e) {
                lastError = e;
                this.consecutiveFailures++;
                this.lastFailureTime = Date.now();
                const isTimeout = e.message?.includes('timeout');
                const isRetryable = isTimeout || e.message?.includes('429') || e.message?.includes('503') || e.message?.includes('RESOURCE_EXHAUSTED');

                if (!isRetryable || attempt >= this.MAX_RETRIES) {
                    status = 'error';
                    errorMessage = e.message;
                    if (this.errorTrackingService) {
                        this.errorTrackingService.recordError(e, {
                            type: 'API_ERROR',
                            service: 'gemini',
                            context: { prompt: prompt.substring(0, 200), userId, context, attempt, consecutiveFailures: this.consecutiveFailures },
                        });
                    }
                    break; // Non-retryable or max retries exhausted
                }
                this.logger.warn(`[GEMINI] Attempt ${attempt + 1} failed (${isTimeout ? 'timeout' : e.message}) — will retry`);
            }
        }

        // Log API usage
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

        if (lastError) {
            throw lastError;
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

        // 2. Try Vertex SDK (ADC) — Vertex REST with API key is not supported, only OAuth2/ADC
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
        if (prompt.includes('Ekspert') && prompt.includes('Sourcingu') || prompt.includes('Industrial Sourcing Strategist')) {
            return getMockStrategy(prompt);
        }
        // Screener Agent (merged Explorer + Analyst)
        if (prompt.includes('Skautem i Analitykiem Przemysłowym') || prompt.includes('Industrial Screener')) {
            return getMockAnalyst(this.mockRequestCounter, prompt);
        }
        // Legacy Analyst Agent
        if (prompt.includes('Analitykiem Skautingu') || prompt.includes('Procurement Analyst') || prompt.includes('capability_match_score')) {
            return getMockAnalyst(this.mockRequestCounter, prompt);
        }
        // Legacy Explorer Agent
        if (prompt.includes('Skautem Przemysłowym') || prompt.includes('Oceń czy strona')) {
            return getMockExplorerRelevant("http://simulated-url.com", prompt);
        }
        // Enrichment Agent (Data Enrichment Specialist / Inżynier Danych)
        if (prompt.includes('Inżynier') || prompt.includes('Data Enrichment') || prompt.includes('enriched_data')) {
            // Return a passthrough that preserves the emails from the prompt
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
        // Auditor Agent
        if (prompt.includes('Compliance') || prompt.includes('Porównaj dane') || prompt.includes('golden_record')) {
            const match = prompt.match(/"company_name":\s*"([^"]+)"/);
            const extractedData = match ? { extracted_data: { company_name: match[1] } } : { extracted_data: { company_name: "Mock Company " + this.mockRequestCounter } };
            return getMockAuditor(extractedData);
        }
        this.logger.warn(`[MOCK] No mock pattern matched for prompt: ${prompt.substring(0, 80)}...`);
        return JSON.stringify({ capability_match_score: 60, extracted_data: { company_name: "Unmatched Mock " + this.mockRequestCounter } });
    }
}

