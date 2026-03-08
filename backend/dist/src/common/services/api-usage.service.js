"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ApiUsageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiUsageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const GEMINI_INPUT_COST_PER_1K = 0.00025;
const GEMINI_OUTPUT_COST_PER_1K = 0.0005;
const SERPAPI_COST_PER_CALL = 0.01;
const SERPER_COST_PER_CALL = 0.001;
let ApiUsageService = ApiUsageService_1 = class ApiUsageService {
    prisma;
    logger = new common_1.Logger(ApiUsageService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async logCall(params) {
        try {
            const estimatedCost = this.calculateCost(params);
            await this.prisma.apiUsageLog.create({
                data: {
                    service: params.service,
                    endpoint: params.endpoint,
                    userId: params.userId,
                    requestPayload: params.requestPayload?.substring(0, 500),
                    status: params.status,
                    errorMessage: params.errorMessage,
                    tokensUsed: params.tokensUsed,
                    estimatedCost,
                    responseTimeMs: params.responseTimeMs,
                },
            });
            this.logger.debug(`[API USAGE] ${params.service} ${params.status} - ${params.responseTimeMs}ms - $${estimatedCost?.toFixed(6) ?? 'N/A'}`);
        }
        catch (error) {
            this.logger.error(`Failed to log API usage: ${error.message}`);
        }
    }
    calculateCost(params) {
        if (params.status === 'error') {
            return 0;
        }
        switch (params.service) {
            case 'gemini':
                if (params.tokensUsed) {
                    const inputTokens = Math.floor(params.tokensUsed * 0.6);
                    const outputTokens = Math.ceil(params.tokensUsed * 0.4);
                    return ((inputTokens / 1000) * GEMINI_INPUT_COST_PER_1K +
                        (outputTokens / 1000) * GEMINI_OUTPUT_COST_PER_1K);
                }
                return null;
            case 'serpapi':
                return SERPAPI_COST_PER_CALL;
            case 'serper':
                return SERPER_COST_PER_CALL;
            default:
                return null;
        }
    }
    async getUsageStats(filters) {
        const where = {};
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
        const logs = await this.prisma.apiUsageLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        const totalCalls = logs.length;
        const successfulCalls = logs.filter(l => l.status === 'success').length;
        const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
        const totalCost = logs.reduce((sum, l) => sum + (l.estimatedCost || 0), 0);
        const serviceMap = new Map();
        logs.forEach(log => {
            const existing = serviceMap.get(log.service) || { calls: 0, errors: 0, totalTime: 0, cost: 0 };
            existing.calls++;
            if (log.status === 'error')
                existing.errors++;
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
        const dayMap = new Map();
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
    async getUsageLogs(options) {
        const where = {};
        if (options.service)
            where.service = options.service;
        if (options.status)
            where.status = options.status;
        if (options.userId)
            where.userId = options.userId;
        if (options.startDate || options.endDate) {
            where.createdAt = {};
            if (options.startDate)
                where.createdAt.gte = options.startDate;
            if (options.endDate)
                where.createdAt.lte = options.endDate;
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
};
exports.ApiUsageService = ApiUsageService;
exports.ApiUsageService = ApiUsageService = ApiUsageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApiUsageService);
//# sourceMappingURL=api-usage.service.js.map