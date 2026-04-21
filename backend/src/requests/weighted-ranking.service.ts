import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RankingWeights {
  price: number;
  leadTime: number;
  moq: number;
  quality: number;
  compliance: number;
}

export interface RankingBreakdown {
  priceScore: number;
  leadTimeScore: number;
  moqScore: number;
  qualityScore: number;
  complianceScore: number;
  finalScore: number;
}

export const DEFAULT_WEIGHTS: RankingWeights = {
  price: 0.25,
  leadTime: 0.2,
  moq: 0.15,
  quality: 0.25,
  compliance: 0.15,
};

interface OfferForScoring {
  id: string;
  price: number | null;
  moq: number | null;
  leadTime: number | null;
  specsConfirmed: boolean;
  incotermsConfirmed: boolean;
  convertedPrice: number | null;
  supplier: { qualityScore?: number | null } | null;
}

@Injectable()
export class WeightedRankingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validates that weights sum to ~1.0 (±0.01 tolerance).
   * Throws BadRequestException on invalid input.
   */
  validateWeights(weights: Partial<RankingWeights>): RankingWeights {
    const merged: RankingWeights = { ...DEFAULT_WEIGHTS, ...weights };
    const sum =
      merged.price +
      merged.leadTime +
      merged.moq +
      merged.quality +
      merged.compliance;
    if (Math.abs(sum - 1) > 0.01) {
      throw new BadRequestException(
        `Ranking weights must sum to 1.0, got ${sum.toFixed(3)}`,
      );
    }
    for (const key of Object.keys(merged) as (keyof RankingWeights)[]) {
      if (merged[key] < 0 || merged[key] > 1) {
        throw new BadRequestException(
          `Weight "${key}" must be between 0 and 1, got ${merged[key]}`,
        );
      }
    }
    return merged;
  }

  /**
   * Returns ranking weights for an RFQ: falls back to defaults if not set.
   */
  async getWeightsForRfq(rfqId: string): Promise<RankingWeights> {
    const rfq = await this.prisma.rfqRequest.findUnique({
      where: { id: rfqId },
      select: { rankingWeights: true },
    });
    const stored = rfq?.rankingWeights as Partial<RankingWeights> | null;
    if (!stored) return DEFAULT_WEIGHTS;
    return { ...DEFAULT_WEIGHTS, ...stored };
  }

  /**
   * Saves ranking weights for an RFQ. Validates first.
   */
  async setWeightsForRfq(
    rfqId: string,
    weights: Partial<RankingWeights>,
  ): Promise<RankingWeights> {
    const validated = this.validateWeights(weights);
    await this.prisma.rfqRequest.update({
      where: { id: rfqId },
      data: { rankingWeights: validated as object },
    });
    return validated;
  }

  /**
   * Computes weighted ranking scores for a set of offers.
   * Scores normalized 0-100 per criterion, weighted sum as final.
   * Does NOT persist — caller decides when to save.
   */
  computeScores(
    offers: OfferForScoring[],
    weights: Partial<RankingWeights> = {},
  ): Map<string, RankingBreakdown> {
    const finalWeights = this.validateWeights(weights);

    const prices = offers
      .map((o) => o.convertedPrice ?? o.price)
      .filter((v): v is number => v != null && v > 0);
    const leadTimes = offers
      .map((o) => o.leadTime)
      .filter((v): v is number => v != null && v > 0);
    const moqs = offers
      .map((o) => o.moq)
      .filter((v): v is number => v != null && v > 0);

    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const minLead = leadTimes.length ? Math.min(...leadTimes) : 0;
    const maxLead = leadTimes.length ? Math.max(...leadTimes) : 0;
    const minMoq = moqs.length ? Math.min(...moqs) : 0;
    const maxMoq = moqs.length ? Math.max(...moqs) : 0;

    const result = new Map<string, RankingBreakdown>();

    for (const offer of offers) {
      const priceScore = this.normalizeLowerIsBetter(
        offer.convertedPrice ?? offer.price,
        minPrice,
        maxPrice,
        0,
      );
      const leadTimeScore = this.normalizeLowerIsBetter(
        offer.leadTime,
        minLead,
        maxLead,
        0,
      );
      const moqScore = this.normalizeLowerIsBetter(
        offer.moq,
        minMoq,
        maxMoq,
        75, // bonus for "no MOQ declared" (flexibility)
      );
      const qualityScore = offer.supplier?.qualityScore ?? 50;
      const complianceScore =
        (offer.specsConfirmed ? 50 : 0) +
        (offer.incotermsConfirmed ? 50 : 0);

      const finalScore = Math.round(
        priceScore * finalWeights.price +
          leadTimeScore * finalWeights.leadTime +
          moqScore * finalWeights.moq +
          qualityScore * finalWeights.quality +
          complianceScore * finalWeights.compliance,
      );

      result.set(offer.id, {
        priceScore: Math.round(priceScore),
        leadTimeScore: Math.round(leadTimeScore),
        moqScore: Math.round(moqScore),
        qualityScore: Math.round(qualityScore),
        complianceScore: Math.round(complianceScore),
        finalScore,
      });
    }

    return result;
  }

  /**
   * Persists computed scores to offers. Run after computeScores.
   */
  async saveScores(
    scoreMap: Map<string, RankingBreakdown>,
  ): Promise<void> {
    await Promise.all(
      Array.from(scoreMap.entries()).map(([offerId, breakdown]) =>
        this.prisma.offer.update({
          where: { id: offerId },
          data: {
            weightedRankingScore: breakdown.finalScore,
            weightedRankingBreakdown: breakdown as object,
          },
        }),
      ),
    );
  }

  /**
   * Linear normalization where lower value = higher score (0-100).
   * For missing values returns `missingFallback`.
   * If all offers have same value, returns 50 (tie).
   */
  private normalizeLowerIsBetter(
    value: number | null,
    min: number,
    max: number,
    missingFallback: number,
  ): number {
    if (value == null || value <= 0) return missingFallback;
    if (min === max) return 50;
    return 100 - ((value - min) / (max - min)) * 100;
  }
}
