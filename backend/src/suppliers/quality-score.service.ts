import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface OfferData {
  id: string;
  status: string;
  price: number | null;
  leadTime: number | null;
  moq: number | null;
  specsConfirmed: boolean;
  incotermsConfirmed: boolean;
  viewedAt: Date | null;
  submittedAt: Date | null;
  createdAt: Date;
}

interface SupplierData {
  id: string;
  deletedAt: Date | null;
  offers: OfferData[];
  registry: { isBlacklisted: boolean } | null;
}

const WEIGHTS = {
  RESPONSE_RATE: 30,
  RESPONSE_SPEED: 20,
  COMPLETENESS: 20,
  WIN_RATE: 15,
  BLACKLIST: 15,
} as const;

@Injectable()
export class QualityScoreService {
  constructor(private readonly prisma: PrismaService) {}

  async computeScore(supplierId: string): Promise<number> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        offers: {
          select: {
            id: true,
            status: true,
            price: true,
            leadTime: true,
            moq: true,
            specsConfirmed: true,
            incotermsConfirmed: true,
            viewedAt: true,
            submittedAt: true,
            createdAt: true,
          },
        },
        registry: {
          select: { isBlacklisted: true },
        },
      },
    });

    if (!supplier) return 0;

    const responseRate = this.calcResponseRate(supplier.offers);
    const responseSpeed = this.calcResponseSpeed(supplier.offers);
    const completeness = this.calcCompleteness(supplier.offers);
    const winRate = this.calcWinRate(supplier.offers);
    const blacklistPenalty = this.calcBlacklistPenalty(supplier);

    const score = Math.round(
      responseRate + responseSpeed + completeness + winRate + blacklistPenalty,
    );
    return Math.max(0, Math.min(100, score));
  }

  async computeAndSave(supplierId: string): Promise<number> {
    const score = await this.computeScore(supplierId);
    await this.prisma.supplier.update({
      where: { id: supplierId },
      data: { qualityScore: score },
    });
    return score;
  }

  async recomputeForCampaign(campaignId: string): Promise<void> {
    const suppliers = await this.prisma.supplier.findMany({
      where: { campaignId, deletedAt: null },
      select: { id: true },
    });
    for (const s of suppliers) {
      await this.computeAndSave(s.id);
    }
  }

  async onOfferStatusChange(offerId: string): Promise<void> {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      select: { supplierId: true },
    });
    if (offer) {
      await this.computeAndSave(offer.supplierId);
    }
  }

  /**
   * Response Rate (max 30 pts): % of offers where status != 'PENDING'.
   * 0 offers = 50% of max (neutral = 15).
   */
  calcResponseRate(offers: OfferData[]): number {
    if (offers.length === 0) return WEIGHTS.RESPONSE_RATE * 0.5;

    const responded = offers.filter((o) => o.status !== 'PENDING').length;
    return (responded / offers.length) * WEIGHTS.RESPONSE_RATE;
  }

  /**
   * Response Speed (max 20 pts): avg time from createdAt to viewedAt or submittedAt.
   * <24h = 100%, <72h = 75%, <7d = 50%, >7d = 25%.
   * 0 offers or no response timestamps = 50% of max (neutral).
   */
  calcResponseSpeed(offers: OfferData[]): number {
    if (offers.length === 0) return WEIGHTS.RESPONSE_SPEED * 0.5;

    const responseTimes: number[] = [];
    for (const o of offers) {
      const responseDate = o.submittedAt || o.viewedAt;
      if (responseDate) {
        const diffMs =
          new Date(responseDate).getTime() - new Date(o.createdAt).getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        responseTimes.push(diffHours);
      }
    }

    if (responseTimes.length === 0) return WEIGHTS.RESPONSE_SPEED * 0.5;

    const avgHours =
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    let pct: number;
    if (avgHours < 24) pct = 1.0;
    else if (avgHours < 72) pct = 0.75;
    else if (avgHours < 168) pct = 0.5;
    else pct = 0.25;

    return pct * WEIGHTS.RESPONSE_SPEED;
  }

  /**
   * Offer Completeness (max 20 pts): avg % of key fields filled per offer.
   * Fields: price, leadTime, moq, specsConfirmed, incotermsConfirmed (each = 4 pts).
   * 0 offers = 0 pts (no data to assess).
   */
  calcCompleteness(offers: OfferData[]): number {
    if (offers.length === 0) return 0;

    const perOfferScores = offers.map((o) => {
      let filled = 0;
      if (o.price != null) filled++;
      if (o.leadTime != null) filled++;
      if (o.moq != null) filled++;
      if (o.specsConfirmed) filled++;
      if (o.incotermsConfirmed) filled++;
      return filled / 5;
    });

    const avg =
      perOfferScores.reduce((a, b) => a + b, 0) / perOfferScores.length;
    return avg * WEIGHTS.COMPLETENESS;
  }

  /**
   * Win Rate (max 15 pts): % of offers with status ACCEPTED or SHORTLISTED.
   * 0 offers = 50% of max (neutral = 7.5).
   */
  calcWinRate(offers: OfferData[]): number {
    if (offers.length === 0) return WEIGHTS.WIN_RATE * 0.5;

    const wins = offers.filter(
      (o) => o.status === 'ACCEPTED' || o.status === 'SHORTLISTED',
    ).length;
    return (wins / offers.length) * WEIGHTS.WIN_RATE;
  }

  /**
   * No Blacklist Penalty (max 15 pts): full 15 if not blacklisted, 0 if blacklisted.
   * Blacklisted = supplier.deletedAt is set OR registry.isBlacklisted is true.
   */
  calcBlacklistPenalty(
    supplier: Pick<SupplierData, 'deletedAt' | 'registry'>,
  ): number {
    const isBlacklisted =
      supplier.deletedAt != null ||
      (supplier.registry?.isBlacklisted === true);

    return isBlacklisted ? 0 : WEIGHTS.BLACKLIST;
  }
}
