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

@Injectable()
export class GoogleSearchService {
  private readonly logger = new Logger(GoogleSearchService.name);
  private serperApiKey = process.env.SERPER_API_KEY || '';
  private budget: SearchBudget;

  // Rate limiting
  private lastRequestTime = 0;
  private readonly MIN_DELAY_MS = parseInt(process.env.MIN_SEARCH_DELAY_MS || '200', 10);
  private requestQueue: Promise<void> = Promise.resolve();

  constructor(
    @Inject(forwardRef(() => ApiUsageService))
    private readonly apiUsageService?: ApiUsageService,
  ) {
    const maxSearches = parseInt(process.env.MAX_SEARCHES_PER_CAMPAIGN || '2500', 10);
    this.budget = new SearchBudget(maxSearches);

    const hasKey = !!this.serperApiKey;
    this.logger.log(`[SEARCH INIT] Provider: serper, API Key present: ${hasKey}, Budget: ${maxSearches}/campaign`);
    if (!hasKey) {
      this.logger.warn('[SEARCH INIT] Running in MOCK MODE - will return example.com results');
    }
  }

  private get hasValidKey(): boolean {
    return !!this.serperApiKey;
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
   * Uses Serper.dev ($0.001/query)
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
      throw new Error(`BUDGET_EXHAUSTED:${campaignId}`);
    }

    this.logger.log(`[SEARCH] serper: "${query.substring(0, 50)}..." (budget: ${this.budget.remaining(campaignId)} left)`);

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
      results = await this.searchWithSerper(query, options);
    } catch (e: any) {
      status = 'error';
      errorMessage = e.message;
      this.logger.error(`[SEARCH] serper failed: ${e.message}`);
      throw e; // Propagate error instead of silent empty array
    } finally {
      // Log API usage ONCE — covers both success and error paths
      if (this.apiUsageService) {
        await this.apiUsageService.logCall({
          service: 'serper',
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
   * Serper.dev implementation ($0.001/query)
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
