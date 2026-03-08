import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';

@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('campaign/:id')
    getCampaignReport(@Param('id') id: string) {
        return this.reportsService.getCampaignReport(id);
    }

    @Get('funnel')
    getFunnel() {
        return this.reportsService.getFunnel();
    }

    @Get('suppliers/performance')
    getSupplierPerformance(@Query('limit') limit?: string) {
        return this.reportsService.getSupplierPerformance(limit ? parseInt(limit, 10) : 20);
    }
}
