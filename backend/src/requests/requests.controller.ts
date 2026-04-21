import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestsService } from './requests.service';
import { CounterOfferAiService } from './counter-offer-ai.service';
import { WeightedRankingService, RankingWeights } from './weighted-ranking.service';
import { CreateRfqDto } from '../common/dto/create-rfq.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('requests')
export class RequestsController {
    constructor(
        private readonly requestsService: RequestsService,
        private readonly counterOfferAiService: CounterOfferAiService,
        private readonly weightedRanking: WeightedRankingService,
    ) { }

    private getUserId(req: any): string {
        return req.user?.userId || req.user?.sub;
    }

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
        return this.requestsService.findAll(this.getUserId(req));
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: any) {
        return this.requestsService.findOne(id, this.getUserId(req));
    }

    @Post()
    create(@Body() body: CreateRfqDto, @Req() req: any) {
        return this.requestsService.create(body, this.getUserId(req));
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() req: any) {
        return this.requestsService.update(id, body, this.getUserId(req));
    }

    @Post(':id/send-to-campaign')
    sendToCampaign(@Param('id') id: string, @Body() body: { campaignId: string }, @Req() req: any) {
        return this.requestsService.sendRfqToCampaign(id, body.campaignId, this.getUserId(req));
    }

    @Post(':id/send')
    sendToSuppliers(@Param('id') id: string, @Body() body: { supplierIds: string[] }, @Req() req: any) {
        return this.requestsService.sendRfqToSuppliers(id, body.supplierIds, this.getUserId(req));
    }

    @Get(':id/offers')
    getOffers(@Param('id') id: string, @Req() req: any) {
        return this.requestsService.getOffersByRfq(id, this.getUserId(req));
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
    }, @Req() req: any) {
        return this.requestsService.createOffer(body, this.getUserId(req));
    }

    @Post('offers/compare')
    compareOffers(
        @Body() body: {
            offerIds: string[];
            includeAiRecommendation?: boolean;
            rankingWeights?: Partial<RankingWeights>;
        },
        @Req() req: any,
    ) {
        return this.requestsService.compareOffers(
            body.offerIds,
            this.getUserId(req),
            body.includeAiRecommendation,
            body.rankingWeights,
        );
    }

    @Get(':rfqId/ranking-weights')
    async getRankingWeights(@Param('rfqId') rfqId: string, @Req() req: any) {
        await this.requestsService.ensureRfqOwnership(rfqId, this.getUserId(req));
        const weights = await this.weightedRanking.getWeightsForRfq(rfqId);
        return { weights };
    }

    @Post(':rfqId/ranking-weights')
    async setRankingWeights(
        @Param('rfqId') rfqId: string,
        @Body() body: { weights: Partial<RankingWeights> },
        @Req() req: any,
    ) {
        await this.requestsService.ensureRfqOwnership(rfqId, this.getUserId(req));
        const weights = await this.weightedRanking.setWeightsForRfq(rfqId, body.weights);
        return { weights };
    }

    @Post('offers/:offerId/accept')
    acceptOffer(@Param('offerId') offerId: string, @Req() req: any) {
        return this.requestsService.acceptOffer(offerId, this.getUserId(req));
    }

    @Post('offers/:offerId/reject')
    rejectOffer(@Param('offerId') offerId: string, @Body() body: { reason?: string }, @Req() req: any) {
        return this.requestsService.rejectOffer(offerId, body.reason, this.getUserId(req));
    }

    @Post('offers/:offerId/shortlist')
    shortlistOffer(@Param('offerId') offerId: string, @Req() req: any) {
        return this.requestsService.shortlistOffer(offerId, this.getUserId(req));
    }

    @Post('offers/:offerId/counter')
    counterOffer(
        @Param('offerId') offerId: string,
        @Body() body: { price?: number; moq?: number; leadTime?: number; comments?: string },
        @Req() req: any,
    ) {
        return this.requestsService.counterOffer(offerId, body, this.getUserId(req));
    }

    @Get('offers/:offerId/portal-link')
    async getPortalLink(@Param('offerId') offerId: string, @Req() req: any) {
        const offer = await this.requestsService.findOfferById(offerId, this.getUserId(req));
        const frontendUrl = process.env.FRONTEND_URL || 'https://app.procurea.pl';
        const portalUrl = `${frontendUrl}/offers/${offer.accessToken}`;

        return {
            portalUrl,
            expiresAt: offer.tokenExpiresAt,
        };
    }

    @Post('offers/:offerId/resend-email')
    resendOfferEmail(@Param('offerId') offerId: string, @Req() req: any) {
        return this.requestsService.resendOfferEmail(offerId, this.getUserId(req));
    }

    @Post('offers/:offerId/suggest-counter')
    suggestCounterOffer(@Param('offerId') offerId: string) {
        return this.counterOfferAiService.suggestCounter(offerId);
    }
}
