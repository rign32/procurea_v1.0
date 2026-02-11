export interface ErrorRecord {
    id: string;
    timestamp: Date;
    type: 'API_ERROR' | 'VALIDATION_ERROR' | 'RUNTIME_ERROR' | 'TIMEOUT' | 'UNKNOWN';
    service: string;
    message: string;
    stack?: string;
    context?: Record<string, any>;
    screenshotPath?: string;
    analysis?: {
        suggestedFix?: string;
        severity: 'info' | 'warning' | 'error' | 'critical';
    };
}
export declare class ErrorTrackingService {
    private readonly logger;
    private errors;
    private readonly maxErrors;
    private readonly logFilePath;
    constructor();
    recordError(error: Error | string, options: {
        type?: ErrorRecord['type'];
        service: string;
        context?: Record<string, any>;
        screenshotPath?: string;
    }): ErrorRecord;
    getRecentErrors(limit?: number): ErrorRecord[];
    getErrorById(id: string): ErrorRecord | undefined;
    getStats(): {
        total: number;
        byService: Record<string, number>;
        byType: Record<string, number>;
        last24h: number;
    };
    updateErrorAnalysis(errorId: string, analysis: ErrorRecord['analysis']): boolean;
    clearErrors(): void;
    private loadErrors;
    private saveErrors;
}
