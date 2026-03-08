import { ApiUsageService } from './api-usage.service';
export declare class GoogleSearchService {
    private readonly apiUsageService?;
    private readonly logger;
    private serpApiKey;
    private serperApiKey;
    private provider;
    private budget;
    private lastRequestTime;
    private readonly MIN_DELAY_MS;
    private requestQueue;
    constructor(apiUsageService?: ApiUsageService | undefined);
    private get hasValidKey();
    search(query: string, userId?: string, campaignId?: string): Promise<string[]>;
    private delay;
    private rateLimitedRequest;
    private withRetry;
    getRemainingBudget(campaignId?: string): number;
    searchExtended(query: string, options?: {
        gl?: string;
        hl?: string;
        num?: number;
    }, userId?: string, campaignId?: string): Promise<{
        title: string;
        link: string;
        snippet: string;
    }[]>;
    private searchWithSerpApi;
    private searchWithSerper;
    searchGlobal(query: string, userId?: string, campaignId?: string): Promise<{
        title: string;
        link: string;
        snippet: string;
    }[]>;
}
