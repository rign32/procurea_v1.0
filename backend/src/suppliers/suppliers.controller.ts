import { Controller, Get, Post, Param, Patch, Body, Query, Res, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { SuppliersService } from './suppliers.service';

@UseGuards(AuthGuard('jwt'))
@Controller('suppliers')
export class SuppliersController {
    constructor(private readonly suppliersService: SuppliersService) { }

    @Get()
    findAll(
        @Query('country') country?: string,
        @Query('minScore') minScore?: string,
        @Query('hasEmail') hasEmail?: string,
        @Query('search') search?: string,
        @Query('campaignId') campaignId?: string,
        @Query('campaignIds') campaignIds?: string,
        @Query('companyType') companyType?: string,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string,
        @Req() req?: any,
    ) {
        const userId = req?.user?.userId || req?.user?.sub;
        return this.suppliersService.findAll({
            country,
            minScore: minScore ? parseFloat(minScore) : undefined,
            hasEmail: hasEmail === 'true',
            search,
            campaignId,
            campaignIds,
            companyType,
        }, userId, {
            page: page ? parseInt(page, 10) : 1,
            pageSize: pageSize ? Math.min(parseInt(pageSize, 10), 500) : 100,
        });
    }

    @Get('export')
    async exportCSV(
        @Query('country') country?: string,
        @Query('minScore') minScore?: string,
        @Query('hasEmail') hasEmail?: string,
        @Query('search') search?: string,
        @Res() res?: any,
    ) {
        const csv = await this.suppliersService.exportCSV({
            country,
            minScore: minScore ? parseFloat(minScore) : undefined,
            hasEmail: hasEmail === 'true',
            search,
        });
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="suppliers.csv"');
        res.send(csv);
    }

    @Get('recommendations')
    getRecommendations(
        @Query('productName') productName?: string,
        @Query('category') category?: string,
        @Query('country') country?: string,
        @Query('limit') limit?: string,
    ) {
        return this.suppliersService.getRecommendations({
            productName,
            category,
            country,
            limit: limit ? Math.min(parseInt(limit, 10), 50) : 10,
        });
    }

    @Get('blacklist/all')
    getBlacklist() {
        return this.suppliersService.getBlacklist();
    }

    @Get('blacklist/template')
    async downloadTemplate(@Res() res: any) {
        const buffer = this.suppliersService.generateBlacklistTemplate();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="blacklist-template.xlsx"');
        res.send(buffer);
    }

    @Post('blacklist/import')
    @UseInterceptors(FileInterceptor('file'))
    async importBlacklist(@UploadedFile() file: any) {
        if (!file) {
            throw new BadRequestException('Nie przesłano pliku');
        }
        return this.suppliersService.importBlacklist(file);
    }

    @Post('blacklist/:registryId/remove')
    removeFromBlacklist(@Param('registryId') id: string) {
        return this.suppliersService.removeFromBlacklist(id);
    }

    @Patch('blacklist/:registryId/reason')
    updateBlacklistReason(
        @Param('registryId') id: string,
        @Body() body: { reason: string },
    ) {
        return this.suppliersService.updateBlacklistReason(id, body.reason);
    }

    @Get(':id/performance')
    getPerformance(@Param('id') id: string) {
        return this.suppliersService.getPerformance(id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.suppliersService.findOne(id);
    }

    @Patch(':id/notes')
    updateNotes(
        @Param('id') id: string,
        @Body() body: { internalNotes?: string; internalTags?: string[] },
    ) {
        return this.suppliersService.updateNotes(id, body);
    }

    @Post('import')
    @UseInterceptors(FileInterceptor('file'))
    importSuppliers(
        @UploadedFile() file: any,
        @Body() body: { campaignId: string },
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        if (!body.campaignId) {
            throw new BadRequestException('campaignId is required');
        }
        return this.suppliersService.importSuppliers(file, body.campaignId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.suppliersService.update(id, data);
    }

    @Post(':id/exclude')
    exclude(@Param('id') id: string, @Body() body: { reason?: string }) {
        return this.suppliersService.exclude(id, body.reason);
    }

    @Post(':id/verify')
    verify(@Param('id') id: string) {
        return this.suppliersService.verify(id);
    }

    @Post(':id/blacklist')
    blacklist(@Param('id') id: string, @Body() body: { reason?: string }) {
        return this.suppliersService.blacklist(id, body.reason);
    }

    @Post('bulk/exclude')
    bulkExclude(@Body() body: { ids: string[]; reason?: string }) {
        if (!body.ids?.length) throw new BadRequestException('ids array required');
        return this.suppliersService.bulkExclude(body.ids, body.reason);
    }

    @Post('bulk/blacklist')
    bulkBlacklist(@Body() body: { ids: string[]; reason?: string }) {
        if (!body.ids?.length) throw new BadRequestException('ids array required');
        return this.suppliersService.bulkBlacklist(body.ids, body.reason);
    }
}
