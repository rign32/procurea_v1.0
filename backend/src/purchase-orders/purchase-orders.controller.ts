import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PoSyncService } from './po-sync.service';
import { GeneratePoDto } from './dto/generate-po.dto';
import { UpdatePoStatusDto } from './dto/update-po-status.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('purchase-orders')
export class PurchaseOrdersController {
    constructor(
        private readonly service: PurchaseOrdersService,
        private readonly poSyncService: PoSyncService,
    ) {}

    @Post('generate')
    generate(@Req() req: any, @Body() body: GeneratePoDto) {
        if (!body?.contractId) throw new BadRequestException('contractId is required');
        const userId = req.user?.userId || req.user?.sub;
        return this.service.generateFromContract(userId, body.contractId);
    }

    @Get()
    findAll(@Req() req: any, @Query('status') status?: string) {
        const userId = req.user?.userId || req.user?.sub;
        return this.service.findAll(userId, status);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.userId || req.user?.sub;
        return this.service.findOne(id, userId);
    }

    @Post(':id/sync-to-erp')
    syncToErp(@Param('id') id: string) {
        return this.poSyncService.syncToErp(id);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() body: UpdatePoStatusDto,
        @Req() req: any,
    ) {
        const userId = req.user?.userId || req.user?.sub;
        return this.service.updateStatus(id, userId, body.status);
    }
}
