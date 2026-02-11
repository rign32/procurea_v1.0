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
var AnalystAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalystAgentService = void 0;
const common_1 = require("@nestjs/common");
const gemini_service_1 = require("../../common/services/gemini.service");
let AnalystAgentService = AnalystAgentService_1 = class AnalystAgentService {
    geminiService;
    logger = new common_1.Logger(AnalystAgentService_1.name);
    constructor(geminiService) {
        this.geminiService = geminiService;
    }
    async execute(content, rfqData) {
        this.logger.log('Executing Analyst Agent...');
        const systemPrompt = `
Jesteś Starszym Analitykiem Skautingu Dostawców (Procurement Analyst).
Twoim zadaniem jest EKSTRAKCJA twardych danych o dostawcy z treści jego strony internetowej.

DANE WEJŚCIOWE (RFQ):
${JSON.stringify(rfqData)}

TREŚĆ STRONY:
${content.substring(0, 12000)}

INSTRUKCJE:
1. Przeanalizuj treść pod kątem dopasowania do RFQ.
2. Wydobądź dane firmy. Jeśli nazwy firmy nie ma wprost (np. w stopce), UŻYJ NAZWY DOMENY jako nazwy firmy (np. "granulat.com" -> "Granulat"). NIE zwracaj "Unknown" ani "Należy ustalić".
3. Lokalizacja: Jeśli brak adresu, wywnioskuj kraj z domeny (.pl -> Polska, .de -> Niemcy) lub numeru telefonu (+48 -> Polska). Wpisz miasto, jeśli znajdziesz.
4. Certyfikaty: Szukaj słów kluczowych: ISO 9001, IATF 16949, ISO 14001, UL. Wypisz je w tablicy.
5. Specjalizacja: Krótkie zdanie opisujące co robią (np. "Wtrysk tworzyw sztucznych i budowa form").
6. Wielkość: Szukaj haseł typu "employees", "staff", "pracowników". Jeśli brak, oszacuj ("Mała", "Średnia", "Duża") lub zostaw puste stringi.

FORMAT WYJŚCIOWY (JSON Only):
{
  "capability_match_score": 0-100,
  "match_reason": "Zwięzłe uzasadnienie oceny (1 zdanie).",
  "risks": ["Ryzyko 1", "Ryzyko 2"],
  "extracted_data": {
    "company_name": "Pełna nazwa lub Domena (z dużej litery)",
    "vat_id": "Numer NIP/VAT (jeśli znaleziono)",
    "address": "Ulica, Miasto, Kraj",
    "country": "Kod kraju (PL, DE, etc.) lub pełna nazwa",
    "city": "Miasto (jeśli znaleziono)",
    "email": "Email kontaktowy",
    "phone": "Telefon",
    "website": "URL strony głównej",
    "specialization": "Krótki opis działalności (max 5-7 słów)",
    "certificates": ["ISO 9001", "IATF 16949"],
    "employee_count": "Liczba pracowników (np. '50-100' lub '500+')"
  }
}
    `;
        try {
            const responseText = await this.geminiService.generateContent(systemPrompt);
            const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonString);
        }
        catch (e) {
            this.logger.error('Failed to execute Analyst Agent', e);
            return {
                error: e.message,
                capability_match_score: 50,
                match_reason: "AI unavailable. Pre-qualified by keyword match.",
                extracted_data: {
                    company_name: "Detected Supplier",
                    location: "Unknown"
                }
            };
        }
    }
};
exports.AnalystAgentService = AnalystAgentService;
exports.AnalystAgentService = AnalystAgentService = AnalystAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService])
], AnalystAgentService);
//# sourceMappingURL=analyst.agent.js.map