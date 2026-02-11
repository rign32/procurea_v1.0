import { ApiUsageService } from './api-usage.service';
export declare class GoogleSearchService {
    private readonly apiUsageService?;
    private readonly logger;
    private apiKey;
    private lastRequestTime;
    private readonly MIN_DELAY_MS;
    private requestQueue;
    constructor(apiUsageService?: ApiUsageService | undefined);
    search(query: string, userId?: string): Promise<string[]>;
    private delay;
    private rateLimitedRequest;
    private withRetry;
    searchExtended(query: string, options?: {
        gl?: string;
        hl?: string;
        num?: number;
    }, userId?: string): Promise<{
        title: string;
        link: string;
        snippet: string;
    }[]>;
    searchGlobal(query: string, userId?: string): Promise<{
        title: string;
        link: string;
        snippet: string;
    }[]>;
}
