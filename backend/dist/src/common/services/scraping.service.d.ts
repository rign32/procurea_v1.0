export declare class ScrapingService {
    private readonly logger;
    private readonly cache;
    private readonly CACHE_TTL_MS;
    private readonly MAX_RETRIES;
    private readonly CONTENT_LIMIT;
    fetchContent(url: string): Promise<string>;
}
