import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../common/services/gemini.service';

// Region-specific language configurations
const REGION_LANGUAGE_CONFIG = {
  // Poland only - Polish language
  PL: {
    countries: ['Poland'],
    languages: [
      { code: 'pl', name: 'Polish', queryPrefix: '' }
    ],
    searchSuffix: ['producent', 'zakład', 'fabryka'],
    negatives: ['-allegro', '-olx', '-sklep', '-hurtownia', '-ceneo', '-empik']
  },

  // Europe - All major European languages
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

  // Global without China
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

  // Global with China
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

@Injectable()
export class StrategyAgentService {
  private readonly logger = new Logger(StrategyAgentService.name);

  constructor(private readonly geminiService: GeminiService) { }

  async execute(params: { category: string; material: string; region: string; eau: number }): Promise<any> {
    this.logger.log(`Executing Strategy Agent with region: ${params.region}`);

    // Get region configuration or default to EU
    const regionConfig = REGION_LANGUAGE_CONFIG[params.region as keyof typeof REGION_LANGUAGE_CONFIG]
      || REGION_LANGUAGE_CONFIG.EU;

    const languageInstructions = regionConfig.languages
      .map(l => `- ${l.name} (${l.code})`)
      .join('\n');

    const targetCountries = regionConfig.countries.join(', ');
    const negativeKeywords = regionConfig.negatives.join(' ');

    const systemPrompt = `
Jesteś Ekspertem Strategii Sourcingu Przemysłowego (Industrial Sourcing Strategist).
Twoim celem jest znalezienie JAK NAJWIĘKSZEJ LICZBY REALNYCH PRODUCENTÓW dla podanych części.
CHCEMY ZNALEŹĆ 100-250+ PRODUCENTÓW na całym świecie.

PARAMETRY WEJŚCIOWE:
1. Kategoria: "${params.category}"
2. Materiał: "${params.material}"
3. Region: "${params.region}"
4. Skala (EAU): ${params.eau}

=== OGRANICZENIE REGIONALNE ===
Twoje zapytania MUSZĄ być ograniczone do następujących krajów:
${targetCountries}

Używaj następujących JĘZYKÓW w zapytaniach:
${languageInstructions}

=== KRYTYCZNE WYMAGANIA ===
1. Generuj MINIMUM 8-10 różnych zapytań PER JĘZYK/KRAJ
2. Używaj RÓŻNYCH strategii wyszukiwania:
   - Strategia TECHNOLOGICZNA: szukaj procesu produkcyjnego (np. "SMT assembly manufacturer")
   - Strategia PRODUKTOWA: szukaj typu produktu (np. "IoT controller manufacturer")
   - Strategia OEM/EMS: szukaj firm typu contract manufacturing
   - Strategia KATALOGOWA: szukaj list producentów (np. "list of PCB manufacturers")
   - Strategia CERTYFIKACYJNA: szukaj po certyfikatach (np. "ISO 13485 electronics manufacturer")
   - Strategia GEOGRAFICZNA: szukaj regionalne (np. "Shenzhen PCB factory")
3. Dla każdego kraju generuj zapytania w LOKALNYM JĘZYKU
4. NIE POWTARZAJ dokładnie tych samych queries między krajami

KROK 1: ANALIZA
- Jakie są kluczowe procesy produkcyjne?
- Jakie synonimy/warianty nazw produktu istnieją?
- Jakie certyfikaty są typowe dla tej branży?
- Jakie regiony/miasta są hubami produkcyjnymi?

KROK 2: GENERUJ DUŻO QUERIES (8-10 per kraj)
Przykłady typów queries:
- "IoT controller manufacturer OEM"
- "embedded systems contract manufacturing"
- "list of industrial electronics manufacturers Europe"
- "PCB assembly factory Shenzhen"
- "EMS electronics manufacturing services company"
- "ISO 9001 electronics producer"

KRYTYCZNE ZASADY:
1. Każde zapytanie MUSI zawierać słowo "producent/manufacturer/Hersteller/fabricant/工厂" w lokalnym języku
2. NIGDY nie szukaj samych nazw produktów bez kontekstu "producent"
3. Dodaj negatywne słowa kluczowe: ${negativeKeywords}
4. Generuj DUŻO queries - chcemy znaleźć WSZYSTKICH producentów

Output Format (JSON Only):
{
  "rationale": "Krótkie uzasadnienie strategii",
  "region_selected": "${params.region}",
  "languages_used": ["pl", "de", "en", ...],
  "strategies": [
    {
      "country": "Poland",
      "language": "pl",
      "queries": [
        "producent kontrolerów IoT Polska",
        "fabryka elektroniki przemysłowej",
        "producent płyt PCB OEM",
        "produkcja kontraktowa elektroniki EMS",
        "lista producentów elektroniki Polska",
        "zakład montażu SMT ISO 9001",
        "producent systemów embedded",
        "firma elektroniczna certyfikat IATF"
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
    } catch (e) {
      this.logger.error(`[STRATEGY] Failed to execute Strategy Agent: ${e.message}`);
      this.logger.error(`[STRATEGY] Error stack: ${e.stack}`);
      this.logger.error(`[STRATEGY] Full error object: ${JSON.stringify(e, null, 2)}`);
      return { error: e.message, strategies: [] };
    }
  }
}
