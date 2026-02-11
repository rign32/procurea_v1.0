import { PrismaService } from '../../prisma/prisma.service';
export interface AuthLogEntry {
    id?: string;
    timestamp: Date;
    requestId: string;
    action: string;
    provider?: string;
    userId?: string;
    email?: string;
    success: boolean;
    errorMessage?: string;
    metadata?: any;
}
export declare class AuthLogsService {
    private prisma;
    private logs;
    private maxLogs;
    constructor(prisma: PrismaService);
    logAuthEvent(entry: Omit<AuthLogEntry, 'id' | 'timestamp'>): Promise<AuthLogEntry>;
    getRecentLogs(limit?: number, filters?: {
        userId?: string;
        action?: string;
        requestId?: string;
    }): AuthLogEntry[];
    getLogsByRequestId(requestId: string): AuthLogEntry[];
    getOAuthFlow(requestId: string): Promise<{
        requestId: string;
        totalSteps: number;
        success: boolean;
        steps: AuthLogEntry[];
        errors: AuthLogEntry[];
    }>;
}
