import { GeminiService } from '../../common/services/gemini.service';
export declare class ExplorerAgentService {
    private readonly geminiService;
    private readonly logger;
    constructor(geminiService: GeminiService);
    execute(url: string, content: string): Promise<any>;
}
