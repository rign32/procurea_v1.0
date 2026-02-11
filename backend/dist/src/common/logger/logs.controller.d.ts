import { AuthLogsService } from './auth-logs.service';
export declare class LogsController {
    private authLogsService;
    constructor(authLogsService: AuthLogsService);
    getAuthLogs(limit?: string, userId?: string, action?: string, requestId?: string): import("./auth-logs.service").AuthLogEntry[];
    getOAuthFlow(requestId: string): Promise<{
        requestId: string;
        totalSteps: number;
        success: boolean;
        steps: import("./auth-logs.service").AuthLogEntry[];
        errors: import("./auth-logs.service").AuthLogEntry[];
    }> | {
        error: string;
    };
}
