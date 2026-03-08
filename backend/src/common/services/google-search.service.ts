import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import axios from 'axios';
import { ApiUsageService } from './api-usage.service';

/**
 * Search budget tracker per campaign
 * Prevents runaway API costs
 */
class SearchBudget {
  private usage = new Map<string, number>();
  private readonly maxPerCampaign: number;

  constructor(max: number) {
    this.maxPerCampaign = max;
  }

  canSearch(campaignId?: string): boolean {
    if (!campaignId) return true;
    return (this.usage.get(campaignId) || 0) < this.maxPerCampaign;
  }

  record(campaignId?: string): void {
    if (!campaignId) return;
    this.usage.set(campaignId, (this.usage.get(campaignId) || 0) + 1);
  }

  remaining(campaignId?: string): number {
    if (!campaignId) return this.maxPerCampaign;
    return this.maxPerCampaign - (this.usage.get(campaignId) || 0);
  }

  used(campaignId?: string): number {
    if (!campaignId) return 0;
    return this.usage.get(campaignId) || 0;
  }
}

export type SearchPurpose = 'main' | 'email';
type SearchProvider = 'serpapi' | 'serper';

@Injectable()
export class GoogleSearchService {
  private readonly logger = new Logger(GoogleSearchService.name);
  private serpApiKey = process.env.SERP_API_KEY || '';
  private serperApiKey = process.env.SERPER_API_KEY || '';
  private provider: SearchProvider;
  private budget: SearchBudget;

  // Rate limiting
  private lastRequestTime = 0;
  private readonly MIN_DELAY_MS = parseInt(process.env.MIN_SEARCH_DELAY_MS || '200', 10);
  private requestQueue: Promise<void> = Promise.resolve();

  constructor(
    @Inject(forwardRef(() => ApiUsageService))
    private readonly apiUsageService?: ApiUsageService,
  ) {
    // Determine provider
    const configuredProvider = (process.env.SEARCH_PROVIDER || 'serpapi').toLowerCase();
    if (configuredProvider === 'serper' && this.serperApiKey) {
      this.provider = 'serper';
    } else {
      this.provider = 'serpapi';
    }

    const maxSearches = parseInt(process.env.MAX_SEARCHES_PER_CAMPAIGN || '1500', 10);
    this.budget = new SearchBudget(maxSearches);

    const hasKey = this.provider === 'serper'
      ? !!this.serperApiKey
      : !!this.serpApiKey && this.serpApiKey !== 'PLACEHOLDER_KEY';

    this.logger.log(`[SEARCH INIT] Provider: ${this.provider}, API Key present: ${hasKey}, Budget: ${maxSearches}/campaign`);
    if (!hasKey) {
      this.logger.warn('[SEARCH INIT] Running in MOCK MODE - will return example.com results');
    }
  }

  private get hasValidKey(): boolean {
    if (this.provider === 'serper') return !!this.serperApiKey;
    return !!this.serpApiKey && this.serpApiKey !== 'PLACEHOLDER_KEY';
  }

  async search(query: string, userId?: string, campaignId?: string): Promise<string[]> {
    const results = await this.searchExtended(query, undefined, userId, campaignId);
    return results.map(r => r.link);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async rateLimitedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
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
        if (e.response?.status === 429 || e.message?.includes('429')) {
          const delay = baseDelayMs * Math.pow(2, attempt);
          this.logger.warn(`[RATE LIMIT] Attempt ${attempt + 1}/${maxRetries}, waiting ${delay}ms...`);
          await this.delay(delay);
        } else {
          throw e;
        }
      }
    }
    throw lastError;
  }

  /**
   * Check remaining search budget for a campaign
   * Note: purpose parameter kept for API compatibility but ignored (single budget)
   */
  getRemainingBudget(campaignId?: string, _purpose: SearchPurpose = 'main'): number {
    return this.budget.remaining(campaignId);
  }

  /**
   * Extended search returning title, link, snippet
   * Supports both SerpAPI and Serper.dev
   */
  async searchExtended(
    query: string,
    options?: { gl?: string; hl?: string; num?: number },
    userId?: string,
    campaignId?: string,
    _purpose: SearchPurpose = 'main'
  ): Promise<{ title: string; link: string; snippet: string }[]> {
    // Budget check (single budget for all searches)
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

    // Record budget usage
    this.budget.record(campaignId);

    const startTime = Date.now();
    let status: 'success' | 'error' = 'success';
    let errorMessage: string | undefined;
    let results: { title: string; link: string; snippet: string }[] = [];

    try {
      if (this.provider === 'serper') {
        results = await this.searchWithSerper(query, options);
      } else {
        results = await this.searchWithSerpApi(query, options);
      }
    } catch (e: any) {
      status = 'error';
      errorMessage = e.message;
      this.logger.error(`[SEARCH] ${this.provider} failed: ${e.message}`);
    } finally {
      if (this.apiUsageService) {
        await this.apiUsageService.logCall({
          service: this.provider,
          endpoint: 'searchExtended',
          userId,
          requestPayload: query.substring(0, 200),
          status,
          errorMessage,
          responseTimeMs: Date.now() - startTime,
        }).catch(() => {});
      }
    }

    return results;
  }

  /**
   * SerpAPI implementation
   */
  private async searchWithSerpApi(
    query: string,
    options?: { gl?: string; hl?: string; num?: number }
  ): Promise<{ title: string; link: string; snippet: string }[]> {
    const response = await this.withRetry(async () => {
      return axios.get('https://serpapi.com/search.json', {
        params: {
          engine: 'google',
          q: query,
          api_key: this.serpApiKey,
          num: options?.num || 30,
          gl: options?.gl || 'us',
          hl: options?.hl || 'en'
        },
        timeout: 30000
      });
    });

    if (response.data.organic_results) {
      const results = response.data.organic_results.map((r: any) => ({
        title: r.title || '',
        link: r.link || '',
        snippet: r.snippet || ''
      }));
      this.logger.log(`[SERPAPI] Found ${results.length} results`);
      return results;
    }
    return [];
  }

  /**
   * Serper.dev implementation (10x cheaper: $50/50k vs $50/5k)
   * API docs: https://serper.dev/docs
   */
  private async searchWithSerper(
    query: string,
    options?: { gl?: string; hl?: string; num?: number }
  ): Promise<{ title: string; link: string; snippet: string }[]> {
    const response = await this.withRetry(async () => {
      return axios.post('https://google.serper.dev/search', {
        q: query,
        gl: options?.gl || 'us',
        hl: options?.hl || 'en',
        num: options?.num || 30,
      }, {
        headers: {
          'X-API-KEY': this.serperApiKey,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
    });

    if (response.data.organic) {
      const results = response.data.organic.map((r: any) => ({
        title: r.title || '',
        link: r.link || '',
        snippet: r.snippet || ''
      }));
      this.logger.log(`[SERPER] Found ${results.length} results`);
      return results;
    }
    return [];
  }

  /**
   * Search with global/international focus
   */
  async searchGlobal(query: string, userId?: string, campaignId?: string): Promise<{ title: string; link: string; snippet: string }[]> {
    return this.searchExtended(query, { gl: 'us', hl: 'en', num: 15 }, userId, campaignId);
  }
}
