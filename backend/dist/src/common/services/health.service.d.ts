import { GeminiService } from './gemini.service';
import { GoogleSearchService } from './google-search.service';
import { ErrorTrackingService, ErrorRecord } from './error-tracking.service';
export interface ServiceHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime?: number;
    lastCheck: Date;
    message?: string;
    details?: Record<string, any>;
}
export interface SystemHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: Date;
    version: string;
    environment: string;
    services: {
        gemini: ServiceHealth;
        serpApi: ServiceHealth;
        database: ServiceHealth;
    };
    recentErrors: number;
    errorStats?: ReturnType<ErrorTrackingService['getStats']>;
}
export declare class HealthService {
    private readonly geminiService;
    private readonly googleSearchService;
    private readonly errorTrackingService;
    private readonly logger;
    private readonly appVersion;
    constructor(geminiService: GeminiService, googleSearchService: GoogleSearchService, errorTrackingService: ErrorTrackingService);
    private lastGeminiHealth;
    private readonly CACHE_TTL;
    checkGeminiHealth(checkConnectivity?: boolean): Promise<ServiceHealth>;
    checkSerpApiHealth(checkConnectivity?: boolean): Promise<ServiceHealth>;
    checkDatabaseHealth(): Promise<ServiceHealth>;
    getSystemHealth(type?: 'shallow' | 'deep'): Promise<SystemHealth>;
    getRecentErrors(limit?: number): ErrorRecord[];
    getVersionInfo(): Record<string, string>;
    analyzeError(errorId: string): Promise<ErrorRecord['analysis'] | null>;
}
