import { SourcingService } from './sourcing.service';
export interface CreateCampaignDto {
    name: string;
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
    findAll(): Promise<{
        id: string;
        name: string;
        status: string;
        stage: string;
        createdAt: Date;
        rfqRequestId: string | null;
        rfqRequest: {
            id: string;
            status: string;
            publicId: string | null;
            productName: string;
        } | null;
        stats: {
            suppliersFound: number;
            suppliersContacted: number;
            offersReceived: number;
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
                email: string | null;
                name: string | null;
                phone: string | null;
                role: string | null;
                createdAt: Date;
                updatedAt: Date;
                supplierId: string;
                isDecisionMaker: boolean;
            }[];
            id: string;
            name: string | null;
            country: string | null;
            city: string | null;
            specialization: string | null;
            certificates: string | null;
            employeeCount: string | null;
            contactEmails: string | null;
            explorerResult: string | null;
            analystResult: string | null;
            enrichmentResult: string | null;
            auditorResult: string | null;
            deletedAt: Date | null;
            campaignId: string;
            url: string;
            website: string | null;
            analysisScore: number | null;
            analysisReason: string | null;
            metadata: string | null;
            originLanguage: string | null;
            originCountry: string | null;
            sourceAgent: string | null;
            registryId: string | null;
        }[];
        suppliers: ({
            contacts: {
                id: string;
                email: string | null;
                name: string | null;
                phone: string | null;
                role: string | null;
                createdAt: Date;
                updatedAt: Date;
                supplierId: string;
                isDecisionMaker: boolean;
            }[];
        } & {
            id: string;
            name: string | null;
            country: string | null;
            city: string | null;
            specialization: string | null;
            certificates: string | null;
            employeeCount: string | null;
            contactEmails: string | null;
            explorerResult: string | null;
            analystResult: string | null;
            enrichmentResult: string | null;
            auditorResult: string | null;
            deletedAt: Date | null;
            campaignId: string;
            url: string;
            website: string | null;
            analysisScore: number | null;
            analysisReason: string | null;
            metadata: string | null;
            originLanguage: string | null;
            originCountry: string | null;
            sourceAgent: string | null;
            registryId: string | null;
        })[];
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        stage: string;
        deletedAt: Date | null;
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
    updateStatus(id: string, status: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        stage: string;
        deletedAt: Date | null;
    }>;
}
