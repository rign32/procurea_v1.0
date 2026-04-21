import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { LineItemDto } from './dto/line-item.dto';

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
}
