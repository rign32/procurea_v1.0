import { HealthService, SystemHealth, ServiceHealth } from '../services/health.service';
import { ErrorRecord } from '../services/error-tracking.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getHealth(type?: string): Promise<SystemHealth>;
    getGeminiHealth(type?: string): Promise<ServiceHealth>;
    getSerpHealth(type?: string): Promise<ServiceHealth>;
    getErrors(limit?: string): ErrorRecord[];
    analyzeError(id: string): Promise<{
        analysis: ErrorRecord['analysis'] | null;
    }>;
    getVersion(): Record<string, string>;
    ping(): {
        status: string;
        timestamp: Date;
    };
}
