import { Controller, Post, Body, Get, Param, Patch, Delete, Query, Res, Header, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SourcingService } from './sourcing.service';
import { CreateCampaignDto } from '../common/dto/create-campaign.dto';
import { PrismaService } from '../prisma/prisma.service';

export { CreateCampaignDto };

@UseGuards(AuthGuard('jwt'))
@Controller('campaigns')
export class SourcingController {
    constructor(
        private readonly sourcingService: SourcingService,
        private readonly prisma: PrismaService,
    ) { }

    @Post()
    async create(@Body() createCampaignDto: CreateCampaignDto, @Req() req: any) {
        const userId = req.user?.userId || req.user?.sub;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, campaignAccess: true },
        });
        if (user?.campaignAccess === 'readonly' && user.role !== 'ADMIN') {
            throw new ForbiddenException('Brak uprawnień do tworzenia kampanii');
        }
        return this.sourcingService.create(createCampaignDto, userId);
    }

    @Get()
    findAll(
        @Query('status') status?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
        @Req() req?: any,
    ) {
        const userId = req?.user?.userId || req?.user?.sub;
        return this.sourcingService.findAll({ status, search }, userId, {
            page: page ? parseInt(page, 10) : 1,
            pageSize: pageSize ? Math.min(parseInt(pageSize, 10), 100) : 50,
        });
    }

    @Get('health/dashboard')
    getCampaignHealth() {
        return this.sourcingService.getCampaignHealth();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.sourcingService.findOne(id);
    }

    @Post(':id/rerun')
    async rerunCampaign(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.userId || req.user?.sub;
        return this.sourcingService.rerunCampaign(id, userId);
    }

    @Get(':id/logs')
    async getLogs(@Param('id') id: string, @Query('since') since?: string) {
        return this.sourcingService.getLogs(id, since);
    }

    @Get(':id/export')
    async exportCSV(@Param('id') id: string, @Res() res: any) {
        const excelBuffer = await this.sourcingService.exportCSV(id);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="campaign-suppliers-${id}.xlsx"`);
        res.send(excelBuffer);
    }

    @Patch(':id')
    updateCampaign(@Param('id') id: string, @Body() body: { name?: string }) {
        return this.sourcingService.updateCampaign(id, body);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.sourcingService.updateStatus(id, status);
    }

    @Post(':id/accept')
    acceptCampaign(
        @Param('id') id: string,
        @Body() body: { excludedSupplierIds?: string[] },
    ) {
        return this.sourcingService.acceptCampaign(id, body.excludedSupplierIds || []);
    }

    @Post(':id/stop')
    stopCampaign(@Param('id') id: string) {
        return this.sourcingService.stopCampaign(id);
    }

    @Post(':id/clone')
    async cloneCampaign(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.userId || req.user?.sub;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, campaignAccess: true },
        });
        if (user?.campaignAccess === 'readonly' && user.role !== 'ADMIN') {
            throw new ForbiddenException('Brak uprawnień do tworzenia kampanii');
        }
        return this.sourcingService.cloneCampaign(id, userId);
    }

    @Delete(':id')
    deleteCampaign(@Param('id') id: string) {
        return this.sourcingService.softDelete(id);
    }
}
