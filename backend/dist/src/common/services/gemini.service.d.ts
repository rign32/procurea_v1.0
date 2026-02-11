import { ApiUsageService } from './api-usage.service';
export declare class GeminiService {
    private readonly apiUsageService?;
    private readonly logger;
    private aiStudioClient;
    private vertexClient;
    private projectId;
    private location;
    private apiKey;
    private readonly modelName;
    private mockRequestCounter;
    private readonly cacheDir;
    constructor(apiUsageService?: ApiUsageService | undefined);
    private initializeClients;
    private initializeCache;
    private getCacheKey;
    private getFromCache;
    private saveToCache;
    generateContent(prompt: string, userId?: string, context?: string): Promise<string>;
    checkConnectivity(): Promise<boolean>;
    executeGeneration(prompt: string): Promise<string>;
    private getMockResponse;
}
