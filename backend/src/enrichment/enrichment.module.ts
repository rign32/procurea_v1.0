import { Module } from '@nestjs/common';
import { OfferEnrichmentService } from './offer-enrichment.service';
import { EnrichmentController } from './enrichment.controller';

@Module({
  controllers: [EnrichmentController],
  providers: [OfferEnrichmentService],
  exports: [OfferEnrichmentService],
})
export class EnrichmentModule {}
