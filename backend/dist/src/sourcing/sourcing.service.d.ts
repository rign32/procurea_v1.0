import { PrismaService } from '../prisma/prisma.service';
import { StrategyAgentService } from './agents/strategy.agent';
import { ExplorerAgentService } from './agents/explorer.agent';
import { AnalystAgentService } from './agents/analyst.agent';
import { EnrichmentAgentService } from './agents/enrichment.agent';
import { AuditorAgentService } from './agents/auditor.agent';
import { GoogleSearchService } from '../common/services/google-search.service';
import { ScrapingService } from '../common/services/scraping.service';
import { QueryCacheService } from '../common/services/query-cache.service';
import { CompanyRegistryService } from '../common/services/company-registry.service';
import { CreateCampaignDto } from './sourcing.controller';
import { SourcingGateway } from './sourcing.gateway';
import { EmailService } from '../email/email.service';
export interface Supplier {
    url: string;
    explorerResult?: any;
    analystResult?: any;
    enrichmentResult?: any;
    auditorResult?: any;
    name?: string;
    country?: string;
    website?: string;
    analysis?: {
        suitabilityScore: number;
        reasoning: string;
    };
}
export interface CampaignState {
    id: string;
    status: string;
    stage: string;
    results: Supplier[];
    logs: string[];
}
export declare class SourcingService {
    private readonly prisma;
    private readonly strategyAgent;
    private readonly explorerAgent;
    private readonly analystAgent;
    private readonly enrichmentAgent;
    private readonly auditorAgent;
    private readonly searchService;
    private readonly scrapingService;
    private readonly sourcingGateway;
    private readonly queryCache;
    private readonly companyRegistry;
    private readonly emailService;
    private readonly logger;
    constructor(prisma: PrismaService, strategyAgent: StrategyAgentService, explorerAgent: ExplorerAgentService, analystAgent: AnalystAgentService, enrichmentAgent: EnrichmentAgentService, auditorAgent: AuditorAgentService, searchService: GoogleSearchService, scrapingService: ScrapingService, sourcingGateway: SourcingGateway, queryCache: QueryCacheService, companyRegistry: CompanyRegistryService, emailService: EmailService);
    private normalizeToRootDomain;
    private extractDomain;
    private log;
    create(dto: CreateCampaignDto): Promise<{
        id: string;
        status: string;
    }>;
    findAll(filters?: {
        status?: string;
        search?: string;
    }): Promise<{
        id: string;
        name: string;
        status: string;
        stage: string;
        createdAt: Date;
        rfqRequestId: string | null;
        rfqRequest: {
            id: string;
            status: string;
            _count: {
                offers: number;
            };
            offers: {
                id: string;
            }[];
            publicId: string | null;
            productName: string;
        } | null;
        stats: {
            suppliersFound: number;
            suppliersContacted: number;
            offersReceived: any;
            pendingOffers: any;
        };
        tags: (string | null)[];
    }[]>;
    findOne(id: string): Promise<{
        status: string;
    } | {
        logs: string[];
        results: {
            analysis: {
                suitabilityScore: number;
                reasoning: string;
            };
            contacts: {
                id: string;
                name: string | null;
                createdAt: Date;
                updatedAt: Date;
                supplierId: string;
                role: string | null;
                email: string | null;
                phone: string | null;
                isDecisionMaker: boolean;
            }[];
            id: string;
            name: string | null;
            deletedAt: Date | null;
            campaignId: string;
            url: string;
            country: string | null;
            city: string | null;
            website: string | null;
            explorerResult: string | null;
            analystResult: string | null;
            enrichmentResult: string | null;
            auditorResult: string | null;
            analysisScore: number | null;
            analysisReason: string | null;
            specialization: string | null;
            certificates: string | null;
            employeeCount: string | null;
            contactEmails: string | null;
            metadata: string | null;
            originLanguage: string | null;
            originCountry: string | null;
            sourceAgent: string | null;
            registryId: string | null;
        }[];
        suppliers: ({
            contacts: {
                id: string;
                name: string | null;
                createdAt: Date;
                updatedAt: Date;
                supplierId: string;
                role: string | null;
                email: string | null;
                phone: string | null;
                isDecisionMaker: boolean;
            }[];
        } & {
            id: string;
            name: string | null;
            deletedAt: Date | null;
            campaignId: string;
            url: string;
            country: string | null;
            city: string | null;
            website: string | null;
            explorerResult: string | null;
            analystResult: string | null;
            enrichmentResult: string | null;
            auditorResult: string | null;
            analysisScore: number | null;
            analysisReason: string | null;
            specialization: string | null;
            certificates: string | null;
            employeeCount: string | null;
            contactEmails: string | null;
            metadata: string | null;
            originLanguage: string | null;
            originCountry: string | null;
            sourceAgent: string | null;
            registryId: string | null;
        })[];
        id: string;
        name: string;
        status: string;
        stage: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sequenceTemplateId: string | null;
    }>;
    updateCampaign(id: string, data: {
        name?: string;
    }): Promise<{
        id: string;
        name: string;
        status: string;
        stage: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sequenceTemplateId: string | null;
    }>;
    softDelete(id: string): Promise<{
        success: boolean;
    }>;
    exportCSV(id: string): Promise<string>;
    updateStatus(id: string, status: string): Promise<{
        id: string;
        name: string;
        status: string;
        stage: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sequenceTemplateId: string | null;
    }>;
    getLogs(campaignId: string, since?: string): Promise<{
        logs: {
            message: string;
            timestamp: Date;
        }[];
        status: string;
        stage: string;
        suppliersFound: number;
    }>;
    private runMultimodalPipeline;
    private executeLanguageWorker;
    private processSupplierUrl;
    private saveSupplierFromCache;
    acceptCampaign(campaignId: string, excludedSupplierIds: string[]): Promise<{
        qualified: number;
        excluded: number;
        offersSent: number;
    }>;
    private getSupplierEmails;
    private resolveTemplateVars;
    private buildAcceptFooterHtml;
}
