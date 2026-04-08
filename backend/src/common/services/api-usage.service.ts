import { Injectable, Logger } from '@nestjs/common';
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
    service: 'gemini' | 'serper';
    endpoint?: string;
    userId?: string;
    campaignId?: string;
    requestPayload?: string;
    status: 'success' | 'error';
    errorMessage?: string;
    tokensUsed?: number;
    responseTimeMs?: number;
}

// Cost constants (USD)
const GEMINI_INPUT_COST_PER_1K = 0.00025;  // gemini-2.0-flash
const GEMINI_OUTPUT_COST_PER_1K = 0.0005;
const SERPER_COST_PER_CALL = 0.001;   // $50/50k queries — Serper.dev

@Injectable()
export class ApiUsageService {
    private readonly logger = new Logger(ApiUsageService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Log an API call to the database
     */
    async logCall(params: LogApiCallParams): Promise<void> {
        try {
            const estimatedCost = this.calculateCost(params);

            await this.prisma.apiUsageLog.create({
                data: {
                    service: params.service,
                    endpoint: params.endpoint,
                    userId: params.userId,
                    campaignId: params.campaignId,
                    requestPayload: params.requestPayload?.substring(0, 500),
                    status: params.status,
                    errorMessage: params.errorMessage,
                    tokensUsed: params.tokensUsed,
                    estimatedCost,
                    responseTimeMs: params.responseTimeMs,
                },
            });

            // Trigger Sentry alert if a single call is unusually expensive (e.g., > $1.00)
            if (estimatedCost && estimatedCost > 1.0) {
                const Sentry = await import('@sentry/nestjs');
                Sentry.captureMessage(`High API Cost Alert: ${params.service}`, {
                    level: 'warning',
                    extra: {
                        cost: estimatedCost,
                        service: params.service,
                        tokens: params.tokensUsed,
                        endpoint: params.endpoint,
                        user: params.userId,
                    }
                });
            }

            this.logger.debug(
                `[API USAGE] ${params.service} ${params.status} - ${params.responseTimeMs}ms - $${estimatedCost?.toFixed(6) ?? 'N/A'}`
            );
        } catch (error) {
            // Don't fail the main operation if logging fails
            this.logger.error(`Failed to log API usage: ${error.message}`);
        }
    }

    /**
     * Calculate estimated cost for an API call
     */
    private calculateCost(params: LogApiCallParams): number | null {
        if (params.status === 'error') {
            return 0; // Errors usually don't incur cost
        }

        switch (params.service) {
            case 'gemini':
                if (params.tokensUsed) {
                    // Rough estimate: assume 60% input, 40% output
                    const inputTokens = Math.floor(params.tokensUsed * 0.6);
                    const outputTokens = Math.ceil(params.tokensUsed * 0.4);
                    return (
                        (inputTokens / 1000) * GEMINI_INPUT_COST_PER_1K +
                        (outputTokens / 1000) * GEMINI_OUTPUT_COST_PER_1K
                    );
                }
                return null;
            case 'serper':
                return SERPER_COST_PER_CALL;
            default:
                return null;
        }
    }

    /**
     * Get aggregated usage statistics
     */
    async getUsageStats(filters?: {
        startDate?: Date;
        endDate?: Date;
        service?: string;
        userId?: string;
    }): Promise<ApiUsageStats> {
        const where: any = {};

        if (filters?.startDate) {
            where.createdAt = { gte: filters.startDate };
        }
        if (filters?.endDate) {
            where.createdAt = { ...where.createdAt, lte: filters.endDate };
        }
        if (filters?.service) {
            where.service = filters.service;
        }
        if (filters?.userId) {
            where.userId = filters.userId;
        }

        // Get all logs matching filters
        const logs = await this.prisma.apiUsageLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        // Calculate aggregates
        const totalCalls = logs.length;
        const successfulCalls = logs.filter(l => l.status === 'success').length;
        const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
        const totalCost = logs.reduce((sum, l) => sum + (l.estimatedCost || 0), 0);

        // Group by service
        const serviceMap = new Map<string, { calls: number; errors: number; totalTime: number; cost: number }>();
        logs.forEach(log => {
            const existing = serviceMap.get(log.service) || { calls: 0, errors: 0, totalTime: 0, cost: 0 };
            existing.calls++;
            if (log.status === 'error') existing.errors++;
            existing.totalTime += log.responseTimeMs || 0;
            existing.cost += log.estimatedCost || 0;
            serviceMap.set(log.service, existing);
        });

        const byService = Array.from(serviceMap.entries()).map(([service, stats]) => ({
            service,
            calls: stats.calls,
            errors: stats.errors,
            avgResponseTime: stats.calls > 0 ? Math.round(stats.totalTime / stats.calls) : 0,
            totalCost: stats.cost,
        }));

        // Group by day
        const dayMap = new Map<string, { calls: number; cost: number }>();
        logs.forEach(log => {
            const day = log.createdAt.toISOString().split('T')[0];
            const existing = dayMap.get(day) || { calls: 0, cost: 0 };
            existing.calls++;
            existing.cost += log.estimatedCost || 0;
            dayMap.set(day, existing);
        });

        const dailyStats = Array.from(dayMap.entries())
            .map(([date, stats]) => ({
                date,
                calls: stats.calls,
                cost: stats.cost,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            totalCalls,
            successRate,
            totalCost,
            byService,
            dailyStats,
        };
    }

    /**
     * Get paginated usage logs
     */
    async getUsageLogs(options: {
        skip?: number;
        take?: number;
        service?: string;
        status?: string;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
    }) {
        const where: any = {};

        if (options.service) where.service = options.service;
        if (options.status) where.status = options.status;
        if (options.userId) where.userId = options.userId;
        if (options.startDate || options.endDate) {
            where.createdAt = {};
            if (options.startDate) where.createdAt.gte = options.startDate;
            if (options.endDate) where.createdAt.lte = options.endDate;
        }

        const [logs, total] = await Promise.all([
            this.prisma.apiUsageLog.findMany({
                where,
                skip: options.skip || 0,
                take: options.take || 50,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, email: true, name: true },
                    },
                },
            }),
            this.prisma.apiUsageLog.count({ where }),
        ]);

        return { logs, total };
    }
}
