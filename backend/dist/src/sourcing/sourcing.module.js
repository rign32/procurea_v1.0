"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourcingModule = void 0;
const common_1 = require("@nestjs/common");
const sourcing_service_1 = require("./sourcing.service");
const sourcing_controller_1 = require("./sourcing.controller");
const scraping_service_1 = require("../common/services/scraping.service");
const query_cache_service_1 = require("../common/services/query-cache.service");
const company_registry_service_1 = require("../common/services/company-registry.service");
const strategy_agent_1 = require("./agents/strategy.agent");
const explorer_agent_1 = require("./agents/explorer.agent");
const analyst_agent_1 = require("./agents/analyst.agent");
const enrichment_agent_1 = require("./agents/enrichment.agent");
const auditor_agent_1 = require("./agents/auditor.agent");
const sourcing_gateway_1 = require("./sourcing.gateway");
const email_module_1 = require("../email/email.module");
let SourcingModule = class SourcingModule {
};
exports.SourcingModule = SourcingModule;
exports.SourcingModule = SourcingModule = __decorate([
    (0, common_1.Module)({
        imports: [email_module_1.EmailModule],
        controllers: [sourcing_controller_1.SourcingController],
        providers: [
            sourcing_service_1.SourcingService,
            scraping_service_1.ScrapingService,
            query_cache_service_1.QueryCacheService,
            company_registry_service_1.CompanyRegistryService,
            strategy_agent_1.StrategyAgentService,
            explorer_agent_1.ExplorerAgentService,
            analyst_agent_1.AnalystAgentService,
            enrichment_agent_1.EnrichmentAgentService,
            auditor_agent_1.AuditorAgentService,
            sourcing_gateway_1.SourcingGateway,
        ],
    })
], SourcingModule);
//# sourceMappingURL=sourcing.module.js.map