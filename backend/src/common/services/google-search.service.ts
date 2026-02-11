import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import axios from 'axios';
import { ApiUsageService } from './api-usage.service';

@Injectable()
export class GoogleSearchService {
  private readonly logger = new Logger(GoogleSearchService.name);
  private apiKey = process.env.SERP_API_KEY || 'PLACEHOLDER_KEY';

  // Rate limiting - MAX 200/hour on Starter Plan
  private lastRequestTime = 0;
  private readonly MIN_DELAY_MS = 1500; // 1.5s between requests to avoid throttling
  private requestQueue: Promise<void> = Promise.resolve();

  constructor(
    @Inject(forwardRef(() => ApiUsageService))
    private readonly apiUsageService?: ApiUsageService,
  ) {
    this.logger.log(`[SERP INIT] API Key present: ${!!this.apiKey && this.apiKey !== 'PLACEHOLDER_KEY'}, Value: ${this.apiKey?.substring(0, 10)}...`);
    if (!this.apiKey || this.apiKey === 'PLACEHOLDER_KEY') {
      this.logger.warn('[SERP INIT] Running in MOCK MODE - will return example.com results');
    }
  }

  async search(query: string, userId?: string): Promise<string[]> {
    const results = await this.searchExtended(query, undefined, userId);
    return results.map(r => r.link);
  }

  /**
   * Delay helper for rate limiting
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute request with rate limiting
   */
  private async rateLimitedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    // Queue requests to ensure serial execution
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

  /**
   * Execute with retry on 429
   */
  private async withRetry<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 2000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.rateLimitedRequest(requestFn);
      } catch (e: any) {
        lastError = e;

        // Check if 429 rate limit error
        if (e.response?.status === 429 || e.message?.includes('429')) {
          const delay = baseDelayMs * Math.pow(2, attempt); // Exponential backoff
          this.logger.warn(`[RATE LIMIT] Attempt ${attempt + 1}/${maxRetries}, waiting ${delay}ms...`);
          await this.delay(delay);
        } else {
          throw e; // Other errors - don't retry
        }
      }
    }

    throw lastError;
  }

  /**
   * Extended search returning title, link, snippet
   */
  async searchExtended(
    query: string,
    options?: { gl?: string; hl?: string; num?: number },
    userId?: string
  ): Promise<{ title: string; link: string; snippet: string }[]> {
    this.logger.log(`Searching: ${query.substring(0, 50)}...`);

    if (!this.apiKey || this.apiKey === 'PLACEHOLDER_KEY') {
      // Mock mode - don't log
      return [
        { title: "Mock 1", link: "https://example.com/1", snippet: "Mock Company Manufacturer info@example.com" },
        { title: "Mock 2", link: "https://example.com/2", snippet: "Mock Company Producer sales@example.com" }
      ];
    }

    const startTime = Date.now();
    let status: 'success' | 'error' = 'success';
    let errorMessage: string | undefined;
    let results: { title: string; link: string; snippet: string }[] = [];

    try {
      const response = await this.withRetry(async () => {
        return axios.get('https://serpapi.com/search.json', {
          params: {
            engine: 'google',
            q: query,
            api_key: this.apiKey,
            num: options?.num || 10,
            gl: options?.gl || 'pl',
            hl: options?.hl || 'pl'
          },
          timeout: 30000
        });
      });

      if (response.data.organic_results) {
        results = response.data.organic_results.map((r: any) => ({
          title: r.title || '',
          link: r.link || '',
          snippet: r.snippet || ''
        }));
        this.logger.log(`Found ${results.length} results for: ${query.substring(0, 30)}...`);
      }
    } catch (e: any) {
      status = 'error';
      errorMessage = e.message;
      this.logger.error(`SerpApi failed: ${e.message}`);
    } finally {
      // Log API usage
      if (this.apiUsageService) {
        await this.apiUsageService.logCall({
          service: 'serpapi',
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

  /**
   * Search with global/international focus for maximum supplier discovery
   */
  async searchGlobal(query: string, userId?: string): Promise<{ title: string; link: string; snippet: string }[]> {
    this.logger.log(`Searching (Global): ${query.substring(0, 50)}...`);

    if (!this.apiKey || this.apiKey === 'PLACEHOLDER_KEY') {
      return [];
    }

    const startTime = Date.now();
    let status: 'success' | 'error' = 'success';
    let errorMessage: string | undefined;
    let results: { title: string; link: string; snippet: string }[] = [];

    try {
      const response = await this.withRetry(async () => {
        return axios.get('https://serpapi.com/search.json', {
          params: {
            engine: 'google',
            q: query,
            api_key: this.apiKey,
            num: 15,
            gl: 'us',
            hl: 'en'
          },
          timeout: 30000
        });
      });

      if (response.data.organic_results) {
        results = response.data.organic_results.map((r: any) => ({
          title: r.title || '',
          link: r.link || '',
          snippet: r.snippet || ''
        }));
      }
    } catch (e: any) {
      status = 'error';
      errorMessage = e.message;
      this.logger.error(`SerpApi (global) failed: ${e.message}`);
    } finally {
      // Log API usage
      if (this.apiUsageService) {
        await this.apiUsageService.logCall({
          service: 'serpapi',
          endpoint: 'searchGlobal',
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
}
