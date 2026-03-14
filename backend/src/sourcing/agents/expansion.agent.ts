import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../common/services/gemini.service';
import { ProductContext } from './screener.agent';

export interface ExpansionInput {
    productContext: ProductContext | null;
    topSuppliers: { name: string; country: string; city?: string; specialization?: string; website?: string }[];
    lowCoverageCountries: { country: string; language: string; count: number }[];
    discoveredDirectories: { url: string; companiesFound: number }[];
    region: string;
    allowedCountries?: string[];
}

export interface ExpansionQuery {
    query: string;
    type: 'competitor' | 'geographic_gap' | 'directory' | 'association' | 'trade_show' | 'niche' | 'supply_chain';
    language: string;
    country: string;
}

export interface ExpansionResult {
    expansion_queries: ExpansionQuery[];
    directories_to_mine: { url: string; reason: string }[];
}

@Injectable()
export class ExpansionAgentService {
    private readonly logger = new Logger(ExpansionAgentService.name);

    constructor(private readonly geminiService: GeminiService) {}

    async execute(input: ExpansionInput): Promise<ExpansionResult> {
        this.logger.log(`[EXPANSION] Starting expansion pass with ${input.topSuppliers.length} top suppliers, ${input.lowCoverageCountries.length} low-coverage countries`);

        const pc = input.productContext;
        const productName = pc?.coreProduct || 'unknown product';

        const suppliersBlock = input.topSuppliers
            .map(s => `- ${s.name} (${s.country}${s.city ? ', ' + s.city : ''}) — ${s.specialization || 'N/A'}${s.website ? ' [' + s.website + ']' : ''}`)
            .join('\n');

        const lowCoverageBlock = input.lowCoverageCountries
            .map(c => `- ${c.country} (${c.language}): tylko ${c.count} dostawców znalezionych`)
            .join('\n');

        const directoriesBlock = input.discoveredDirectories
            .map(d => `- ${d.url} (${d.companiesFound} firm)`)
            .join('\n');

        const associationsBlock = pc?.industryAssociations?.length
            ? pc.industryAssociations.map(a => `- ${a}`).join('\n')
            : '(brak danych)';

        const tradeShowsBlock = pc?.majorTradeShows?.length
            ? pc.majorTradeShows.map(t => `- ${t}`).join('\n')
            : '(brak danych)';

        const prompt = `
Jesteś Ekspertem od Intelligence Sourcingowego przeprowadzającym DRUGI PRZEBIEG wyszukiwania dostawców.
Pierwszy przebieg już znalazł część dostawców. Twoim zadaniem jest znaleźć TYCH, KTÓRYCH BRAKUJE.

=== PRODUKT ===
"${productName}"
Kategoria: ${pc?.productCategory || 'N/A'}
Pozycja w łańcuchu: ${pc?.supplyChainPosition || 'N/A'}

=== NAJLEPSI ZNALEZIENI DOSTAWCY (${input.topSuppliers.length}) ===
${suppliersBlock || '(brak)'}

=== KRAJE Z NISKIM POKRYCIEM ===
${lowCoverageBlock || '(brak — pokrycie równomierne)'}

=== KATALOGI/PORTALE ZNALEZIONE W PIERWSZYM PRZEBIEGU ===
${directoriesBlock || '(brak)'}

=== ZNANE STOWARZYSZENIA BRANŻOWE ===
${associationsBlock}

=== ZNANE TARGI BRANŻOWE ===
${tradeShowsBlock}

=== OGRANICZENIE REGIONALNE ===
Region: ${input.region}
${input.allowedCountries?.length ? `DOZWOLONE KRAJE: ${input.allowedCountries.join(', ')}` : ''}
KRYTYCZNE: Generuj zapytania WYŁĄCZNIE dla krajów w tym regionie.
${input.region === 'PL' ? 'Szukaj TYLKO w Polsce, używaj TYLKO języka polskiego.' : ''}
${['US', 'GB', 'AU'].includes(input.region) ? `Search ONLY in ${input.region === 'US' ? 'the United States' : input.region === 'GB' ? 'the United Kingdom' : 'Australia'}, use ONLY English.` : ''}
${input.region === 'CA' ? 'Search ONLY in Canada, use English and French.' : ''}
${input.region === 'CN' ? 'Search ONLY in China, use Chinese and English.' : ''}
NIE generuj zapytań dla krajów spoza tego regionu, nawet jeśli konkurenci tam działają.

=== TWOJE ZADANIE ===
Wygeneruj 15-25 NOWYCH zapytań wyszukiwania, które znajdą dostawców POMINIĘTYCH w pierwszym przebiegu.

TYPY ZAPYTAŃ DO WYGENEROWANIA:
1. COMPETITOR: Znajdź konkurentów już znalezionych dostawców
   - Użyj nazw znalezionych firm: "firmy podobne do [Nazwa]", "[Nazwa] competitors"
2. GEOGRAPHIC_GAP: Celowane zapytania w krajach z niskim pokryciem
   - Zapytania w lokalnym języku danego kraju
3. DIRECTORY: Głębsze kopanie w znalezionych portalach/katalogach
   - Specyficzne podstrony z listami firm
4. ASSOCIATION: Listy członków stowarzyszeń branżowych
   - "member list", "lista członków", "Mitglieder"
5. TRADE_SHOW: Listy wystawców targów branżowych
   - "exhibitor list 2024", "lista wystawców"
6. NICHE: Zapytania niszowe z terminologią techniczną
   - Użyj specjalizacji z najlepszych dostawców
7. SUPPLY_CHAIN: Łańcuch dostaw — znajdź dostawców przez ich klientów
   - "our suppliers", "approved vendors", "supply chain"

WAŻNE:
- Zapytania MUSZĄ być w odpowiednim języku dla danego kraju
- Każde zapytanie musi zawierać nazwę produktu lub jej tłumaczenie
- Skup się na krajach z niskim pokryciem
- Unikaj powtarzania zapytań z pierwszego przebiegu

Zwróć JSON:
{
  "expansion_queries": [
    {"query": "zapytanie wyszukiwania", "type": "competitor|geographic_gap|directory|association|trade_show|niche|supply_chain", "language": "pl", "country": "Poland"}
  ],
  "directories_to_mine": [
    {"url": "https://example.com/manufacturers-list", "reason": "Dlaczego warto kopać głębiej"}
  ]
}
`;

        try {
            const responseText = await this.geminiService.generateContent(prompt);
            const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(jsonString);

            const queries = Array.isArray(result.expansion_queries) ? result.expansion_queries : [];
            const directories = Array.isArray(result.directories_to_mine) ? result.directories_to_mine : [];

            this.logger.log(`[EXPANSION] Generated ${queries.length} expansion queries, ${directories.length} directories to mine`);

            return {
                expansion_queries: queries,
                directories_to_mine: directories,
            };
        } catch (e) {
            this.logger.error(`[EXPANSION] Failed to execute Expansion Agent: ${e.message}`);
            return {
                expansion_queries: this.generateFallbackQueries(input),
                directories_to_mine: [],
            };
        }
    }

    /**
     * Fallback: generate basic expansion queries without AI
     */
    private generateFallbackQueries(input: ExpansionInput): ExpansionQuery[] {
        const queries: ExpansionQuery[] = [];
        const productName = input.productContext?.coreProduct || '';
        const translations = input.productContext?.productTranslations || {};

        // Competitor queries for top suppliers
        for (const supplier of input.topSuppliers.slice(0, 5)) {
            queries.push({
                query: `"${supplier.name}" competitors ${productName}`,
                type: 'competitor',
                language: 'en',
                country: supplier.country,
            });
        }

        // Geographic gap queries
        for (const gap of input.lowCoverageCountries.slice(0, 5)) {
            const localProduct = translations[gap.language] || productName;
            queries.push({
                query: `"${localProduct}" manufacturer ${gap.country}`,
                type: 'geographic_gap',
                language: gap.language,
                country: gap.country,
            });
        }

        // Trade show queries
        if (input.productContext?.majorTradeShows) {
            for (const show of input.productContext.majorTradeShows.slice(0, 3)) {
                queries.push({
                    query: `"${show}" exhibitor list ${productName}`,
                    type: 'trade_show',
                    language: 'en',
                    country: 'Global',
                });
            }
        }

        return queries;
    }
}
