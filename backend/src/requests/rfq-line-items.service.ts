import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { LineItemDto, OfferLineItemDto } from './dto/line-item.dto';

@Injectable()
export class RfqLineItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(rfqRequestId: string) {
    const rfq = await this.prisma.rfqRequest.findUnique({
      where: { id: rfqRequestId },
      select: { id: true },
    });
    if (!rfq) throw new NotFoundException('RFQ not found');

    return this.prisma.rfqLineItem.findMany({
      where: { rfqRequestId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Replace all line items on an RFQ atomically.
   * Simpler UX than per-item CRUD for BOQ uploads — user edits a table
   * and the frontend sends the full list back on save.
   */
  async replaceAll(rfqRequestId: string, items: LineItemDto[]) {
    const rfq = await this.prisma.rfqRequest.findUnique({
      where: { id: rfqRequestId },
      select: { id: true },
    });
    if (!rfq) throw new NotFoundException('RFQ not found');

    return this.prisma.$transaction(async (tx) => {
      await tx.rfqLineItem.deleteMany({ where: { rfqRequestId } });
      if (items.length === 0) return [];

      await tx.rfqLineItem.createMany({
        data: items.map((item, idx) => ({
          rfqRequestId,
          sortOrder: item.sortOrder ?? idx,
          sku: item.sku ?? null,
          name: item.name,
          description: item.description ?? null,
          material: item.material ?? null,
          quantity: item.quantity,
          unit: item.unit ?? 'pcs',
          targetPrice: item.targetPrice ?? null,
          requiredCerts: (item.requiredCerts as object) ?? undefined,
        })),
      });

      return tx.rfqLineItem.findMany({
        where: { rfqRequestId },
        orderBy: { sortOrder: 'asc' },
      });
    });
  }

  async addOne(rfqRequestId: string, dto: LineItemDto) {
    const rfq = await this.prisma.rfqRequest.findUnique({
      where: { id: rfqRequestId },
      select: { id: true },
    });
    if (!rfq) throw new NotFoundException('RFQ not found');

    const max = await this.prisma.rfqLineItem.aggregate({
      where: { rfqRequestId },
      _max: { sortOrder: true },
    });
    const nextOrder = (max._max.sortOrder ?? -1) + 1;

    return this.prisma.rfqLineItem.create({
      data: {
        rfqRequestId,
        sortOrder: dto.sortOrder ?? nextOrder,
        sku: dto.sku ?? null,
        name: dto.name,
        description: dto.description ?? null,
        material: dto.material ?? null,
        quantity: dto.quantity,
        unit: dto.unit ?? 'pcs',
        targetPrice: dto.targetPrice ?? null,
        requiredCerts: (dto.requiredCerts as object) ?? undefined,
      },
    });
  }

  async remove(lineItemId: string): Promise<void> {
    const item = await this.prisma.rfqLineItem.findUnique({
      where: { id: lineItemId },
    });
    if (!item) throw new NotFoundException('Line item not found');
    await this.prisma.rfqLineItem.delete({ where: { id: lineItemId } });
  }

  // --- Faza 2B: Per-line offer quotes ---

  /**
   * Read the supplier's per-line quotes for a given offer, including
   * the RFQ line definitions so the portal can render a grid.
   */
  async listOfferLines(offerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      select: { id: true, rfqRequestId: true },
    });
    if (!offer) throw new NotFoundException('Offer not found');

    // Return all RFQ line items with supplier's quote (if any) — left-join style
    const rfqLines = await this.prisma.rfqLineItem.findMany({
      where: { rfqRequestId: offer.rfqRequestId },
      orderBy: { sortOrder: 'asc' },
    });
    const offerLines = await this.prisma.offerLineItem.findMany({
      where: { offerId },
    });
    const byRfqLineId = new Map(offerLines.map((ol) => [ol.rfqLineItemId, ol]));
    return rfqLines.map((rfqLine) => ({
      rfqLine,
      offerLine: byRfqLineId.get(rfqLine.id) ?? null,
    }));
  }

  /**
   * Atomic bulk-replace for per-line quotes. Deletes existing offer line
   * items for this offer and creates the provided set. Each item must
   * reference a valid RfqLineItem belonging to this offer's RFQ.
   */
  async saveOfferLines(offerId: string, items: OfferLineItemDto[]) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      select: { id: true, rfqRequestId: true },
    });
    if (!offer) throw new NotFoundException('Offer not found');

    if (items.length > 0) {
      const rfqLineIds = items.map((i) => i.rfqLineItemId);
      const validLines = await this.prisma.rfqLineItem.findMany({
        where: { id: { in: rfqLineIds }, rfqRequestId: offer.rfqRequestId },
        select: { id: true },
      });
      const validIds = new Set(validLines.map((l) => l.id));
      const invalid = rfqLineIds.filter((id) => !validIds.has(id));
      if (invalid.length > 0) {
        throw new BadRequestException(
          `Line IDs don't belong to this offer's RFQ: ${invalid.join(', ')}`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.offerLineItem.deleteMany({ where: { offerId } });
      if (items.length === 0) return [];

      await tx.offerLineItem.createMany({
        data: items.map((i) => ({
          offerId,
          rfqLineItemId: i.rfqLineItemId,
          unitPrice: i.unitPrice ?? null,
          currency: i.currency ?? 'EUR',
          moq: i.moq ?? null,
          leadTime: i.leadTime ?? null,
          altDescription: i.altDescription ?? null,
          altMaterial: i.altMaterial ?? null,
          notes: i.notes ?? null,
        })),
      });

      return tx.offerLineItem.findMany({ where: { offerId } });
    });
  }
}
