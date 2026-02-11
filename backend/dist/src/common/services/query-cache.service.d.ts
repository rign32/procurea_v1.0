export interface CachedSearchResult {
    title: string;
    link: string;
    snippet: string;
}
export declare class QueryCacheService {
    private readonly logger;
    private readonly prisma;
    private hashQuery;
    isExpired(expiresAt: Date): boolean;
    getCachedResults(query: string): Promise<CachedSearchResult[] | null>;
    cacheResults(query: string, results: CachedSearchResult[]): Promise<void>;
    getStats(): Promise<{
        total: number;
        expired: number;
    }>;
}
