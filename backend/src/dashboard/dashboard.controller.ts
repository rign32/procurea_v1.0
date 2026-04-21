import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('stats')
    getStats(@Req() req: any) {
        const userId = req.user?.userId || req.user?.sub;
        return this.dashboardService.getStats(userId);
    }

    @Get('activity')
    getActivity(@Req() req: any, @Query('limit') limit?: string) {
        const userId = req.user?.userId || req.user?.sub;
        const parsed = limit ? Math.min(parseInt(limit, 10) || 20, 50) : 20;
        return this.dashboardService.getActivity(userId, parsed);
    }
}
