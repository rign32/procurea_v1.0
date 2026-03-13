import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../common/services/notification.service';
import { EmailService } from '../email/email.service';
import { TranslationService } from '../common/services/translation.service';
import { CurrencyService } from '../common/services/currency.service';
import { getLanguageForCountry } from '../common/normalize-country';

@Injectable()
export class RequestsService {
    private readonly logger = new Logger(RequestsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notifications: NotificationService,
        private readonly emailService: EmailService,
        private readonly translationService: TranslationService,
        private readonly currencyService: CurrencyService,
    ) { }

    async findAll(userId?: string) {
        const where: any = {
            // Hide draft RFQs (not yet sent to suppliers)
            status: { not: 'DRAFT' },
        };

        // Organization isolation + sharing-aware filtering
        if (userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { organizationId: true },
            });
            if (user?.organizationId) {
                const sharingWith = await this.prisma.userSharingPreference.findMany({
                    where: { toUserId: userId, enabled: true },
                    select: { fromUserId: true },
                });
                const visibleOwnerIds = [userId, ...sharingWith.map(s => s.fromUserId)];
                where.ownerId = { in: visibleOwnerIds };
            } else {
                where.ownerId = userId;
            }
        }

        const rfqs = await this.prisma.rfqRequest.findMany({
            where,
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

    async findOne(id: string) {
        return this.prisma.rfqRequest.findUnique({
            where: { id },
            include: {
                deliveryLocation: true,
                offers: true,
            },
        });
    }

    async create(data: any, userId?: string) {
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
                ownerId: userId || null,
            },
        });
    }

    async update(id: string, data: any) {
        return this.prisma.rfqRequest.update({
            where: { id },
            data: {
                status: data.status,
            }
        });
    }

    async acceptOffer(offerId: string) {
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

    /**
     * Send RFQ to all suppliers from a campaign
     */
    async sendRfqToCampaign(rfqId: string, campaignId: string): Promise<{ sent: number; failed: number }> {
        const suppliers = await this.prisma.supplier.findMany({
            where: { campaignId },
            include: { contacts: true },
        });

        const supplierIds = suppliers.map(s => s.id);
        return this.sendRfqToSuppliers(rfqId, supplierIds);
    }

    /**
     * Send RFQ to specific suppliers
     */
    async sendRfqToSuppliers(rfqId: string, supplierIds: string[]): Promise<{ sent: number; failed: number }> {
        const rfq = await this.prisma.rfqRequest.findUnique({
            where: { id: rfqId },
            include: {
                owner: { include: { organization: true } },
            },
        });
        if (!rfq) throw new NotFoundException('RFQ not found');

        const suppliers = await this.prisma.supplier.findMany({
            where: { id: { in: supplierIds } },
            include: { contacts: true },
        });

        let sent = 0;
        let failed = 0;

        for (const supplier of suppliers) {
            try {
                // Get email addresses
                const emails = this.getSupplierEmails(supplier);
                if (emails.length === 0) {
                    this.logger.warn(`No email for supplier ${supplier.name} (${supplier.id})`);
                    failed++;
                    continue;
                }

                // Create Offer record (PENDING = invitation sent)
                const offer = await this.prisma.offer.create({
                    data: {
                        rfqRequestId: rfqId,
                        supplierId: supplier.id,
                        status: 'PENDING',
                        price: 0,
                        currency: rfq.currency || 'EUR',
                    },
                });

                // Detect supplier language from country
                const supplierLang = getLanguageForCountry(supplier.country);
                this.logger.log(`Sending RFQ to ${supplier.name} in ${supplierLang.name} (${supplierLang.code})`);

                // Build portal URL with access token
                const portalUrl = `${process.env.FRONTEND_URL || 'https://app.procurea.pl'}/offers/${offer.accessToken}`;

                // Translate email template to supplier's language
                const htmlContent = await this.translationService.translateEmailTemplate({
                    productName: rfq.productName,
                    partNumber: rfq.partNumber,
                    quantity: rfq.quantity,
                    unit: rfq.unit,
                    material: rfq.material,
                    description: rfq.description,
                    incoterms: rfq.incoterms,
                    desiredDeliveryDate: rfq.desiredDeliveryDate?.toISOString(),
                    offerDeadline: rfq.offerDeadline?.toISOString(),
                    portalUrl,
                }, supplierLang.code);

                // Send email to primary contact
                const primaryEmail = emails[0];
                const organizationId = (rfq as any).owner?.organizationId || undefined;
                const emailSent = await this.emailService.sendEmail({
                    to: primaryEmail,
                    subject: `RFQ: ${rfq.productName}`,
                    html: htmlContent,
                    organizationId,
                });

                if (emailSent) {
                    sent++;
                    this.logger.log(`RFQ sent to ${supplier.name} (${primaryEmail})`);
                } else {
                    failed++;
                    this.logger.warn(`Failed to send RFQ email to ${primaryEmail}`);
                }
            } catch (err) {
                this.logger.error(`Error sending RFQ to supplier ${supplier.id}: ${err.message}`);
                failed++;
            }
        }

        // Update RFQ status
        if (sent > 0) {
            await this.prisma.rfqRequest.update({
                where: { id: rfqId },
                data: { status: 'SENT' },
            });
        }

        return { sent, failed };
    }

    private getSupplierEmails(supplier: any): string[] {
        // Try structured contacts first
        const contactEmails = supplier.contacts
            ?.map((c: any) => c.email)
            .filter(Boolean) || [];

        if (contactEmails.length > 0) return contactEmails;

        // Fallback to comma-separated contactEmails field
        if (supplier.contactEmails) {
            return supplier.contactEmails.split(',').map((e: string) => e.trim()).filter(Boolean);
        }

        return [];
    }

    async getOffersByRfq(rfqId: string) {
        const rfq = await this.prisma.rfqRequest.findUnique({ where: { id: rfqId } });
        if (!rfq) throw new NotFoundException('RFQ not found');

        return this.prisma.offer.findMany({
            where: {
                rfqRequestId: rfqId,
                parentOfferId: null, // Only main offers, alternatives come nested
            },
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
                priceTiers: { orderBy: { minQty: 'asc' } },
                alternatives: {
                    include: {
                        priceTiers: { orderBy: { minQty: 'asc' } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async rejectOffer(offerId: string, reason?: string) {
        const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
        if (!offer) throw new NotFoundException('Offer not found');

        const comments = reason
            ? `${offer.comments ? offer.comments + '\n' : ''}[REJECTION] ${reason}`
            : offer.comments;

        return this.prisma.offer.update({
            where: { id: offerId },
            data: { status: 'REJECTED', comments },
            include: { supplier: true },
        });
    }

    async shortlistOffer(offerId: string) {
        const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
        if (!offer) throw new NotFoundException('Offer not found');

        return this.prisma.offer.update({
            where: { id: offerId },
            data: { status: 'SHORTLISTED' },
            include: { supplier: true },
        });
    }

    async findOfferById(offerId: string) {
        const offer = await this.prisma.offer.findUnique({
            where: { id: offerId },
            include: {
                supplier: {
                    include: { contacts: true },
                },
                rfqRequest: {
                    include: {
                        owner: { include: { organization: true } },
                        deliveryLocation: true,
                    },
                },
            },
        });

        if (!offer) {
            throw new NotFoundException('Offer not found');
        }

        return offer;
    }

    async resendOfferEmail(offerId: string) {
        let offer = await this.findOfferById(offerId);

        // Regenerate token if expired
        const now = new Date();
        if (offer.tokenExpiresAt && offer.tokenExpiresAt < now) {
            this.logger.log(`Regenerating expired token for offer ${offerId}`);
            const newExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

            await this.prisma.offer.update({
                where: { id: offerId },
                data: {
                    accessToken: require('crypto').randomUUID(),
                    tokenExpiresAt: newExpiry,
                },
            });

            // Refetch offer with new token
            offer = await this.findOfferById(offerId);
        }

        // Get email addresses
        const emails = this.getSupplierEmails(offer.supplier);
        if (emails.length === 0) {
            throw new NotFoundException(`No email found for supplier ${offer.supplier.name}`);
        }

        // Detect language from supplier country
        const supplierLang = getLanguageForCountry(offer.supplier.country);

        // Build portal URL with access token
        const frontendUrl = process.env.FRONTEND_URL || 'https://app.procurea.pl';
        const portalUrl = `${frontendUrl}/offers/${offer.accessToken}`;

        const rfq = offer.rfqRequest;

        // Translate email template to supplier's language
        const htmlContent = await this.translationService.translateEmailTemplate({
            productName: rfq.productName,
            partNumber: rfq.partNumber,
            quantity: rfq.quantity,
            unit: rfq.unit,
            material: rfq.material,
            description: rfq.description,
            incoterms: rfq.incoterms,
            desiredDeliveryDate: rfq.desiredDeliveryDate?.toISOString(),
            offerDeadline: rfq.offerDeadline?.toISOString(),
            portalUrl,
        }, supplierLang.code);

        // Send email
        const organizationId = (rfq as any).owner?.organizationId || undefined;
        const emailSent = await this.emailService.sendEmail({
            to: emails[0],
            subject: `RFQ: ${rfq.productName}`,
            html: htmlContent,
            organizationId,
        });

        if (!emailSent) {
            throw new Error(`Failed to send email to ${emails[0]}`);
        }

        this.logger.log(`Resent RFQ email to ${offer.supplier.name} (${emails[0]})`);

        return { success: true, message: 'Email sent successfully' };
    }

    async compareOffers(offerIds: string[]) {
        if (!offerIds || offerIds.length < 2) {
            throw new NotFoundException('At least 2 offers required for comparison');
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
                priceTiers: { orderBy: { minQty: 'asc' } },
                rfqRequest: {
                    include: {
                        owner: {
                            include: {
                                organization: true,
                            },
                        },
                    },
                },
            },
        });

        // Get organization's base currency
        const org = offers[0]?.rfqRequest?.owner?.organization;
        const baseCurrency = org?.baseCurrency || 'PLN';

        const submitted = offers.filter(o => o.price != null && o.price > 0);

        // Convert all prices to base currency for fair comparison
        const offersWithConvertedPrices = await Promise.all(
            submitted.map(async (offer) => {
                const convertedPrice = await this.currencyService.convert(
                    offer.price!,
                    offer.currency || 'EUR',
                    baseCurrency,
                );

                return {
                    ...offer,
                    convertedPrice: (convertedPrice ?? offer.price) as number, // Fallback to original
                    conversionFailed: convertedPrice === null,
                };
            })
        );

        // Find lowest using CONVERTED prices
        const lowestPrice = offersWithConvertedPrices.length > 0
            ? offersWithConvertedPrices.reduce((min, o) =>
                (o.convertedPrice < min.convertedPrice ? o : min), offersWithConvertedPrices[0])
            : null;

        const fastestDelivery = offersWithConvertedPrices.filter(o => o.leadTime != null && o.leadTime > 0).length > 0
            ? offersWithConvertedPrices.filter(o => o.leadTime != null && o.leadTime > 0)
                .reduce((min, o) => (o.leadTime! < min.leadTime! ? o : min))
            : null;

        // Best value: lowest converted price * leadTime product
        const withBoth = offersWithConvertedPrices.filter(o => o.convertedPrice && o.leadTime);
        const bestValue = withBoth.length > 0
            ? withBoth.reduce((best, o) => {
                const score = o.convertedPrice! * (o.leadTime || 1);
                const bestScore = best.convertedPrice! * (best.leadTime || 1);
                return score < bestScore ? o : best;
            }, withBoth[0])
            : lowestPrice;

        return {
            offers: offersWithConvertedPrices,
            baseCurrency, // Include for frontend display
            comparison: {
                lowestPrice: lowestPrice ? { offerId: lowestPrice.id, supplierId: lowestPrice.supplierId } : null,
                fastestDelivery: fastestDelivery ? { offerId: fastestDelivery.id, supplierId: fastestDelivery.supplierId } : null,
                bestValue: bestValue ? { offerId: bestValue.id, supplierId: bestValue.supplierId } : null,
            },
        };
    }

    async createOffer(data: any) {
        const rfq = await this.prisma.rfqRequest.findUnique({
            where: { id: data.requestId },
            include: { owner: true }
        });

        if (!rfq) throw new NotFoundException('RFQ not found');

        const supplier = await this.prisma.supplier.findUnique({
            where: { id: data.supplierId }
        });

        if (!supplier) throw new NotFoundException('Supplier not found');

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
