import { Module, forwardRef } from '@nestjs/common';
import { SourcingService } from './sourcing.service';
import { SourcingController } from './sourcing.controller';
import { ScrapingService } from '../common/services/scraping.service';
import { QueryCacheService } from '../common/services/query-cache.service';
import { CompanyRegistryService } from '../common/services/company-registry.service';
import { StrategyAgentService } from './agents/strategy.agent';
import { ScreenerAgentService } from './agents/screener.agent';
import { EnrichmentAgentService } from './agents/enrichment.agent';
import { AuditorAgentService } from './agents/auditor.agent';
import { ExpansionAgentService } from './agents/expansion.agent';
import { SourcingGateway } from './sourcing.gateway';
import { EmailModule } from '../email/email.module';
import { ObservabilityModule } from '../observability/observability.module';
import { SalesOpsModule } from '../sales-ops/sales-ops.module';

@Module({
  imports: [EmailModule, ObservabilityModule, forwardRef(() => SalesOpsModule)],
  controllers: [SourcingController],
  providers: [
    SourcingService,
    ScrapingService,
    QueryCacheService,
    CompanyRegistryService,
    StrategyAgentService,
    ScreenerAgentService,
    EnrichmentAgentService,
    AuditorAgentService,
    ExpansionAgentService,
    SourcingGateway,
  ],
})
export class SourcingModule { }
