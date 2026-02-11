import { Module } from '@nestjs/common';
import { SourcingService } from './sourcing.service';
import { SourcingController } from './sourcing.controller';
import { ScrapingService } from '../common/services/scraping.service';
import { QueryCacheService } from '../common/services/query-cache.service';
import { CompanyRegistryService } from '../common/services/company-registry.service';
import { StrategyAgentService } from './agents/strategy.agent';
import { ExplorerAgentService } from './agents/explorer.agent';
import { AnalystAgentService } from './agents/analyst.agent';
import { EnrichmentAgentService } from './agents/enrichment.agent';
import { AuditorAgentService } from './agents/auditor.agent';
import { SourcingGateway } from './sourcing.gateway';

@Module({
  controllers: [SourcingController],
  providers: [
    SourcingService,
    ScrapingService,
    QueryCacheService,
    CompanyRegistryService,
    StrategyAgentService,
    ExplorerAgentService,
    AnalystAgentService,
    EnrichmentAgentService,
    AuditorAgentService,
    SourcingGateway,
  ],
})
export class SourcingModule { }

