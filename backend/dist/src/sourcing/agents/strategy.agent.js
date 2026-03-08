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
var StrategyAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyAgentService = void 0;
const common_1 = require("@nestjs/common");
const gemini_service_1 = require("../../common/services/gemini.service");
const REGION_LANGUAGE_CONFIG = {
    PL: {
        countries: ['Poland'],
        languages: [
            { code: 'pl', name: 'Polish', queryPrefix: '' }
        ],
        searchSuffix: ['producent', 'zakład', 'fabryka'],
        negatives: ['-allegro', '-olx', '-sklep', '-hurtownia', '-ceneo', '-empik']
    },
    EU: {
        countries: ['Germany', 'Poland', 'Czech Republic', 'France', 'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium', 'Austria', 'Switzerland'],
        languages: [
            { code: 'de', name: 'German', queryPrefix: '' },
            { code: 'pl', name: 'Polish', queryPrefix: '' },
            { code: 'cs', name: 'Czech', queryPrefix: '' },
            { code: 'fr', name: 'French', queryPrefix: '' },
            { code: 'it', name: 'Italian', queryPrefix: '' },
            { code: 'es', name: 'Spanish', queryPrefix: '' },
            { code: 'pt', name: 'Portuguese', queryPrefix: '' },
            { code: 'nl', name: 'Dutch', queryPrefix: '' },
            { code: 'en', name: 'English', queryPrefix: '' }
        ],
        searchSuffix: ['manufacturer', 'Hersteller', 'producent', 'fabricant', 'fabbricante', 'fabricante'],
        negatives: ['-amazon', '-ebay', '-alibaba', '-shop', '-store', '-allegro']
    },
    GLOBAL_NO_CN: {
        countries: ['USA', 'Germany', 'Japan', 'South Korea', 'India', 'Mexico', 'Brazil', 'UK', 'France', 'Italy', 'Poland', 'Taiwan', 'Vietnam', 'Thailand', 'Malaysia', 'Turkey'],
        languages: [
            { code: 'en', name: 'English', queryPrefix: '' },
            { code: 'de', name: 'German', queryPrefix: '' },
            { code: 'ja', name: 'Japanese', queryPrefix: '' },
            { code: 'ko', name: 'Korean', queryPrefix: '' },
            { code: 'hi', name: 'Hindi', queryPrefix: '' },
            { code: 'es', name: 'Spanish', queryPrefix: '' },
            { code: 'pt', name: 'Portuguese', queryPrefix: '' },
            { code: 'pl', name: 'Polish', queryPrefix: '' },
            { code: 'fr', name: 'French', queryPrefix: '' },
            { code: 'it', name: 'Italian', queryPrefix: '' },
            { code: 'vi', name: 'Vietnamese', queryPrefix: '' },
            { code: 'th', name: 'Thai', queryPrefix: '' },
            { code: 'tr', name: 'Turkish', queryPrefix: '' }
        ],
        searchSuffix: ['manufacturer', 'factory', 'producer', 'OEM supplier'],
        negatives: ['-amazon', '-ebay', '-alibaba', '-aliexpress', '-taobao', '-1688', '-shop', '-store', '-china', '-chinese']
    },
    GLOBAL: {
        countries: ['USA', 'Germany', 'Japan', 'China', 'South Korea', 'India', 'Mexico', 'Brazil', 'UK', 'France', 'Italy', 'Poland', 'Taiwan', 'Vietnam', 'Thailand', 'Malaysia', 'Turkey'],
        languages: [
            { code: 'en', name: 'English', queryPrefix: '' },
            { code: 'de', name: 'German', queryPrefix: '' },
            { code: 'ja', name: 'Japanese', queryPrefix: '' },
            { code: 'zh', name: 'Chinese (Simplified)', queryPrefix: '' },
            { code: 'ko', name: 'Korean', queryPrefix: '' },
            { code: 'hi', name: 'Hindi', queryPrefix: '' },
            { code: 'es', name: 'Spanish', queryPrefix: '' },
            { code: 'pt', name: 'Portuguese', queryPrefix: '' },
            { code: 'pl', name: 'Polish', queryPrefix: '' },
            { code: 'fr', name: 'French', queryPrefix: '' },
            { code: 'it', name: 'Italian', queryPrefix: '' },
            { code: 'vi', name: 'Vietnamese', queryPrefix: '' },
            { code: 'th', name: 'Thai', queryPrefix: '' },
            { code: 'tr', name: 'Turkish', queryPrefix: '' }
        ],
        searchSuffix: ['manufacturer', 'factory', 'producer', 'OEM supplier', '工厂', '制造商'],
        negatives: ['-amazon', '-ebay', '-shop', '-store']
    }
};
let StrategyAgentService = StrategyAgentService_1 = class StrategyAgentService {
    geminiService;
    logger = new common_1.Logger(StrategyAgentService_1.name);
    constructor(geminiService) {
        this.geminiService = geminiService;
    }
    async execute(params) {
        this.logger.log(`Executing Strategy Agent for "${params.productName}" in region: ${params.region}`);
        const regionConfig = REGION_LANGUAGE_CONFIG[params.region]
            || REGION_LANGUAGE_CONFIG.EU;
        const languageInstructions = regionConfig.languages
            .map(l => `- ${l.name} (${l.code})`)
            .join('\n');
        const targetCountries = regionConfig.countries.join(', ');
        const negativeKeywords = regionConfig.negatives.join(' ');
        const keywordsStr = params.keywords.length > 0 ? params.keywords.join(', ') : 'brak';
        const categoryStr = params.category || 'nie podano';
        const materialStr = params.material || 'nie podano';
        const systemPrompt = `
Jesteś Ekspertem Strategii Sourcingu Przemysłowego (Industrial Sourcing Strategist).
Twoim celem jest znalezienie JAK NAJWIĘKSZEJ LICZBY REALNYCH PRODUCENTÓW dla podanego produktu/surowca.
CHCEMY ZNALEŹĆ 100-250+ PRODUCENTÓW na całym świecie.

=== PRODUKT / SUROWIEC DO ZNALEZIENIA ===
**NAZWA:** "${params.productName}"
**OPIS:** "${params.description}"
**SŁOWA KLUCZOWE:** ${keywordsStr}
**KATEGORIA:** ${categoryStr}
**MATERIAŁ:** ${materialStr}
**SKALA (EAU):** ${params.eau} szt./rok
**REGION:** ${params.region}

WAŻNE: Zapytania wyszukiwania MUSZĄ być bezpośrednio związane z produktem "${params.productName}".
Nie zgaduj ani nie interpretuj — szukaj DOKŁADNIE tego, co użytkownik opisał powyżej.
Jeśli produkt to surowiec (np. "aluminium ekstrudowane"), szukaj PRODUCENTÓW/DOSTAWCÓW tego surowca,
a NIE producentów gotowych wyrobów z tego materiału.

=== OGRANICZENIE REGIONALNE ===
Twoje zapytania MUSZĄ być ograniczone do następujących krajów:
${targetCountries}

Używaj następujących JĘZYKÓW w zapytaniach:
${languageInstructions}

=== KRYTYCZNE WYMAGANIA ===
1. Generuj DOKŁADNIE 3-4 zapytania PER JĘZYK/KRAJ (nie więcej - mamy ograniczony budżet API!)
2. Każde zapytanie MUSI być bezpośrednio związane z "${params.productName}" — NIE zgaduj pokrewnych kategorii!
3. Używaj RÓŻNYCH strategii:
   - TECHNOLOGICZNA: proces produkcyjny / technologia + "${params.productName}"
   - PRODUKTOWA: "${params.productName}" + "manufacturer/producent/Hersteller"
   - KATALOGOWA: "lista producentów" / "list of manufacturers" + "${params.productName}"
4. Dla każdego kraju generuj zapytania w LOKALNYM JĘZYKU (tłumacz nazwę produktu!)
5. LIMIT: max 3 kraje/języki (wybierz najważniejsze dla regionu)

KRYTYCZNE ZASADY:
1. Każde zapytanie MUSI zawierać przetłumaczoną nazwę produktu + słowo "producent/manufacturer/Hersteller/fabricant"
2. NIGDY nie wymyślaj nowych kategorii produktów — trzymaj się DOKŁADNIE tego co podał użytkownik
3. Dodaj negatywne słowa kluczowe: ${negativeKeywords}
4. MAX 3-4 queries per kraj - każde musi być unikalne i precyzyjne

Output Format (JSON Only):
{
  "rationale": "Krótkie uzasadnienie strategii, nawiązanie do konkretnego produktu",
  "region_selected": "${params.region}",
  "languages_used": ["pl", "de", "en", ...],
  "strategies": [
    {
      "country": "Poland",
      "language": "pl",
      "queries": [
        "producent ${params.productName} Polska",
        "dostawca ${params.productName} hurtownia",
        "fabryka ${params.productName} Europa"
      ],
      "negatives": ["-allegro", "-olx", "-sklep", "-hurtownia"]
    }
  ]
}
    `;
        try {
            this.logger.log(`[STRATEGY] Calling Gemini API with prompt length: ${systemPrompt.length} chars`);
            const responseText = await this.geminiService.generateContent(systemPrompt);
            this.logger.log(`[STRATEGY] Gemini API response length: ${responseText.length} chars`);
            const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            this.logger.log(`[STRATEGY] Cleaned JSON length: ${jsonString.length} chars`);
            const result = JSON.parse(jsonString);
            this.logger.log(`Strategy Agent generated ${result.strategies?.length || 0} country strategies`);
            if (!result.strategies || result.strategies.length === 0) {
                this.logger.error(`[STRATEGY] No strategies generated! Full response: ${JSON.stringify(result).substring(0, 500)}`);
            }
            return result;
        }
        catch (e) {
            this.logger.error(`[STRATEGY] Failed to execute Strategy Agent: ${e.message}`);
            this.logger.error(`[STRATEGY] Error stack: ${e.stack}`);
            this.logger.error(`[STRATEGY] Full error object: ${JSON.stringify(e, null, 2)}`);
            return { error: e.message, strategies: [] };
        }
    }
};
exports.StrategyAgentService = StrategyAgentService;
exports.StrategyAgentService = StrategyAgentService = StrategyAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService])
], StrategyAgentService);
//# sourceMappingURL=strategy.agent.js.map