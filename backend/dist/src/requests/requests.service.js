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
var RequestsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notification_service_1 = require("../common/services/notification.service");
const email_service_1 = require("../email/email.service");
let RequestsService = RequestsService_1 = class RequestsService {
    prisma;
    notifications;
    emailService;
    logger = new common_1.Logger(RequestsService_1.name);
    constructor(prisma, notifications, emailService) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.emailService = emailService;
    }
    async findAll() {
        const rfqs = await this.prisma.rfqRequest.findMany({
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
        return { rfqs, total: rfqs.length };
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
    async sendRfqToCampaign(rfqId, campaignId) {
        const suppliers = await this.prisma.supplier.findMany({
            where: { campaignId },
            include: { contacts: true },
        });
        const supplierIds = suppliers.map(s => s.id);
        return this.sendRfqToSuppliers(rfqId, supplierIds);
    }
    async sendRfqToSuppliers(rfqId, supplierIds) {
        const rfq = await this.prisma.rfqRequest.findUnique({
            where: { id: rfqId },
            include: {
                owner: { include: { organization: true } },
            },
        });
        if (!rfq)
            throw new common_1.NotFoundException('RFQ not found');
        const suppliers = await this.prisma.supplier.findMany({
            where: { id: { in: supplierIds } },
            include: { contacts: true },
        });
        let sent = 0;
        let failed = 0;
        for (const supplier of suppliers) {
            try {
                const emails = this.getSupplierEmails(supplier);
                if (emails.length === 0) {
                    this.logger.warn(`No email for supplier ${supplier.name} (${supplier.id})`);
                    failed++;
                    continue;
                }
                const offer = await this.prisma.offer.create({
                    data: {
                        rfqRequestId: rfqId,
                        supplierId: supplier.id,
                        status: 'PENDING',
                        price: 0,
                        currency: rfq.currency || 'EUR',
                    },
                });
                const primaryEmail = emails[0];
                const organizationId = rfq.owner?.organizationId || undefined;
                const emailSent = await this.emailService.sendEmail({
                    to: primaryEmail,
                    subject: `Zapytanie Ofertowe: ${rfq.productName}`,
                    html: this.buildRfqEmailHtml(rfq, supplier, offer.accessToken),
                    organizationId,
                });
                if (emailSent) {
                    sent++;
                    this.logger.log(`RFQ sent to ${supplier.name} (${primaryEmail})`);
                }
                else {
                    failed++;
                    this.logger.warn(`Failed to send RFQ email to ${primaryEmail}`);
                }
            }
            catch (err) {
                this.logger.error(`Error sending RFQ to supplier ${supplier.id}: ${err.message}`);
                failed++;
            }
        }
        if (sent > 0) {
            await this.prisma.rfqRequest.update({
                where: { id: rfqId },
                data: { status: 'SENT' },
            });
        }
        return { sent, failed };
    }
    getSupplierEmails(supplier) {
        const contactEmails = supplier.contacts
            ?.map((c) => c.email)
            .filter(Boolean) || [];
        if (contactEmails.length > 0)
            return contactEmails;
        if (supplier.contactEmails) {
            return supplier.contactEmails.split(',').map((e) => e.trim()).filter(Boolean);
        }
        return [];
    }
    buildRfqEmailHtml(rfq, supplier, accessToken) {
        const portalUrl = `${process.env.FRONTEND_URL || 'https://project-c64b9be9-1d92-4bc6-be7.web.app'}/offers/${accessToken}`;
        return `
            <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #4F46E5; margin: 0; font-size: 28px;">Procurea</h1>
                    <p style="color: #64748B; margin: 8px 0 0 0;">Zapytanie Ofertowe</p>
                </div>
                <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <p style="color: #1E293B; margin: 0 0 16px 0;">Szanowni Państwo,</p>
                    <p style="color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
                        Zwracamy się z zapytaniem ofertowym dotyczącym poniższego produktu.
                        Prosimy o przesłanie oferty w odpowiedzi na tę wiadomość lub przez nasz portal.
                    </p>
                    <div style="background: #F8FAFC; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Produkt:</td>
                                <td style="padding: 8px 0; color: #1E293B; font-weight: 600;">${rfq.productName}</td>
                            </tr>
                            ${rfq.partNumber ? `<tr>
                                <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Nr części:</td>
                                <td style="padding: 8px 0; color: #1E293B;">${rfq.partNumber}</td>
                            </tr>` : ''}
                            <tr>
                                <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Ilość:</td>
                                <td style="padding: 8px 0; color: #1E293B;">${rfq.quantity} ${rfq.unit || 'szt.'}</td>
                            </tr>
                            ${rfq.material ? `<tr>
                                <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Materiał:</td>
                                <td style="padding: 8px 0; color: #1E293B;">${rfq.material}</td>
                            </tr>` : ''}
                            ${rfq.description ? `<tr>
                                <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Opis:</td>
                                <td style="padding: 8px 0; color: #1E293B;">${rfq.description}</td>
                            </tr>` : ''}
                            ${rfq.desiredDeliveryDate ? `<tr>
                                <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Termin dostawy:</td>
                                <td style="padding: 8px 0; color: #1E293B;">${new Date(rfq.desiredDeliveryDate).toLocaleDateString('pl-PL')}</td>
                            </tr>` : ''}
                        </table>
                    </div>
                    <div style="text-align: center; margin-bottom: 24px;">
                        <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Złóż ofertę
                        </a>
                    </div>
                    <p style="color: #94A3B8; font-size: 13px; text-align: center; margin: 0;">
                        Możesz też odpowiedzieć bezpośrednio na tę wiadomość e-mail.
                    </p>
                </div>
                <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #94A3B8; font-size: 12px; margin: 0;">
                        &copy; ${new Date().getFullYear()} Procurea. Wszelkie prawa zastrzeżone.
                    </p>
                </div>
            </div>
        `;
    }
    async getOffersByRfq(rfqId) {
        const rfq = await this.prisma.rfqRequest.findUnique({ where: { id: rfqId } });
        if (!rfq)
            throw new common_1.NotFoundException('RFQ not found');
        return this.prisma.offer.findMany({
            where: { rfqRequestId: rfqId },
            include: {
                supplier: {
                    select: {
                        id: true,
                        name: true,
                        country: true,
                        city: true,
                        website: true,
                        contactEmails: true,
                        contacts: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async rejectOffer(offerId, reason) {
        const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
        if (!offer)
            throw new common_1.NotFoundException('Offer not found');
        const comments = reason
            ? `${offer.comments ? offer.comments + '\n' : ''}[REJECTION] ${reason}`
            : offer.comments;
        return this.prisma.offer.update({
            where: { id: offerId },
            data: { status: 'REJECTED', comments },
            include: { supplier: true },
        });
    }
    async shortlistOffer(offerId) {
        const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
        if (!offer)
            throw new common_1.NotFoundException('Offer not found');
        return this.prisma.offer.update({
            where: { id: offerId },
            data: { status: 'SHORTLISTED' },
            include: { supplier: true },
        });
    }
    async compareOffers(offerIds) {
        if (!offerIds || offerIds.length < 2) {
            throw new common_1.NotFoundException('At least 2 offers required for comparison');
        }
        const offers = await this.prisma.offer.findMany({
            where: { id: { in: offerIds } },
            include: {
                supplier: {
                    select: {
                        id: true,
                        name: true,
                        country: true,
                        city: true,
                        website: true,
                    },
                },
            },
        });
        const submitted = offers.filter(o => o.price != null && o.price > 0);
        const lowestPrice = submitted.length > 0
            ? submitted.reduce((min, o) => (o.price < min.price ? o : min), submitted[0])
            : null;
        const fastestDelivery = submitted.filter(o => o.leadTime != null && o.leadTime > 0).length > 0
            ? submitted.filter(o => o.leadTime != null && o.leadTime > 0)
                .reduce((min, o) => (o.leadTime < min.leadTime ? o : min))
            : null;
        const withBoth = submitted.filter(o => o.price && o.leadTime);
        const bestValue = withBoth.length > 0
            ? withBoth.reduce((best, o) => {
                const score = o.price * (o.leadTime || 1);
                const bestScore = best.price * (best.leadTime || 1);
                return score < bestScore ? o : best;
            }, withBoth[0])
            : lowestPrice;
        return {
            offers,
            comparison: {
                lowestPrice: lowestPrice ? { offerId: lowestPrice.id, supplierId: lowestPrice.supplierId } : null,
                fastestDelivery: fastestDelivery ? { offerId: fastestDelivery.id, supplierId: fastestDelivery.supplierId } : null,
                bestValue: bestValue ? { offerId: bestValue.id, supplierId: bestValue.supplierId } : null,
            },
        };
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
exports.RequestsService = RequestsService = RequestsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService,
        email_service_1.EmailService])
], RequestsService);
//# sourceMappingURL=requests.service.js.map