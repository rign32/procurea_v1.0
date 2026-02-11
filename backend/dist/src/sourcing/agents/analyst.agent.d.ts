import { GeminiService } from '../../common/services/gemini.service';
export declare class AnalystAgentService {
    private readonly geminiService;
    private readonly logger;
    constructor(geminiService: GeminiService);
    execute(content: string, rfqData: any): Promise<any>;
}
