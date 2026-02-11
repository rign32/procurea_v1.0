import { GeminiService } from '../../common/services/gemini.service';
import { GoogleSearchService } from '../../common/services/google-search.service';
export declare class EnrichmentAgentService {
    private readonly geminiService;
    private readonly googleSearch;
    private readonly logger;
    constructor(geminiService: GeminiService, googleSearch: GoogleSearchService);
    private normalizeToRootDomain;
    private extractDomainForDisplay;
    private isAggregatorOrBlogPage;
    private findRealCompanyDomain;
    private aggressiveEmailDiscovery;
    private isValidBusinessEmail;
    execute(analystData: any, originalUrl: string): Promise<any>;
}
