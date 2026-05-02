import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../common/services/gemini.service';
import { QueryCacheService } from '../../common/services/query-cache.service';
import { parseAiJson } from '../../common/utils/parse-ai-json';

/**
 * Phase 0 — estimates how many companies in the target countries produce / distribute
 * / cooperate on the buyer's product. Output drives the rest of the pipeline:
 *   - coverageTarget = how many suppliers we aim to surface on the shortlist
 *   - minimumTarget  = floor; pipeline shouldn't stop below this even if time-pressed
 *
 * The pipeline never blocks on this agent — failure degrades gracefully to a
 * "medium tier" default (target 80, minimum 30) so we always have SOMETHING
 * to drive auto-expansion against.
 */

export type MarketTier = 'narrow' | 'medium' | 'broad';
export type MarketConfidence = 'high' | 'medium' | 'low';
export type MarketSizeSource = 'llm' | 'cache' | 'fallback';

export interface MarketSizeInput {
    productName: string;
    productCategory?: string;
    supplyChainPosition?: string;
    positiveSignals?: string[];
    negativeSignals?: string[];
    targetCountries: string[]; // Polish names from regionConfig
    region: string; // EU / GLOBAL / CN / CUSTOM
    knownManufacturers?: { name: string; country?: string }[];
    industry?: string;
    sourcingMode?: string;
    requiredCertificates?: string[];
}

export interface MarketSizeResult {
    estimatedTotal: number;
    estimatedRange: [number, number];
    confidenceBand: MarketConfidence;
    reasoning: string;
    marketTier: MarketTier;
    coverageTarget: number;
    minimumTarget: number;
    anchorCompaniesUsed: number;
    source: MarketSizeSource;
    perCountry?: { country: string; low: number; high: number; reasoning: string }[];
}

const FALLBACK_RESULT: Omit<MarketSizeResult, 'anchorCompaniesUsed'> = {
    estimatedTotal: 100,
    estimatedRange: [50, 200],
    confidenceBand: 'low',
    reasoning: 'Market sizing unavailable; using default medium-tier assumption (target 80).',
    marketTier: 'medium',
    coverageTarget: 80,
    minimumTarget: 30,
    source: 'fallback',
};

@Injectable()
export class MarketSizeAgentService {
    private readonly logger = new Logger(MarketSizeAgentService.name);

    constructor(
        private readonly geminiService: GeminiService,
        private readonly queryCache: QueryCacheService,
    ) { }

    async execute(input: MarketSizeInput): Promise<MarketSizeResult> {
        const knownCount = input.knownManufacturers?.length ?? 0;

        // Cache key: product + countries + mandatory certs (fields that change market shape).
        const cacheKey = this.buildCacheKey(input);
        try {
            const cached = await this.queryCache.getCachedResults(cacheKey);
            if (cached && cached.length > 0 && cached[0].snippet) {
                const parsed: MarketSizeResult = JSON.parse(cached[0].snippet);
                this.logger.log(`[MARKET_SIZE] CACHE HIT ${cacheKey.substring(0, 60)} → tier=${parsed.marketTier}, target=${parsed.coverageTarget}`);
                return { ...parsed, source: 'cache', anchorCompaniesUsed: knownCount };
            }
        } catch { /* cache lookup non-critical */ }

        try {
            const prompt = this.buildPrompt(input);
            const raw = await this.geminiService.generateContent(prompt);
            const parsed = this.parseResponse(raw, knownCount);
            const result = this.computeTargets(parsed, knownCount);
            this.logger.log(
                `[MARKET_SIZE] LLM est=${result.estimatedTotal} range=[${result.estimatedRange[0]}, ${result.estimatedRange[1]}] tier=${result.marketTier} target=${result.coverageTarget} confidence=${result.confidenceBand}`,
            );
            // Cache 7d (override default TTL by writing manually-keyed result)
            this.queryCache.cacheResults(cacheKey, [
                { title: 'market-size', link: 'cache', snippet: JSON.stringify(result) },
            ]).catch(() => { /* non-critical */ });
            return result;
        } catch (e: any) {
            this.logger.error(`[MARKET_SIZE] Failed (${e.message}) — using fallback`);
            return { ...FALLBACK_RESULT, anchorCompaniesUsed: knownCount };
        }
    }

    private buildCacheKey(input: MarketSizeInput): string {
        const product = input.productName.toLowerCase().trim().replace(/\s+/g, ' ');
        const countries = [...input.targetCountries].sort().join(',').toLowerCase();
        const certs = [...(input.requiredCertificates || [])].sort().join(',').toLowerCase();
        return `marketsize:v1:${product}:${countries}:${certs}`;
    }

    private buildPrompt(input: MarketSizeInput): string {
        const knownList = (input.knownManufacturers || [])
            .map((m) => `- ${m.name}${m.country ? ` (${m.country})` : ''}`)
            .join('\n') || '(brak — szacuj samodzielnie)';
        const positives = (input.positiveSignals || []).join(', ') || 'brak';
        const negatives = (input.negativeSignals || []).join(', ') || 'brak';
        const countries = input.targetCountries.join(', ');
        const certBlock = input.requiredCertificates?.length
            ? `Wymagane certyfikaty: ${input.requiredCertificates.join(', ')} (zawęża rynek)`
            : '';
        const industryBlock = input.industry || input.sourcingMode
            ? `Branża: ${input.industry || '?'} | Tryb: ${input.sourcingMode || '?'}`
            : '';

        return `Jesteś analitykiem rynku przemysłowego B2B. Twoim zadaniem jest oszacować, ILE FIRM
realnie produkuje, dystrybuuje lub współpracuje przy wytwarzaniu poniższego produktu
w wybranych krajach. Nie zgaduj — oszacuj metodycznie i pokaż rozumowanie.

=== PRODUKT ===
Nazwa: "${input.productName}"
Kategoria: ${input.productCategory || 'N/A'}
Pozycja w łańcuchu dostaw: ${input.supplyChainPosition || 'N/A'}
Sygnały pozytywne (kogo szukamy): ${positives}
Sygnały negatywne (kogo NIE liczymy): ${negatives}
${certBlock}

=== KRAJE DOCELOWE ===
${countries}
Region preset: ${input.region}
${industryBlock}

=== ZNANI PRODUCENCI (FLOOR — twoje oszacowanie MUSI być >= tej liczby) ===
${knownList}
Liczba znanych: ${input.knownManufacturers?.length ?? 0}

=== ZADANIE — METODA BOTTOM-UP ===
1) Dla KAŻDEGO kraju z listy oszacuj liczbę firm (producentów + dystrybutorów + kooperantów),
   biorąc pod uwagę: wielkość gospodarki, znaczenie tej branży w danym kraju, znane klastry
   przemysłowe, członków stowarzyszeń branżowych, wystawców głównych targów.
2) Podaj DOLNĄ i GÓRNĄ granicę dla każdego kraju (estymacja przedziałowa).
3) Zsumuj. Ogłoś estimatedTotal jako medianę sumy dolnej i sumy górnej (zaokrągloną).
4) Confidence:
   - "high"   gdy stosunek high/low <= 1.6 i znasz konkretne stowarzyszenia/proxy
   - "medium" gdy 1.6 < high/low <= 3
   - "low"    gdy high/low > 3 lub nisza nieznana

=== KRYTYCZNE ===
- Nie wymyślaj liczb okrągłych "z sufitu" (50, 100, 500). Każda liczba musi mieć krótkie uzasadnienie.
- Liczymy CAŁY rynek dostępny do prospektowania (NIE samych top-tier graczy).
- Jeśli produkt jest super-niszowy (np. specjalistyczny komponent OEM), uczciwie podaj małą liczbę.
- Jeśli produkt jest commodity (np. opakowania kartonowe, proste komponenty stalowe), nie zaniżaj.
- estimatedTotal MUSI być >= ${input.knownManufacturers?.length ?? 0} (znani producenci to dolny floor).

Zwróć WYŁĄCZNIE JSON:
{
  "perCountry": [
    {"country":"Polska","low":12,"high":25,"reasoning":"silny sektor X, ~15 członków stowarzyszenia Y, 8 wystawców targów Z 2024"}
  ],
  "estimatedLow": <suma low>,
  "estimatedHigh": <suma high>,
  "estimatedTotal": <mediana>,
  "confidence": "high|medium|low",
  "reasoning": "2-3 zdania syntezy: dlaczego ten przedział, jakie były główne proxy"
}`;
    }

    private parseResponse(raw: string, knownCount: number): {
        estimatedTotal: number;
        estimatedRange: [number, number];
        confidenceBand: MarketConfidence;
        reasoning: string;
        perCountry?: MarketSizeResult['perCountry'];
    } {
        const obj = parseAiJson(raw) as any;
        if (!obj || typeof obj !== 'object') {
            throw new Error('non-object JSON');
        }
        const total = Math.max(
            knownCount, // floor
            Math.round(Number(obj.estimatedTotal) || 0),
        );
        if (!Number.isFinite(total) || total <= 0 || total > 100_000) {
            throw new Error(`out-of-range estimatedTotal=${obj.estimatedTotal}`);
        }
        const low = Math.max(knownCount, Math.round(Number(obj.estimatedLow) || total * 0.6));
        const high = Math.max(low, Math.round(Number(obj.estimatedHigh) || total * 1.5));
        const confidence: MarketConfidence = ['high', 'medium', 'low'].includes(obj.confidence) ? obj.confidence : 'low';
        return {
            estimatedTotal: total,
            estimatedRange: [low, high],
            confidenceBand: confidence,
            reasoning: String(obj.reasoning || '').substring(0, 400),
            perCountry: Array.isArray(obj.perCountry) ? obj.perCountry.slice(0, 30) : undefined,
        };
    }

    private computeTargets(
        parsed: ReturnType<MarketSizeAgentService['parseResponse']>,
        knownCount: number,
    ): MarketSizeResult {
        const { estimatedTotal } = parsed;
        let marketTier: MarketTier;
        let coverageTarget: number;
        let minimumTarget: number;
        if (estimatedTotal <= 30) {
            marketTier = 'narrow';
            coverageTarget = Math.max(7, Math.ceil(0.7 * estimatedTotal));
            minimumTarget = Math.max(5, Math.ceil(0.5 * estimatedTotal));
        } else if (estimatedTotal <= 300) {
            marketTier = 'medium';
            coverageTarget = 80;
            minimumTarget = 30;
        } else {
            marketTier = 'broad';
            coverageTarget = 250;
            minimumTarget = 80;
        }
        return {
            estimatedTotal: parsed.estimatedTotal,
            estimatedRange: parsed.estimatedRange,
            confidenceBand: parsed.confidenceBand,
            reasoning: parsed.reasoning,
            marketTier,
            coverageTarget,
            minimumTarget,
            anchorCompaniesUsed: knownCount,
            source: 'llm',
            perCountry: parsed.perCountry,
        };
    }
}
