import { GeminiService } from '../../common/services/gemini.service';
export declare class AuditorAgentService {
    private readonly geminiService;
    private readonly logger;
    constructor(geminiService: GeminiService);
    private extractCoreDomainName;
    execute(websiteData: any, registryData: any): Promise<any>;
}
