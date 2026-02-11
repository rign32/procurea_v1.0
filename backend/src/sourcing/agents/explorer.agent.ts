import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../common/services/gemini.service';

@Injectable()
export class ExplorerAgentService {
    private readonly logger = new Logger(ExplorerAgentService.name);

    constructor(private readonly geminiService: GeminiService) { }

    async execute(url: string, content: string): Promise<any> {
        this.logger.log(`Executing Explorer Agent for ${url}...`);

        const systemPrompt = `
Jesteś Autonomicznym Skautem Przemysłowym.
Oceń czy strona należy do producenta.

TREŚĆ STRONY:
${content.substring(0, 5000)}

Zwróć JSON:
{
  "is_relevant": true/false,
  "page_type": "Manufacturer" | "Distributor" | "Directory" | "Irrelevant",
  "reason": "Brief explanation",
  "next_steps_urls": []
}
    `;

        try {
            const responseText = await this.geminiService.generateContent(systemPrompt);
            const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonString);
        } catch (e) {
            this.logger.error('Failed to execute Explorer Agent', e);

            // FALLBACK: Simple Heuristic Check if AI fails
            // If the page content mentions the product name or key terms, assume it's relevant.
            const keywords = ['manufacturer', 'producent', 'factory', 'fabryka', 'cnc', 'machining', 'obróbka'];
            const contentLower = content.toLowerCase();
            const hasKeyword = keywords.some(k => contentLower.includes(k));

            return {
                is_relevant: hasKeyword,
                page_type: hasKeyword ? "Manufacturer (Fallback)" : "Irrelevant",
                reason: "AI unavailable, fallback keyword match."
            };
        }
    }
}
