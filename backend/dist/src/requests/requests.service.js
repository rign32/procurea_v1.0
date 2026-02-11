"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notification_service_1 = require("../common/services/notification.service");
let RequestsService = class RequestsService {
    prisma;
    notifications;
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async findAll() {
        return this.prisma.rfqRequest.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                deliveryLocation: true,
                owner: true,
                campaign: {
                    include: {
                        suppliers: true
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
    async findOne(id) {
        return this.prisma.rfqRequest.findUnique({
            where: { id },
            include: {
                deliveryLocation: true,
                offers: true,
            },
        });
    }
    async create(data) {
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
    async update(id, data) {
        return this.prisma.rfqRequest.update({
            where: { id },
            data: {
                status: data.status,
            }
        });
    }
    async acceptOffer(offerId) {
        const offer = await this.prisma.offer.findUnique({
            where: { id: offerId }
        });
        if (!offer) {
            throw new Error('Offer not found');
        }
        const requestId = offer.rfqRequestId;
        return this.prisma.$transaction([
            this.prisma.offer.update({
                where: { id: offerId },
                data: { status: 'ACCEPTED' }
            }),
            this.prisma.offer.updateMany({
                where: {
                    rfqRequestId: requestId,
                    id: { not: offerId }
                },
                data: { status: 'REJECTED' }
            }),
            this.prisma.rfqRequest.update({
                where: { id: requestId },
                data: { status: 'COMPLETED' }
            })
        ]);
    }
    async createOffer(data) {
        const rfq = await this.prisma.rfqRequest.findUnique({
            where: { id: data.requestId },
            include: { owner: true }
        });
        if (!rfq)
            throw new common_1.NotFoundException('RFQ not found');
        const supplier = await this.prisma.supplier.findUnique({
            where: { id: data.supplierId }
        });
        if (!supplier)
            throw new common_1.NotFoundException('Supplier not found');
        if (rfq.campaignId && supplier.campaignId) {
            if (rfq.campaignId !== supplier.campaignId) {
                throw new Error('Security Violation: Supplier cannot bid on RFQ from different campaign');
            }
        }
        const offer = await this.prisma.offer.create({
            data: {
                rfqRequestId: data.requestId,
                supplierId: data.supplierId,
                price: parseFloat(data.pricePerUnit) || 0,
                currency: data.currency,
                moq: parseInt(data.moq) || 0,
                leadTime: parseInt(data.leadTimeWeeks) || 0,
                status: 'SUBMITTED',
                validityDate: data.validityDate ? new Date(data.validityDate) : null,
                comments: data.comment,
                submittedAt: new Date(),
            },
            include: { supplier: true }
        });
        if (rfq.ownerId) {
            const supplierName = offer.supplier?.name || 'Dostawca';
            await this.notifications.send(rfq.ownerId, 'OFFER_RECEIVED', {
                subject: 'Nowa oferta od dostawcy',
                message: `Dostawca ${supplierName} złożył ofertę na ${rfq.productName}. Cena: ${offer.price} ${offer.currency}.`,
                data: { offerId: offer.id, rfqId: rfq.id }
            });
        }
        return offer;
    }
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], RequestsService);
//# sourceMappingURL=requests.service.js.map