export interface CompanyRecord {
    id: string;
    domain: string;
    name: string | null;
    country: string | null;
    city: string | null;
    specialization: string | null;
    certificates: string | null;
    employeeCount: string | null;
    contactEmails: string | null;
    primaryEmail: string | null;
    explorerResult: any | null;
    analystResult: any | null;
    enrichmentResult: any | null;
    auditorResult: any | null;
    lastAnalysisScore: number | null;
    dataQualityScore: number | null;
    usageCount: number;
    campaignsCount: number;
    rfqsSent: number;
    rfqsResponded: number;
    responseRate: number | null;
    isActive: boolean;
    isVerified: boolean;
    isBlacklisted: boolean;
    lastProcessedAt: Date;
    keywords: string[];
}
export declare class CompanyRegistryService {
    private readonly logger;
    private readonly prisma;
    extractDomain(url: string): string;
    isStale(lastProcessedAt: Date): boolean;
    private calculateQualityScore;
    getByDomain(domain: string): Promise<CompanyRecord | null>;
    getByUrl(url: string): Promise<CompanyRecord | null>;
    getByName(companyName: string): Promise<CompanyRecord | null>;
    upsert(domain: string, data: Partial<Omit<CompanyRecord, 'id' | 'domain' | 'keywords'>>, campaignId?: string): Promise<CompanyRecord>;
    recordRfqSent(domain: string): Promise<void>;
    recordRfqResponse(domain: string, responseTimeHours?: number): Promise<void>;
    blacklist(domain: string, reason: string): Promise<void>;
    verify(domain: string): Promise<void>;
    linkKeywords(domain: string, newKeywords: string[]): Promise<void>;
    getTopSuppliers(limit?: number): Promise<CompanyRecord[]>;
    getStats(): Promise<{
        total: number;
        withEmails: number;
        verified: number;
        blacklisted: number;
        averageQuality: number;
    }>;
}
