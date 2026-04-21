import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../../common/services/gemini.service';
import { parseAiJson } from '../../common/utils/parse-ai-json';

export type Industry =
  | 'manufacturing'
  | 'events'
  | 'construction'
  | 'horeca'
  | 'healthcare'
  | 'retail'
  | 'logistics'
  | 'mro'
  | 'other';

export type SourcingMode = 'product' | 'service' | 'mixed';

export interface ParsedBrief {
  productName: string;
  industry: Industry;
  sourcingMode: SourcingMode;
  description?: string;
  material?: string;
  quantity?: number;
  unit?: string;
  eau?: number;
  partNumber?: string;

  targetRegion?: 'PL' | 'EU' | 'GLOBAL' | 'GLOBAL_NO_CN' | 'CUSTOM';
  targetCountries?: string[];
  city?: string;

  eventDate?: string;
  headcount?: number;
  specialRequirements?: string;

  requiredCertificates?: string[];
  suggestedCertificates?: string[];

  incoterms?: string[];
  desiredDeliveryDate?: string;
  targetPrice?: number;
  currency?: string;

  confidence: number;
  notes?: string;
}

const INDUSTRY_GUIDE = `
- manufacturing: raw materials, components, injection molding, metal parts, chemicals, packaging for industrial use
- events: catering, AV, staging, hostesses, decoration, gadgets for a specific event (has city + date)
- construction: subcontractors (HVAC, electrical, finishes) or materials (steel, concrete, insulation) for a building site
- horeca: F&B supply for hotels/restaurants, kitchen equipment, olive oil, dairy, meat
- healthcare: medical devices, disposables, lab equipment (compliance-heavy: CE/MDR/FDA/ISO 13485)
- retail: private label manufacturing (cosmetics, textiles, packaging), import sourcing
- logistics: racking systems, conveyor belts, spare parts, 3PL services
- mro: maintenance parts, bearings, industrial components, facility maintenance services
- other: anything that does not fit the above
`.trim();

@Injectable()
export class BriefParserAgent {
  private readonly logger = new Logger(BriefParserAgent.name);

  constructor(private readonly gemini: GeminiService) {}

  async parse(brief: string, hints?: { industry?: Industry; sourcingMode?: SourcingMode; language?: string }): Promise<ParsedBrief> {
    const language = hints?.language || 'pl';
    const prompt = this.buildPrompt(brief, hints);

    try {
      const raw = await this.gemini.generateContent(prompt);
      const parsed = parseAiJson<Partial<ParsedBrief>>(raw);
      if (!parsed || !parsed.productName) {
        this.logger.warn(`Brief parser returned invalid JSON, falling back. Raw: ${raw?.slice(0, 200)}`);
        return this.fallback(brief, hints);
      }
      return this.normalize(parsed, hints, language);
    } catch (err: any) {
      this.logger.error(`Brief parser failed: ${err.message}`);
      return this.fallback(brief, hints);
    }
  }

  private buildPrompt(brief: string, hints?: { industry?: Industry; sourcingMode?: SourcingMode; language?: string }): string {
    const hintIndustry = hints?.industry ? `User picked industry: ${hints.industry}. Confirm or override only if clearly wrong.` : 'Infer industry.';
    const hintMode = hints?.sourcingMode ? `User picked sourcing mode: ${hints.sourcingMode}. Confirm or override only if clearly wrong.` : 'Infer sourcing mode.';

    return `You are a procurement sourcing intake assistant. Parse a free-text brief from a buyer into structured fields for a sourcing campaign.

BRIEF (raw user input):
"""
${brief}
"""

${hintIndustry}
${hintMode}

Industry taxonomy:
${INDUSTRY_GUIDE}

Sourcing mode:
- product: buyer wants to purchase a physical good (material, component, finished product)
- service: buyer wants to hire a contractor/supplier to perform work (catering, HVAC install, subcontractor)
- mixed: both (e.g. HVAC system + installation)

Extraction rules:
- productName: short canonical label (max 100 chars), in the original language of the brief.
- industry: one of [manufacturing, events, construction, horeca, healthcare, retail, logistics, mro, other]
- sourcingMode: one of [product, service, mixed]
- quantity + unit: only if explicit in brief (e.g. "1000 kg", "500 osób", "200 szt")
- city: only for events / construction where location is a specific city, not a country
- eventDate: ISO date (YYYY-MM-DD) if brief mentions a date
- headcount: integer if brief says "for N people"
- targetRegion: one of [PL, EU, GLOBAL, GLOBAL_NO_CN, CUSTOM]. Use CUSTOM with targetCountries when brief names countries explicitly.
- targetCountries: ISO-2 codes (DE, PL, FR...) when relevant
- requiredCertificates: only those explicitly demanded in the brief (e.g. "HACCP certified", "ISO 9001 required")
- suggestedCertificates: compliance defaults for the industry that the buyer likely needs but didn't mention (e.g. healthcare → CE, MDR, ISO 13485)
- specialRequirements: free-text note for things like "vegan options", "gluten-free", "24/7 SLA"
- confidence: 0-1 float — how confident you are in the parse (low if brief is vague)
- notes: 1-sentence note to the buyer if brief is ambiguous or missing key info

Return STRICT JSON, no markdown, no preamble. Schema:
{
  "productName": string,
  "industry": string,
  "sourcingMode": string,
  "description": string | null,
  "material": string | null,
  "quantity": number | null,
  "unit": string | null,
  "eau": number | null,
  "partNumber": string | null,
  "targetRegion": string | null,
  "targetCountries": string[] | null,
  "city": string | null,
  "eventDate": string | null,
  "headcount": number | null,
  "specialRequirements": string | null,
  "requiredCertificates": string[] | null,
  "suggestedCertificates": string[] | null,
  "incoterms": string[] | null,
  "desiredDeliveryDate": string | null,
  "targetPrice": number | null,
  "currency": string | null,
  "confidence": number,
  "notes": string | null
}
Response language for description/notes: ${hints?.language || 'en'}.`;
  }

  private normalize(parsed: Partial<ParsedBrief>, hints: { industry?: Industry; sourcingMode?: SourcingMode } | undefined, language: string): ParsedBrief {
    const industry = this.normalizeIndustry(parsed.industry, hints?.industry);
    const sourcingMode = this.normalizeMode(parsed.sourcingMode, hints?.sourcingMode);
    return {
      productName: (parsed.productName || '').toString().slice(0, 200),
      industry,
      sourcingMode,
      description: parsed.description || undefined,
      material: parsed.material || undefined,
      quantity: typeof parsed.quantity === 'number' ? parsed.quantity : undefined,
      unit: parsed.unit || undefined,
      eau: typeof parsed.eau === 'number' ? parsed.eau : undefined,
      partNumber: parsed.partNumber || undefined,
      targetRegion: this.normalizeRegion(parsed.targetRegion),
      targetCountries: this.normalizeCountries(parsed.targetCountries),
      city: parsed.city || undefined,
      eventDate: parsed.eventDate || undefined,
      headcount: typeof parsed.headcount === 'number' ? parsed.headcount : undefined,
      specialRequirements: parsed.specialRequirements || undefined,
      requiredCertificates: Array.isArray(parsed.requiredCertificates) ? parsed.requiredCertificates : undefined,
      suggestedCertificates: Array.isArray(parsed.suggestedCertificates) ? parsed.suggestedCertificates : undefined,
      incoterms: Array.isArray(parsed.incoterms) ? parsed.incoterms : undefined,
      desiredDeliveryDate: parsed.desiredDeliveryDate || undefined,
      targetPrice: typeof parsed.targetPrice === 'number' ? parsed.targetPrice : undefined,
      currency: parsed.currency || undefined,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      notes: parsed.notes || undefined,
    };
  }

  private normalizeIndustry(value: string | undefined, hint: Industry | undefined): Industry {
    const valid: Industry[] = ['manufacturing', 'events', 'construction', 'horeca', 'healthcare', 'retail', 'logistics', 'mro', 'other'];
    if (value && valid.includes(value as Industry)) return value as Industry;
    if (hint && valid.includes(hint)) return hint;
    return 'other';
  }

  private normalizeMode(value: string | undefined, hint: SourcingMode | undefined): SourcingMode {
    const valid: SourcingMode[] = ['product', 'service', 'mixed'];
    if (value && valid.includes(value as SourcingMode)) return value as SourcingMode;
    if (hint && valid.includes(hint)) return hint;
    return 'product';
  }

  private normalizeRegion(value: any): ParsedBrief['targetRegion'] {
    const valid = ['PL', 'EU', 'GLOBAL', 'GLOBAL_NO_CN', 'CUSTOM'];
    if (typeof value === 'string' && valid.includes(value.toUpperCase())) {
      return value.toUpperCase() as ParsedBrief['targetRegion'];
    }
    return undefined;
  }

  /**
   * ISO-3166-1 alpha-2 guardrail — drops AI-emitted garbage like ["Berlin"] or ["Germany"]
   * so the pipeline never sees invalid country codes.
   */
  private normalizeCountries(value: any): string[] | undefined {
    if (!Array.isArray(value)) return undefined;
    const isoPattern = /^[A-Z]{2}$/;
    const cleaned = value
      .map(v => (typeof v === 'string' ? v.trim().toUpperCase() : ''))
      .filter(code => isoPattern.test(code));
    return cleaned.length ? Array.from(new Set(cleaned)) : undefined;
  }

  private fallback(brief: string, hints?: { industry?: Industry; sourcingMode?: SourcingMode }): ParsedBrief {
    return {
      productName: brief.slice(0, 100).trim() || 'Sourcing campaign',
      industry: hints?.industry || 'other',
      sourcingMode: hints?.sourcingMode || 'product',
      description: brief,
      confidence: 0,
      notes: 'Brief could not be parsed by AI — please review and fill missing fields manually.',
    };
  }
}
