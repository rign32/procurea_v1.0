import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../common/services/gemini.service';
import { ProductContext } from './screener.agent';

// Sanctioned countries — universal hard filter (Polish-normalized names)
export const SANCTIONED_COUNTRIES = new Set([
  'Rosja', 'Iran', 'Korea Północna', 'Syria', 'Białoruś',
  'Kuba', 'Myanmar', 'Wenezuela', 'Afganistan',
]);

// Region-specific language configurations
export const REGION_LANGUAGE_CONFIG: Record<string, {
  countries: string[];
  excludedCountries?: string[];
  allowedCountries?: string[];
  languages: { code: string; name: string; queryPrefix: string }[];
  searchSuffix: string[];
  negatives: string[];
}> = {
  // Poland only - Polish language
  PL: {
    countries: ['Poland'],
    allowedCountries: ['Polska'],
    languages: [
      { code: 'pl', name: 'Polish', queryPrefix: '' }
    ],
    searchSuffix: ['producent', 'zakład', 'fabryka'],
    negatives: ['-allegro', '-olx', '-sklep', '-hurtownia', '-ceneo', '-empik']
  },

  // Europe - 12 major EU languages (economically weighted)
  EU: {
    countries: ['Germany', 'Poland', 'Czech Republic', 'France', 'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium', 'Austria', 'Switzerland', 'Sweden', 'Romania', 'Denmark', 'Finland', 'Hungary'],
    allowedCountries: [
      'Niemcy', 'Polska', 'Czechy', 'Słowacja', 'Węgry', 'Austria', 'Francja',
      'Włochy', 'Hiszpania', 'Portugalia', 'Holandia', 'Belgia', 'Szwajcaria',
      'Szwecja', 'Rumunia', 'Dania', 'Finlandia', 'Norwegia', 'Wielka Brytania',
      'Irlandia', 'Chorwacja', 'Słowenia', 'Bułgaria', 'Litwa', 'Łotwa',
      'Estonia', 'Luksemburg', 'Grecja',
    ],
    languages: [
      { code: 'de', name: 'German', queryPrefix: '' },
      { code: 'pl', name: 'Polish', queryPrefix: '' },
      { code: 'cs', name: 'Czech', queryPrefix: '' },
      { code: 'fr', name: 'French', queryPrefix: '' },
      { code: 'it', name: 'Italian', queryPrefix: '' },
      { code: 'es', name: 'Spanish', queryPrefix: '' },
      { code: 'pt', name: 'Portuguese', queryPrefix: '' },
      { code: 'nl', name: 'Dutch', queryPrefix: '' },
      { code: 'en', name: 'English', queryPrefix: '' },
      { code: 'sv', name: 'Swedish', queryPrefix: '' },
      { code: 'ro', name: 'Romanian', queryPrefix: '' },
      { code: 'da', name: 'Danish', queryPrefix: '' },
    ],
    searchSuffix: ['manufacturer', 'Hersteller', 'producent', 'fabricant', 'fabbricante', 'fabricante', 'tillverkare', 'producător'],
    negatives: ['-amazon', '-ebay', '-alibaba', '-shop', '-store', '-allegro']
  },

  // Global without China — 25 languages, sanctioned countries excluded
  GLOBAL_NO_CN: {
    countries: ['USA', 'Germany', 'Japan', 'South Korea', 'India', 'Mexico', 'Brazil', 'UK', 'France', 'Italy', 'Poland', 'Taiwan', 'Vietnam', 'Thailand', 'Malaysia', 'Turkey', 'Czech Republic', 'Netherlands', 'Sweden', 'Switzerland', 'Austria', 'Indonesia', 'Spain', 'Portugal', 'Canada', 'Australia', 'Hungary', 'Romania', 'Denmark', 'Finland'],
    excludedCountries: ['CN', 'China', 'Chiny', 'Russia', 'Rosja', 'RU', 'Iran', 'IR', 'North Korea', 'Korea Północna', 'KP', 'Syria', 'SY', 'Afghanistan', 'Afganistan', 'AF', 'Cuba', 'Kuba', 'CU', 'Venezuela', 'VE', 'Myanmar', 'MM', 'Belarus', 'Białoruś', 'BY'],
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
      { code: 'tr', name: 'Turkish', queryPrefix: '' },
      { code: 'id', name: 'Indonesian', queryPrefix: '' },
      { code: 'ms', name: 'Malay', queryPrefix: '' },
      { code: 'nl', name: 'Dutch', queryPrefix: '' },
      { code: 'sv', name: 'Swedish', queryPrefix: '' },
      { code: 'cs', name: 'Czech', queryPrefix: '' },
      { code: 'ro', name: 'Romanian', queryPrefix: '' },
      { code: 'hu', name: 'Hungarian', queryPrefix: '' },
      { code: 'da', name: 'Danish', queryPrefix: '' },
      { code: 'fi', name: 'Finnish', queryPrefix: '' },
      { code: 'ar', name: 'Arabic', queryPrefix: '' },
      { code: 'he', name: 'Hebrew', queryPrefix: '' },
      { code: 'el', name: 'Greek', queryPrefix: '' },
    ],
    searchSuffix: ['manufacturer', 'factory', 'producer', 'OEM supplier'],
    negatives: ['-amazon', '-ebay', '-alibaba', '-aliexpress', '-taobao', '-1688', '-shop', '-store', '-china', '-chinese']
  },

  // Global with China — 25+ languages, sanctioned countries excluded
  GLOBAL: {
    countries: ['USA', 'Germany', 'Japan', 'China', 'South Korea', 'India', 'Mexico', 'Brazil', 'UK', 'France', 'Italy', 'Poland', 'Taiwan', 'Vietnam', 'Thailand', 'Malaysia', 'Turkey', 'Czech Republic', 'Netherlands', 'Sweden', 'Switzerland', 'Austria', 'Indonesia', 'Spain', 'Portugal', 'Canada', 'Australia', 'Hungary', 'Romania', 'Denmark', 'Finland'],
    excludedCountries: ['Russia', 'Rosja', 'RU', 'Iran', 'IR', 'North Korea', 'Korea Północna', 'KP', 'Syria', 'SY', 'Afghanistan', 'Afganistan', 'AF', 'Cuba', 'Kuba', 'CU', 'Venezuela', 'VE', 'Myanmar', 'MM', 'Belarus', 'Białoruś', 'BY'],
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
      { code: 'tr', name: 'Turkish', queryPrefix: '' },
      { code: 'id', name: 'Indonesian', queryPrefix: '' },
      { code: 'ms', name: 'Malay', queryPrefix: '' },
      { code: 'nl', name: 'Dutch', queryPrefix: '' },
      { code: 'sv', name: 'Swedish', queryPrefix: '' },
      { code: 'cs', name: 'Czech', queryPrefix: '' },
      { code: 'ro', name: 'Romanian', queryPrefix: '' },
      { code: 'hu', name: 'Hungarian', queryPrefix: '' },
      { code: 'da', name: 'Danish', queryPrefix: '' },
      { code: 'fi', name: 'Finnish', queryPrefix: '' },
      { code: 'ar', name: 'Arabic', queryPrefix: '' },
      { code: 'he', name: 'Hebrew', queryPrefix: '' },
    ],
    searchSuffix: ['manufacturer', 'factory', 'producer', 'OEM supplier', '工厂', '制造商'],
    negatives: ['-amazon', '-ebay', '-shop', '-store']
  }
};

@Injectable()
export class StrategyAgentService {
  private readonly logger = new Logger(StrategyAgentService.name);

  constructor(private readonly geminiService: GeminiService) { }

  async execute(params: {
    productName: string;
    description: string;
    keywords: string[];
    category: string;
    material: string;
    region: string;
    eau: number;
    productContext?: ProductContext;
  }): Promise<any> {
    this.logger.log(`Executing Strategy Agent for "${params.productName}" in region: ${params.region}`);

    // Get region configuration or default to EU
    const regionConfig = REGION_LANGUAGE_CONFIG[params.region as keyof typeof REGION_LANGUAGE_CONFIG]
      || REGION_LANGUAGE_CONFIG.EU;

    const languageInstructions = regionConfig.languages
      .map(l => `- ${l.name} (${l.code})`)
      .join('\n');

    const targetCountries = regionConfig.countries.join(', ');
    const negativeKeywords = regionConfig.negatives.join(' ');

    // Build rich product context
    const keywordsStr = params.keywords.length > 0 ? params.keywords.join(', ') : 'brak';
    const categoryStr = params.category || 'nie podano';
    const materialStr = params.material || 'nie podano';

    // Build product context block for strategy prompt
    let productContextBlock = '';
    const pc = params.productContext;
    if (pc) {
      const translationsBlock = Object.entries(pc.productTranslations || {})
        .map(([lang, translation]) => `  - ${lang}: "${translation}"`)
        .join('\n');

      productContextBlock = `
=== KONTEKST PRODUKTU (KRYTYCZNY — przeczytaj przed generowaniem zapytań) ===
PRODUKT DOCELOWY: ${pc.coreProduct}
KATEGORIA: ${pc.productCategory}
UWAGA: ${pc.disambiguationNote}

SYGNAŁY POZYTYWNE (szukaj firm z tymi terminami):
${pc.positiveSignals.map(s => `  ✅ ${s}`).join('\n')}

SYGNAŁY NEGATYWNE (UNIKAJ firm z tymi terminami — to firmy UŻYWAJĄCE produktu, nie produkujące go):
${pc.negativeSignals.map(s => `  ❌ ${s}`).join('\n')}

WAŻNE: NIE dodawaj negatywnych sygnałów jako "-keyword" do zapytań Google!
Zapytania powinny być POZYTYWNE — szukaj producentów, nie filtruj nadmiernie.
Negatywne sygnały służą jedynie Tobie do zrozumienia kontekstu i unikania złych kierunków.

TŁUMACZENIA PRODUKTU (użyj tych zamiast samodzielnego tłumaczenia):
${translationsBlock || '  (brak — przetłumacz samodzielnie)'}
`;
    }

    // Use clean product name from context when available (avoids "Kampania:" prefix leaking)
    const effectiveProductName = pc ? pc.coreProduct : params.productName;

    const systemPrompt = `
Jesteś Ekspertem Strategii Sourcingu Przemysłowego (Industrial Sourcing Strategist).
Twoim celem jest znalezienie JAK NAJWIĘKSZEJ LICZBY REALNYCH PRODUCENTÓW dla podanego produktu/surowca.
CHCEMY ZNALEŹĆ 200-300 PRODUCENTÓW w wybranym regionie. GENERUJ MAKSYMALNĄ LICZBĘ UNIKALNYCH ZAPYTAŃ.
${productContextBlock}
=== PRODUKT / SUROWIEC DO ZNALEZIENIA ===
**NAZWA:** "${effectiveProductName}"
**OPIS:** "${params.description}"
**SŁOWA KLUCZOWE:** ${keywordsStr}
**KATEGORIA:** ${categoryStr}
**MATERIAŁ:** ${materialStr}
**SKALA (EAU):** ${params.eau} szt./rok
**REGION:** ${params.region}

WAŻNE: Zapytania wyszukiwania MUSZĄ być bezpośrednio związane z produktem "${effectiveProductName}".
Nie zgaduj ani nie interpretuj — szukaj DOKŁADNIE tego, co użytkownik opisał powyżej.
Jeśli produkt to surowiec (np. "aluminium ekstrudowane"), szukaj PRODUCENTÓW/DOSTAWCÓW tego surowca,
a NIE producentów gotowych wyrobów z tego materiału.

=== OGRANICZENIE REGIONALNE ===
Twoje zapytania MUSZĄ być ograniczone do następujących krajów:
${targetCountries}

Używaj następujących JĘZYKÓW w zapytaniach:
${languageInstructions}

=== KRYTYCZNE WYMAGANIA ===
1. Generuj 20-30 zapytań PER JĘZYK/KRAJ — potrzebujemy MAKSYMALNEJ RÓŻNORODNOŚCI i pokrycia!
2. Każde zapytanie MUSI być bezpośrednio związane z "${effectiveProductName}" — NIE zgaduj pokrewnych kategorii!
3. Używaj RÓŻNYCH strategii (WSZYSTKIE poniższe typy dla każdego języka):
   - TECHNOLOGICZNA: proces produkcyjny / technologia + "${effectiveProductName}"
   - PRODUKTOWA: "${effectiveProductName}" + "manufacturer/producent/Hersteller"
   - KATALOGOWA: "lista producentów" / "list of manufacturers" + "${effectiveProductName}"
   - CERTYFIKACYJNA: "ISO 9001" OR "ISO 14001" + "${effectiveProductName}" + "producent/manufacturer"
   - BRANŻOWA: targi branżowe / industrial fair + "${effectiveProductName}" + exhibitor list
   - KATALOG B2B: europages / kompass / thomasnet / wlw.de + "${effectiveProductName}"
   - SUROWCOWA: dostawca surowca / raw material supplier + "${effectiveProductName}"
   - NISZOWA: specjalistyczne portale branżowe + "${effectiveProductName}"
   - STOWARZYSZENIOWA: lista członków stowarzyszenia branżowego + "${effectiveProductName}"
   - TARGOWA: "lista wystawców" / "exhibitor list" + targi branżowe + "${effectiveProductName}" + 2024 OR 2025 OR 2026
   - EKSPORTOWA: "baza eksporterów" / "export directory" + "${effectiveProductName}" + kraj
   - ŁAŃCUCH DOSTAW: "nasi dostawcy" / "our suppliers" / "approved vendors" + "${effectiveProductName}"
   - REJESTROWA: rejestr firm (KRS / Handelsregister / Companies House) + "producent" + "${effectiveProductName}"
4. Dla każdego kraju generuj zapytania w LOKALNYM JĘZYKU (tłumacz nazwę produktu!)
5. LIMIT: max 12 krajów/języków dla EU, max 25 dla GLOBAL (wybierz najważniejsze gospodarczo)

KRYTYCZNE ZASADY:
1. Każde zapytanie MUSI zawierać przetłumaczoną nazwę produktu + słowo "producent/manufacturer/Hersteller/fabricant"
2. NIGDY nie wymyślaj nowych kategorii produktów — trzymaj się DOKŁADNIE tego co podał użytkownik
3. Dodaj negatywne słowa kluczowe: ${negativeKeywords}
4. 20-30 queries per kraj — każde musi być unikalne, precyzyjne i pokrywać INNY typ strategii
5. WYKLUCZ kraje objęte sankcjami: Rosja, Iran, Korea Północna, Syria, Afganistan, Kuba, Wenezuela, Myanmar, Białoruś
6. Dla KAŻDEGO kraju musisz mieć przynajmniej po 1 zapytaniu z typów: TARGOWA, STOWARZYSZENIOWA, KATALOG B2B, ŁAŃCUCH DOSTAW

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
        "producent ${effectiveProductName} Polska",
        "dostawca ${effectiveProductName} hurtownia",
        "fabryka ${effectiveProductName} Europa"
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

      // POST-PROCESSING: Augment each strategy with specialized query templates
      // These ensure coverage of search verticals that Gemini might miss
      if (result.strategies && result.strategies.length > 0) {
        const pc = params.productContext;
        const translations = pc?.productTranslations || {};

        for (const strategy of result.strategies) {
          const lang = strategy.language || 'en';
          const localProduct = translations[lang] || effectiveProductName;
          const countryName = strategy.country || '';

          const specializedQueries = [
            // Trade show exhibitor lists
            `"${localProduct}" exhibitor list ${countryName}`,
            // Industry association member lists
            `"${localProduct}" association members ${countryName}`,
            // "Our suppliers" / supply chain pages
            `"${localProduct}" "our suppliers" OR "approved vendors"`,
            // B2B directory targeted searches
            `site:europages.com "${localProduct}" ${countryName}`,
            `site:kompass.com "${localProduct}" ${countryName}`,
            // Certification registries
            `"${localProduct}" "ISO 9001" certificate holder ${countryName}`,
            // OEM manufacturer search
            `"${localProduct}" OEM manufacturer ${countryName}`,
          ];

          // Add alternative product names from context
          if (pc?.alternativeNames) {
            for (const altName of pc.alternativeNames.slice(0, 3)) {
              specializedQueries.push(`"${altName}" manufacturer ${countryName}`);
            }
          }

          // Add trade show queries from context
          if (pc?.majorTradeShows) {
            for (const show of pc.majorTradeShows.slice(0, 2)) {
              specializedQueries.push(`"${show}" exhibitor "${localProduct}"`);
            }
          }

          // Add association queries from context
          if (pc?.industryAssociations) {
            for (const assoc of pc.industryAssociations.slice(0, 2)) {
              specializedQueries.push(`"${assoc}" member list`);
            }
          }

          // Deduplicate: only add queries not already present
          const existingSet = new Set(strategy.queries.map((q: string) => q.toLowerCase().trim()));
          for (const sq of specializedQueries) {
            const normalized = sq.toLowerCase().trim();
            if (!existingSet.has(normalized)) {
              strategy.queries.push(sq);
              existingSet.add(normalized);
            }
          }

          this.logger.log(`[STRATEGY] Augmented ${countryName}/${lang}: ${strategy.queries.length} total queries`);
        }
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
