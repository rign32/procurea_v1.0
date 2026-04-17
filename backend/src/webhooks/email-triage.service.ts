import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from '../common/services/gemini.service';
import { parseAiJson } from '../common/utils/parse-ai-json';

export type TriageCategory = 'FORWARD' | 'STORE_ONLY' | 'BLOCK';
export type TriageSentiment =
    | 'positive'
    | 'neutral'
    | 'negative'
    | 'auto-reply';

export interface ExtractedTerms {
    price?: number;
    currency?: string;
    leadTime?: number; // days
    moq?: number;
}

export interface TriageResult {
    category: TriageCategory;
    confidence: number;
    reason: string;
    summary: string;
    extractedTerms?: ExtractedTerms;
    sentiment: TriageSentiment;
}

export interface TriageInput {
    from: string;
    subject: string;
    textBody: string;
    htmlBody?: string;
    supplierName: string;
    rfqProductName: string;
    userLanguage: 'pl' | 'en' | 'de';
}

/**
 * Classifies an inbound supplier email into FORWARD / STORE_ONLY / BLOCK
 * categories using Gemini, plus extracts commercial terms when present.
 *
 * The goal is to keep the user's inbox clean: genuine business replies are
 * forwarded; auto-replies and noise are logged silently; spam is dropped.
 */
@Injectable()
export class EmailTriageService {
    private readonly logger = new Logger(EmailTriageService.name);
    private readonly MAX_BODY_LEN = 6000; // keep prompt under Gemini context comfortably

    constructor(private readonly geminiService: GeminiService) {}

    async classify(input: TriageInput): Promise<TriageResult> {
        const prompt = this.buildPrompt(input);
        let raw: string;
        try {
            raw = await this.geminiService.generateContent(
                prompt,
                undefined,
                'email-triage',
            );
        } catch (err: any) {
            this.logger.error(
                `Gemini triage call failed: ${err?.message || err}`,
            );
            // Safe default: store without forwarding so we don't spam the
            // user on transient AI failures. Human can review later.
            return {
                category: 'STORE_ONLY',
                confidence: 0,
                reason: 'ai_error',
                summary: 'Could not classify — stored for review.',
                sentiment: 'neutral',
            };
        }
        return this.parseTriageResponse(raw);
    }

    private buildPrompt(input: TriageInput): string {
        const isPl = input.userLanguage === 'pl';
        const langName = isPl
            ? 'Polish'
            : input.userLanguage === 'de'
              ? 'German'
              : 'English';
        const textBody = (input.textBody || '').slice(0, this.MAX_BODY_LEN);
        return `You are classifying an incoming email reply from a supplier in a B2B procurement context.

RFQ context:
- Product: ${input.rfqProductName}
- Supplier: ${input.supplierName}

Incoming email:
From: ${input.from}
Subject: ${input.subject}

${textBody}

Classify this email into ONE of three categories:
- FORWARD: substantive reply — quote with price, clarification question about RFQ, counter-offer, meeting request, any real human engagement with the procurement conversation. User wants to see this.
- STORE_ONLY: auto-reply or non-actionable — out of office, sick leave, maternity/parental leave, delivery receipts, read receipts, "contact someone else" redirects, generic form responses. Log it but don't spam user's inbox.
- BLOCK: spam, unsolicited marketing, unsubscribe requests, phishing attempts, malicious content, bounce notifications. Drop.

If category is FORWARD and the email contains pricing/quote data, extract it.

Respond with JSON ONLY (no markdown, no explanation):
{
  "category": "FORWARD" | "STORE_ONLY" | "BLOCK",
  "confidence": 0.0 to 1.0,
  "reason": "brief explanation why (1 sentence, ${langName})",
  "summary": "1-2 sentence summary of email content (${langName})",
  "sentiment": "positive" | "neutral" | "negative" | "auto-reply",
  "extractedTerms": { "price": number?, "currency": "EUR"|"PLN"|..., "leadTime": number of days?, "moq": number? }
}
If no terms extractable, omit extractedTerms entirely.`;
    }

    /**
     * Parse Gemini's raw response into a validated TriageResult.
     * Handles markdown fences, extra commentary, missing fields.
     * Falls back to STORE_ONLY on any unrecoverable malformation so we
     * never drop a legitimate email due to an AI quirk.
     */
    parseTriageResponse(raw: string): TriageResult {
        let parsed: any;
        try {
            parsed = parseAiJson(raw);
        } catch (e: any) {
            this.logger.warn(
                `Failed to parse triage JSON: ${e?.message}. Raw[:200]="${(raw || '').slice(0, 200)}"`,
            );
            return {
                category: 'STORE_ONLY',
                confidence: 0,
                reason: 'parse_error',
                summary: 'Could not parse AI response — stored for review.',
                sentiment: 'neutral',
            };
        }

        const validCategories: TriageCategory[] = [
            'FORWARD',
            'STORE_ONLY',
            'BLOCK',
        ];
        const category: TriageCategory = validCategories.includes(
            parsed?.category,
        )
            ? parsed.category
            : 'STORE_ONLY';

        const validSentiments: TriageSentiment[] = [
            'positive',
            'neutral',
            'negative',
            'auto-reply',
        ];
        const sentiment: TriageSentiment = validSentiments.includes(
            parsed?.sentiment,
        )
            ? parsed.sentiment
            : 'neutral';

        let confidence = Number(parsed?.confidence);
        if (!Number.isFinite(confidence)) confidence = 0;
        confidence = Math.max(0, Math.min(1, confidence));

        const result: TriageResult = {
            category,
            confidence,
            reason:
                typeof parsed?.reason === 'string' ? parsed.reason : '',
            summary:
                typeof parsed?.summary === 'string' ? parsed.summary : '',
            sentiment,
        };

        if (parsed?.extractedTerms && typeof parsed.extractedTerms === 'object') {
            const et = parsed.extractedTerms;
            const sanitized: ExtractedTerms = {};
            if (typeof et.price === 'number' && Number.isFinite(et.price))
                sanitized.price = et.price;
            if (typeof et.currency === 'string' && et.currency.length <= 6)
                sanitized.currency = et.currency.toUpperCase();
            if (
                typeof et.leadTime === 'number' &&
                Number.isFinite(et.leadTime)
            )
                sanitized.leadTime = et.leadTime;
            if (typeof et.moq === 'number' && Number.isFinite(et.moq))
                sanitized.moq = et.moq;
            if (Object.keys(sanitized).length > 0)
                result.extractedTerms = sanitized;
        }

        return result;
    }
}
