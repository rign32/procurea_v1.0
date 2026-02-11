import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../common/services/notification.service';

@Injectable()
export class RequestsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notifications: NotificationService
    ) { }

    async findAll() {
        return this.prisma.rfqRequest.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                deliveryLocation: true,
                owner: true, // Include Owner for correct display
                campaign: {
                    include: {
                        suppliers: true // Include suppliers to count invitations
                    }
                },
                offers: {
                    include: {
                        supplier: true
                    }
                },
            }
        });
    }

    async findOne(id: string) {
        return this.prisma.rfqRequest.findUnique({
            where: { id },
            include: {
                deliveryLocation: true,
                offers: true,
            },
        });
    }

    async create(data: any) {
        // Basic mapping, assuming data matches schema or is close enough
        // We explicitly map fields to avoid issues with extra frontend props
        return this.prisma.rfqRequest.create({
            data: {
                productName: data.productName,
                partNumber: data.partNumber,
                category: data.category,
                material: data.material,
                description: data.description,
                targetPrice: data.targetPrice ? parseFloat(data.targetPrice) : null,
                currency: data.currency || 'EUR',
                quantity: data.quantity ? parseInt(data.quantity.toString()) : 0,
                eau: data.eau ? parseInt(data.eau.toString()) : null,
                unit: data.unit || 'pcs',
                incoterms: Array.isArray(data.incoterms) ? data.incoterms.join(',') : data.incoterms,
                deliveryLocationId: data.deliveryLocationId,
                desiredDeliveryDate: data.leadTime ? new Date(data.leadTime) : null,
                status: 'DRAFT',
            },
        });
    }

    async update(id: string, data: any) {
        return this.prisma.rfqRequest.update({
            where: { id },
            data: {
                // Add update fields as needed
                status: data.status,
            }
        });
    }

    async acceptOffer(offerId: string) {
        // Find the offer to get the requestId
        const offer = await this.prisma.offer.findUnique({
            where: { id: offerId }
        });

        if (!offer) {
            throw new Error('Offer not found');
        }

        const requestId = offer.rfqRequestId;

        // Transaction: Accept this offer, reject others, complete request
        return this.prisma.$transaction([
            // 1. Accept the chosen offer
            this.prisma.offer.update({
                where: { id: offerId },
                data: { status: 'ACCEPTED' }
            }),
            // 2. Reject all other offers for this request
            this.prisma.offer.updateMany({
                where: {
                    rfqRequestId: requestId,
                    id: { not: offerId }
                },
                data: { status: 'REJECTED' }
            }),
            // 3. Mark RFQ as Completed
            this.prisma.rfqRequest.update({
                where: { id: requestId },
                data: { status: 'COMPLETED' }
            })
        ]);
    }


    async createOffer(data: any) {
        // 1. Validate RFQ exists
        const rfq = await this.prisma.rfqRequest.findUnique({
            where: { id: data.requestId },
            include: { owner: true }
        });

        if (!rfq) throw new NotFoundException('RFQ not found');

        // 2. Validate Supplier & Campaign Consistency
        const supplier = await this.prisma.supplier.findUnique({
            where: { id: data.supplierId }
        });

        if (!supplier) throw new NotFoundException('Supplier not found');

        // Prevent cross-campaign bidding
        if (rfq.campaignId && supplier.campaignId) {
            if (rfq.campaignId !== supplier.campaignId) {
                throw new Error('Security Violation: Supplier cannot bid on RFQ from different campaign');
            }
        }

        // 3. Create Offer
        const offer = await this.prisma.offer.create({
            data: {
                rfqRequestId: data.requestId,
                supplierId: data.supplierId,
                price: parseFloat(data.pricePerUnit) || 0,
                currency: data.currency,
                moq: parseInt(data.moq) || 0,
                leadTime: parseInt(data.leadTimeWeeks) || 0,
                status: 'SUBMITTED',
                // incoterms: data.incoterms, // Removed as it might not be in schema
                validityDate: data.validityDate ? new Date(data.validityDate) : null,
                comments: data.comment,
                submittedAt: new Date(),
            },
            include: { supplier: true }
        });

        // 3. Notify RFQ Owner
        if (rfq.ownerId) {
            const supplierName = (offer as any).supplier?.name || 'Dostawca';
            await this.notifications.send(rfq.ownerId, 'OFFER_RECEIVED', {
                subject: 'Nowa oferta od dostawcy',
                message: `Dostawca ${supplierName} złożył ofertę na ${rfq.productName}. Cena: ${offer.price} ${offer.currency}.`,
                data: { offerId: offer.id, rfqId: rfq.id }
            });
        }

        return offer;
    }
}

