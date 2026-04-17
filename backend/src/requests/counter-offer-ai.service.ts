import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../common/services/gemini.service';

export interface CounterSuggestion {
    suggestedTerms: {
        price?: number;
        leadTime?: number;
        moq?: number;
        comments?: string;
    };
    reasoning: string;
    savingsEstimate?: {
        percentage: number;
        absoluteAmount: number;
        currency: string;
    };
}

export interface ReplyContext {
    extractedTerms?: {
        price?: number;
        leadTime?: number;
        moq?: number;
        currency?: string;
    };
    summary?: string;
}

@Injectable()
export class CounterOfferAiService {
    private readonly logger = new Logger(CounterOfferAiService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly gemini: GeminiService,
    ) {}

    async suggestCounter(
        offerId: string,
        replyContext?: ReplyContext,
    ): Promise<CounterSuggestion> {
        // 1. Load offer + RFQ context
        const offer = await this.prisma.offer.findUnique({
            where: { id: offerId },
            include: {
                rfqRequest: { include: { owner: true } },
                supplier: true,
                priceTiers: true,
            },
        });
        if (!offer) throw new NotFoundException('Offer not found');

        // 2. Build prompt with full negotiation context
        const prompt = this.buildNegotiationPrompt(offer, replyContext);
        const aiResponse = await this.gemini.generateContent(
            prompt,
            undefined,
            'counter-offer-suggestion',
        );

        // 3. Parse and return
        return this.parseCounterSuggestion(aiResponse, offer);
    }

    private buildNegotiationPrompt(offer: any, replyContext?: ReplyContext): string {
        const rfq = offer.rfqRequest;
        const history = (offer.negotiationHistory as any[]) || [];
        const lang = rfq?.owner?.language || 'pl';

        return `You are a B2B procurement negotiation expert. Analyze the supplier's latest response and suggest optimal counter-offer terms.

RFQ Requirements:
- Product: ${rfq?.productName || 'Unknown'}
- Target price: ${rfq?.targetPrice || 'Not specified'} ${rfq?.currency || 'EUR'}
- Quantity: ${rfq?.quantity || 'Unknown'} ${rfq?.unit || 'units'}
- Desired delivery: ${rfq?.desiredDeliveryDate || 'Flexible'}
- Incoterms: ${rfq?.incoterms || 'Not specified'}

Current Offer from ${offer.supplier?.name || 'Supplier'}:
- Price: ${offer.price || 'Not quoted'} ${offer.currency || ''}
- Lead time: ${offer.leadTime ? offer.leadTime + ' weeks' : 'Not specified'}
- MOQ: ${offer.moq || 'Not specified'}
${offer.priceTiers?.length ? `- Price tiers: ${JSON.stringify(offer.priceTiers.map((t: any) => ({ min: t.minQty, max: t.maxQty, price: t.unitPrice })))}` : ''}

${replyContext?.summary ? `Latest supplier response: ${replyContext.summary}` : ''}
${replyContext?.extractedTerms ? `Extracted terms from reply: ${JSON.stringify(replyContext.extractedTerms)}` : ''}

Negotiation history (${history.length} interactions):
${history.slice(-5).map((h: any) => `- ${h.action}: ${h.summary || JSON.stringify(h.terms || {})}`).join('\n')}

Based on this context, suggest counter-offer terms that:
1. Push for 5-15% price reduction if price seems high vs target
2. Negotiate lead time reduction if delivery is tight
3. Consider MOQ adjustments if quantity is flexible
4. Be realistic - don't suggest impossibly low prices

Respond in JSON ONLY:
{
  "suggestedTerms": {
    "price": number or null,
    "leadTime": number or null,
    "moq": number or null,
    "comments": "short message to supplier explaining the counter (${lang === 'pl' ? 'Polish' : 'English'})"
  },
  "reasoning": "1-2 sentences explaining WHY these terms (${lang === 'pl' ? 'Polish' : 'English'})",
  "savingsEstimate": {
    "percentage": number,
    "absoluteAmount": number,
    "currency": "${offer.currency || rfq?.currency || 'EUR'}"
  }
}`;
    }

    private parseCounterSuggestion(raw: string, offer: any): CounterSuggestion {
        const defaultResult: CounterSuggestion = {
            suggestedTerms: {},
            reasoning: 'Could not generate suggestion',
        };

        try {
            // Strip markdown fences if present
            let cleaned = raw.trim();
            if (cleaned.startsWith('```')) {
                cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
            }

            const parsed = JSON.parse(cleaned);

            const result: CounterSuggestion = {
                suggestedTerms: {
                    price: typeof parsed.suggestedTerms?.price === 'number' ? parsed.suggestedTerms.price : undefined,
                    leadTime: typeof parsed.suggestedTerms?.leadTime === 'number' ? parsed.suggestedTerms.leadTime : undefined,
                    moq: typeof parsed.suggestedTerms?.moq === 'number' ? parsed.suggestedTerms.moq : undefined,
                    comments: typeof parsed.suggestedTerms?.comments === 'string' ? parsed.suggestedTerms.comments : undefined,
                },
                reasoning: parsed.reasoning || 'No reasoning provided',
            };

            if (parsed.savingsEstimate?.percentage != null) {
                result.savingsEstimate = {
                    percentage: Number(parsed.savingsEstimate.percentage) || 0,
                    absoluteAmount: Number(parsed.savingsEstimate.absoluteAmount) || 0,
                    currency: parsed.savingsEstimate.currency || offer.currency || 'EUR',
                };
            }

            return result;
        } catch (err: any) {
            this.logger.warn(`Failed to parse counter suggestion JSON: ${err?.message}`);
            return defaultResult;
        }
    }
}
