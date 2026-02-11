import { GeminiService } from '../../common/services/gemini.service';
export declare class StrategyAgentService {
    private readonly geminiService;
    private readonly logger;
    constructor(geminiService: GeminiService);
    execute(params: {
        category: string;
        material: string;
        region: string;
        eau: number;
    }): Promise<any>;
}
