import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PO_STATUS_TRANSITIONS: Record<string, string[]> = {
    DRAFT: ['SUBMITTED', 'CANCELLED'],
    SUBMITTED: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['DELIVERED', 'CANCELLED'],
    DELIVERED: ['INVOICED'],
    INVOICED: [],
    CANCELLED: [],
};

@Injectable()
export class PurchaseOrdersService {
    private readonly logger = new Logger(PurchaseOrdersService.name);

    constructor(private readonly prisma: PrismaService) {}

    /**
     * Auto-generate a PO from a signed/active contract.
     */
    async generateFromContract(userId: string, contractId: string) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: {
                offer: {
                    include: {
                        priceTiers: true,
                        rfqRequest: true,
                        supplier: true,
                    },
                },
            },
        });
        if (!contract) throw new NotFoundException('Contract not found');
        if (contract.status !== 'SIGNED' && contract.status !== 'ACTIVE') {
            throw new BadRequestException('PO can only be generated from SIGNED or ACTIVE contracts');
        }

        const offer = contract.offer;
        if (!offer) throw new BadRequestException('Contract has no associated offer');

        const rfq = offer.rfqRequest;
        if (!rfq) throw new BadRequestException('Offer has no associated RFQ request');

        const poNumber = await this.generatePoNumber(contract.organizationId);

        // Build line items from offer price tiers (or single line if no tiers)
        const lines = offer.priceTiers?.length > 0
            ? offer.priceTiers.map((tier, i) => ({
                description: `${rfq.productName} (${tier.minQty}${tier.maxQty ? '-' + tier.maxQty : '+'} ${rfq.unit || 'units'})`,
                quantity: tier.minQty,
                unit: rfq.unit || 'pcs',
                unitPrice: tier.pricePerUnit,
                totalPrice: tier.minQty * tier.pricePerUnit,
                sortOrder: i,
            }))
            : [{
                description: rfq.productName || 'Product',
                quantity: rfq.quantity || 1,
                unit: rfq.unit || 'pcs',
                unitPrice: offer.price || 0,
                totalPrice: (rfq.quantity || 1) * (offer.price || 0),
                sortOrder: 0,
            }];

        return this.prisma.purchaseOrder.create({
            data: {
                poNumber,
                contractId: contract.id,
                offerId: offer.id,
                organizationId: contract.organizationId,
                status: 'DRAFT',
                totalAmount: lines.reduce((sum, l) => sum + l.totalPrice, 0),
                currency: offer.currency || rfq.currency || 'EUR',
                deliveryDate: rfq.desiredDeliveryDate,
                createdById: userId,
                lines: { create: lines },
            },
            include: {
                lines: true,
                contract: true,
                offer: { include: { supplier: true } },
            },
        });
    }

    /**
     * List all POs for the user's organization (or created by user).
     */
    async findAll(userId: string, status?: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });

        const where: Record<string, unknown> = {};
        if (user?.organizationId) {
            where.organizationId = user.organizationId;
        } else {
            where.createdById = userId;
        }
        if (status) where.status = status;

        return this.prisma.purchaseOrder.findMany({
            where,
            include: {
                offer: {
                    select: {
                        id: true,
                        supplier: { select: { id: true, name: true, country: true } },
                        rfqRequest: { select: { id: true, productName: true } },
                    },
                },
                contract: { select: { id: true, title: true } },
                lines: { orderBy: { sortOrder: 'asc' } },
                createdBy: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get a single PO by ID with ownership check.
     */
    async findOne(id: string, userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });

        const po = await this.prisma.purchaseOrder.findFirst({
            where: {
                id,
                OR: [
                    { createdById: userId },
                    ...(user?.organizationId ? [{ organizationId: user.organizationId }] : []),
                ],
            },
            include: {
                offer: {
                    include: {
                        supplier: true,
                        rfqRequest: true,
                        priceTiers: true,
                    },
                },
                contract: true,
                lines: { orderBy: { sortOrder: 'asc' } },
                createdBy: { select: { id: true, name: true, email: true } },
            },
        });
        if (!po) throw new NotFoundException('Purchase order not found');
        return po;
    }

    /**
     * Update PO status with transition validation.
     */
    async updateStatus(id: string, userId: string, newStatus: string) {
        const po = await this.findOne(id, userId); // reuse ownership check

        const allowed = PO_STATUS_TRANSITIONS[po.status];
        if (!allowed?.includes(newStatus)) {
            throw new BadRequestException(`Cannot transition from ${po.status} to ${newStatus}`);
        }

        return this.prisma.purchaseOrder.update({
            where: { id },
            data: { status: newStatus },
            include: {
                lines: { orderBy: { sortOrder: 'asc' } },
                offer: { include: { supplier: true } },
                contract: { select: { id: true, title: true } },
            },
        });
    }

    /**
     * Generate sequential PO number: PO-YYYY-001, PO-YYYY-002, ...
     */
    private async generatePoNumber(organizationId: string): Promise<string> {
        const year = new Date().getFullYear();
        const count = await this.prisma.purchaseOrder.count({
            where: { organizationId },
        });
        return `PO-${year}-${String(count + 1).padStart(3, '0')}`;
    }
}
