import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestsService } from './requests.service';
import { CreateRfqDto } from '../common/dto/create-rfq.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('requests')
export class RequestsController {
    constructor(private readonly requestsService: RequestsService) { }

    @Get('categories')
    getCategories() {
        return [
            { id: 'Electronics', label: 'Elektronika' },
            { id: 'Mechanical', label: 'Mechanika' },
            { id: 'Plastics', label: 'Tworzywa sztuczne' },
            { id: 'Metal', label: 'Metal / Obróbka CNC' },
            { id: 'Rubber', label: 'Guma / Uszczelki' },
            { id: 'Textiles', label: 'Tekstylia / Odzież' },
            { id: 'Packaging', label: 'Opakowania' },
            { id: 'Chemicals', label: 'Chemia / Surowce' },
            { id: 'Automotive', label: 'Motoryzacja' },
            { id: 'Medical', label: 'Medycyna' },
            { id: 'Other', label: 'Inne' },
        ];
    }

    @Get()
    findAll(@Req() req: any) {
        const userId = req.user?.userId || req.user?.sub;
        return this.requestsService.findAll(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.requestsService.findOne(id);
    }

    @Post()
    create(@Body() body: CreateRfqDto, @Req() req: any) {
        const userId = req.user?.userId || req.user?.sub;
        return this.requestsService.create(body, userId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
        return this.requestsService.update(id, body);
    }

    @Post(':id/send-to-campaign')
    sendToCampaign(@Param('id') id: string, @Body() body: { campaignId: string }) {
        return this.requestsService.sendRfqToCampaign(id, body.campaignId);
    }

    @Post(':id/send')
    sendToSuppliers(@Param('id') id: string, @Body() body: { supplierIds: string[] }) {
        return this.requestsService.sendRfqToSuppliers(id, body.supplierIds);
    }

    @Get(':id/offers')
    getOffers(@Param('id') id: string) {
        return this.requestsService.getOffersByRfq(id);
    }

    @Post('offers')
    createOffer(@Body() body: {
        rfqRequestId: string;
        supplierId: string;
        price?: number;
        currency?: string;
        moq?: number;
        leadTime?: number;
        comments?: string;
    }) {
        return this.requestsService.createOffer(body);
    }

    @Post('offers/compare')
    compareOffers(@Body() body: { offerIds: string[] }) {
        return this.requestsService.compareOffers(body.offerIds);
    }

    @Post('offers/:offerId/accept')
    acceptOffer(@Param('offerId') offerId: string) {
        return this.requestsService.acceptOffer(offerId);
    }

    @Post('offers/:offerId/reject')
    rejectOffer(@Param('offerId') offerId: string, @Body() body: { reason?: string }) {
        return this.requestsService.rejectOffer(offerId, body.reason);
    }

    @Post('offers/:offerId/shortlist')
    shortlistOffer(@Param('offerId') offerId: string) {
        return this.requestsService.shortlistOffer(offerId);
    }

    @Get('offers/:offerId/portal-link')
    async getPortalLink(@Param('offerId') offerId: string) {
        const offer = await this.requestsService.findOfferById(offerId);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const portalUrl = `${frontendUrl}/offers/${offer.accessToken}`;

        return {
            portalUrl,
            expiresAt: offer.tokenExpiresAt,
        };
    }

    @Post('offers/:offerId/resend-email')
    resendOfferEmail(@Param('offerId') offerId: string) {
        return this.requestsService.resendOfferEmail(offerId);
    }
}
