import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OfferEnrichmentService } from './offer-enrichment.service';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class EnrichmentController {
  constructor(private readonly enrichmentService: OfferEnrichmentService) {}

  @Post('offers/:id/enrich')
  enrichOffer(@Param('id') id: string) {
    return this.enrichmentService.enrichOffer(id);
  }

  @Post('rfqs/:rfqId/enrich-offers')
  enrichOffersForRfq(@Param('rfqId') rfqId: string) {
    return this.enrichmentService.enrichOffersForRfq(rfqId);
  }
}
