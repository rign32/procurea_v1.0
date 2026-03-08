import { SourcingService } from './sourcing.service';
export interface CreateCampaignDto {
    name: string;
    sequenceTemplateId?: string;
    searchCriteria: {
        region: string;
        industry?: string;
        category?: string;
        material?: string;
        eau?: number;
        quantity?: number;
        keywords?: string[];
        description?: string;
        deliveryLocationId?: string;
    };
}
export declare class SourcingController {
    private readonly sourcingService;
    constructor(sourcingService: SourcingService);
    create(createCampaignDto: CreateCampaignDto): Promise<{
        id: string;
        status: string;
    }>;
    findAll(status?: string, search?: string): Promise<{
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
    getLogs(id: string, since?: string): Promise<{
        logs: {
            message: string;
            timestamp: Date;
        }[];
        status: string;
        stage: string;
        suppliersFound: number;
    }>;
    exportCSV(id: string, res: any): Promise<void>;
    updateCampaign(id: string, body: {
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
    acceptCampaign(id: string, body: {
        excludedSupplierIds?: string[];
    }): Promise<{
        qualified: number;
        excluded: number;
        offersSent: number;
    }>;
    deleteCampaign(id: string): Promise<{
        success: boolean;
    }>;
}
