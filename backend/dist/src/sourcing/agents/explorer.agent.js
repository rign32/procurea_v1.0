"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ExplorerAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExplorerAgentService = void 0;
const common_1 = require("@nestjs/common");
const gemini_service_1 = require("../../common/services/gemini.service");
let ExplorerAgentService = ExplorerAgentService_1 = class ExplorerAgentService {
    geminiService;
    logger = new common_1.Logger(ExplorerAgentService_1.name);
    constructor(geminiService) {
        this.geminiService = geminiService;
    }
    async execute(url, content) {
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
        }
        catch (e) {
            this.logger.error('Failed to execute Explorer Agent', e);
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
};
exports.ExplorerAgentService = ExplorerAgentService;
exports.ExplorerAgentService = ExplorerAgentService = ExplorerAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService])
], ExplorerAgentService);
//# sourceMappingURL=explorer.agent.js.map