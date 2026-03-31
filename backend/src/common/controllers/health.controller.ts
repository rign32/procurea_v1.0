import { Controller, Get, Param, Query } from '@nestjs/common';
import { HealthService, SystemHealth, ServiceHealth } from '../services/health.service';
import { ErrorRecord } from '../services/error-tracking.service';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('health')
export class HealthController {
    constructor(
        private readonly healthService: HealthService,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * GET /api/health - Full system health status
     */
    @Get()
    async getHealth(@Query('type') type?: string): Promise<SystemHealth> {
        const healthType = type === 'deep' ? 'deep' : 'shallow';
        return this.healthService.getSystemHealth(healthType);
    }

    /**
     * GET /api/health/gemini - Gemini API status only
     */
    @Get('gemini')
    async getGeminiHealth(@Query('type') type?: string): Promise<ServiceHealth> {
        return this.healthService.checkGeminiHealth(type === 'deep');
    }

    /**
     * GET /api/health/serp - SERP API status only
     */
    @Get('serp')
    async getSerpHealth(@Query('type') type?: string): Promise<ServiceHealth> {
        return this.healthService.checkSerperHealth(type === 'deep');
    }

    /**
     * GET /api/health/errors - Recent error logs
     */
    @Get('errors')
    getErrors(@Query('limit') limit?: string): ErrorRecord[] {
        const limitNum = limit ? parseInt(limit, 10) : 20;
        return this.healthService.getRecentErrors(limitNum);
    }

    /**
     * GET /api/health/errors/:id/analyze - Analyze specific error with AI
     */
    @Get('errors/:id/analyze')
    async analyzeError(@Param('id') id: string): Promise<{ analysis: ErrorRecord['analysis'] | null }> {
        const analysis = await this.healthService.analyzeError(id);
        return { analysis };
    }

    /**
     * GET /api/health/version - App version info
     */
    @Get('version')
    getVersion(): Record<string, string> {
        return this.healthService.getVersionInfo();
    }

    /**
     * GET /api/health/ping - Simple liveness check
     */
    @Get('ping')
    ping(): { status: string; timestamp: Date } {
        return {
            status: 'ok',
            timestamp: new Date(),
        };
    }

    /**
     * GET /api/health/db-schema - Check for pending migrations
     */
    @Get('db-schema')
    async checkDbSchema() {
        try {
            const pending = await this.prisma.$queryRawUnsafe<{ count: string }[]>(
                `SELECT COUNT(*)::text as count FROM "_prisma_migrations" WHERE "finished_at" IS NULL AND "rolled_back_at" IS NULL`
            );
            const tables = await this.prisma.$queryRawUnsafe<{ table_name: string }[]>(
                `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
            );
            const pendingCount = parseInt(pending[0]?.count || '0', 10);
            return {
                status: pendingCount === 0 ? 'ok' : 'drift',
                pendingMigrations: pendingCount,
                tableCount: tables.length,
                tables: tables.map(t => t.table_name),
            };
        } catch (e) {
            return {
                status: 'error',
                message: e instanceof Error ? e.message.substring(0, 200) : 'Unknown error',
            };
        }
    }
}
