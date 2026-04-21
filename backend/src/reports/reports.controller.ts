import { Controller, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
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

    @Get('campaign/:id/insights')
    getCampaignInsights(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.userId || req.user?.sub;
        return this.reportsService.getCampaignInsights(id, userId);
    }

    @Get('campaign/:id/insights-narrative')
    getInsightsNarrative(
        @Param('id') id: string,
        @Query('lang') lang: string | undefined,
        @Req() req: any,
    ) {
        const userId = req.user?.userId || req.user?.sub;
        return this.reportsService.generateInsightsNarrative(id, lang, userId);
    }

    @Get('campaign/:id/ai-summary')
    getAiSummary(@Param('id') id: string, @Query('lang') lang?: string) {
        return this.reportsService.generateAiSummary(id, lang);
    }

    @Get('campaign/:id/pdf')
    async downloadPdf(@Param('id') id: string, @Res() res: any) {
        const buffer = await this.reportsService.generatePdf(id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="procurea-report-${id}.pdf"`);
        res.send(buffer);
    }

    @Get('campaign/:id/pptx')
    async downloadPptx(@Param('id') id: string, @Res() res: any) {
        const buffer = await this.reportsService.generatePptx(id);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.setHeader('Content-Disposition', `attachment; filename="procurea-report-${id}.pptx"`);
        res.send(buffer);
    }

    @Get('analytics')
    getAnalytics() {
        return this.reportsService.getAnalytics();
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
