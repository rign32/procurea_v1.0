import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ScheduledReportsService } from './scheduled-reports.service';

@UseGuards(AuthGuard('jwt'))
@Controller('scheduled-reports')
export class ScheduledReportsController {
    constructor(private readonly service: ScheduledReportsService) {}

    @Get()
    findAll(@Req() req: any) {
        const userId = req.user?.userId || req.user?.sub;
        return this.service.findAll(userId);
    }

    @Post()
    create(
        @Req() req: any,
        @Body() body: {
            name: string;
            frequency: string; // 'daily' | 'weekly' | 'monthly'
            reportType: string; // 'campaign_summary' | 'analytics' | 'supplier_performance'
            recipients: string[]; // email addresses
            filters?: Record<string, any>;
        },
    ) {
        const userId = req.user?.userId || req.user?.sub;
        return this.service.create(userId, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.userId || req.user?.sub;
        return this.service.remove(id, userId);
    }

    @Post(':id/run')
    runNow(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.userId || req.user?.sub;
        return this.service.runNow(id, userId);
    }

    // Internal cron endpoint (called by Cloud Scheduler)
    @Post('internal/process')
    async processScheduled(@Req() req: any) {
        const cronSecret = req.headers['x-cron-secret'];
        if (cronSecret !== process.env.CRON_SECRET) {
            return { error: 'Unauthorized' };
        }
        return this.service.processScheduledReports();
    }
}
