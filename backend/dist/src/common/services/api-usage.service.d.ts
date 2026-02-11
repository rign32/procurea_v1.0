import { PrismaService } from '../../prisma/prisma.service';
export interface ApiUsageStats {
    totalCalls: number;
    successRate: number;
    totalCost: number;
    byService: {
        service: string;
        calls: number;
        errors: number;
        avgResponseTime: number;
        totalCost: number;
    }[];
    dailyStats: {
        date: string;
        calls: number;
        cost: number;
    }[];
}
export interface LogApiCallParams {
    service: 'gemini' | 'serpapi';
    endpoint?: string;
    userId?: string;
    requestPayload?: string;
    status: 'success' | 'error';
    errorMessage?: string;
    tokensUsed?: number;
    responseTimeMs?: number;
}
export declare class ApiUsageService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    logCall(params: LogApiCallParams): Promise<void>;
    private calculateCost;
    getUsageStats(filters?: {
        startDate?: Date;
        endDate?: Date;
        service?: string;
        userId?: string;
    }): Promise<ApiUsageStats>;
    getUsageLogs(options: {
        skip?: number;
        take?: number;
        service?: string;
        status?: string;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        logs: ({
            user: {
                id: string;
                email: string;
                name: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            service: string;
            endpoint: string | null;
            requestPayload: string | null;
            status: string;
            errorMessage: string | null;
            tokensUsed: number | null;
            estimatedCost: number | null;
            responseTimeMs: number | null;
            userId: string | null;
        })[];
        total: number;
    }>;
}
