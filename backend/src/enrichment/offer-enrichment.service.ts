import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../common/services/gemini.service';

@Injectable()
export class OfferEnrichmentService {
  private readonly logger = new Logger(OfferEnrichmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
  ) {}

  async enrichOffer(offerId: string): Promise<{
    enriched: boolean;
    fieldsUpdated: string[];
    extractedTerms: Record<string, any>;
  }> {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { rfqRequest: true },
    });

    if (!offer) {
      throw new NotFoundException(`Offer ${offerId} not found`);
    }

    if (!offer.comments) {
      return { enriched: false, fieldsUpdated: [], extractedTerms: {} };
    }

    // Only enrich fields that are currently empty/null/default
    const missingFields: string[] = [];
    if (offer.leadTime == null) missingFields.push('leadTime');
    if (offer.moq == null) missingFields.push('moq');
    if (!offer.specsConfirmed) missingFields.push('specsConfirmed');
    if (!offer.incotermsConfirmed) missingFields.push('incotermsConfirmed');
    if (offer.price == null) missingFields.push('price');
    if (!offer.currency) missingFields.push('currency');

    if (missingFields.length === 0) {
      return { enriched: false, fieldsUpdated: [], extractedTerms: {} };
    }

    this.logger.log(`Enriching offer ${offerId} — missing fields: ${missingFields.join(', ')}`);

    const prompt = this.buildExtractionPrompt(offer.comments, missingFields, offer.rfqRequest);
    const raw = await this.gemini.generateContent(prompt, undefined, 'offer-enrichment');
    const extracted = this.parseExtraction(raw);

    // Build update payload (only non-null extracted values for fields that were missing)
    const updateData: Record<string, any> = {};
    const fieldsUpdated: string[] = [];

    if (extracted.leadTime != null && offer.leadTime == null) {
      updateData.leadTime = extracted.leadTime;
      fieldsUpdated.push('leadTime');
    }
    if (extracted.moq != null && offer.moq == null) {
      updateData.moq = extracted.moq;
      fieldsUpdated.push('moq');
    }
    if (extracted.price != null && offer.price == null) {
      updateData.price = extracted.price;
      fieldsUpdated.push('price');
    }
    if (extracted.currency && !offer.currency) {
      updateData.currency = extracted.currency;
      fieldsUpdated.push('currency');
    }
    if (extracted.specsConfirmed === true && !offer.specsConfirmed) {
      updateData.specsConfirmed = true;
      fieldsUpdated.push('specsConfirmed');
    }
    if (extracted.incotermsConfirmed === true && !offer.incotermsConfirmed) {
      updateData.incotermsConfirmed = true;
      fieldsUpdated.push('incotermsConfirmed');
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.offer.update({ where: { id: offerId }, data: updateData });
      this.logger.log(`Offer ${offerId} enriched — updated: ${fieldsUpdated.join(', ')}`);
    }

    return { enriched: fieldsUpdated.length > 0, fieldsUpdated, extractedTerms: extracted };
  }

  /**
   * Batch enrich all eligible offers in an RFQ.
   */
  async enrichOffersForRfq(rfqRequestId: string): Promise<{ enrichedCount: number }> {
    const offers = await this.prisma.offer.findMany({
      where: {
        rfqRequestId,
        status: { in: ['SUBMITTED', 'SHORTLISTED'] },
        comments: { not: null },
      },
      select: { id: true },
    });

    let enrichedCount = 0;
    for (const o of offers) {
      try {
        const result = await this.enrichOffer(o.id);
        if (result.enriched) enrichedCount++;
      } catch (err) {
        this.logger.warn(`Failed to enrich offer ${o.id}: ${(err as Error).message}`);
      }
    }

    this.logger.log(`RFQ ${rfqRequestId}: enriched ${enrichedCount}/${offers.length} offers`);
    return { enrichedCount };
  }

  /** @internal — exposed for testing */
  buildExtractionPrompt(comments: string, missingFields: string[], rfq: any): string {
    return `Extract procurement terms from a supplier's free-text offer comments.

RFQ context:
- Product: ${rfq?.productName || 'Unknown'}
- Quantity requested: ${rfq?.quantity || 'N/A'}

Supplier's comments:
"${comments}"

Extract ONLY these fields (return null if not found): ${missingFields.join(', ')}

Field definitions:
- leadTime: delivery time in DAYS (integer). Convert weeks to days (1 week = 7 days), months to days (1 month = 30 days). If range given (e.g. "3-4 weeks"), use the AVERAGE.
- moq: minimum order quantity (integer)
- price: unit price (float, the MAIN price if multiple quoted)
- currency: ISO 4217 code (EUR, PLN, USD, GBP, CZK, etc.)
- specsConfirmed: true if supplier explicitly confirms they can meet specifications/requirements
- incotermsConfirmed: true if supplier explicitly mentions or confirms Incoterms (EXW, FOB, CIF, etc.)

JSON response ONLY (no markdown, no explanation):
{
  "leadTime": number | null,
  "moq": number | null,
  "price": number | null,
  "currency": "EUR" | "PLN" | ... | null,
  "specsConfirmed": boolean | null,
  "incotermsConfirmed": boolean | null
}`;
  }

  /** @internal — exposed for testing */
  parseExtraction(raw: string): Record<string, any> {
    try {
      const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return {};
      return JSON.parse(jsonMatch[0]);
    } catch {
      this.logger.warn('Failed to parse Gemini extraction response');
      return {};
    }
  }
}
