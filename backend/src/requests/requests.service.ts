import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../common/services/notification.service';
import { EmailService } from '../email/email.service';
import { TranslationService } from '../common/services/translation.service';
import { CurrencyService } from '../common/services/currency.service';
import { getLanguageForCountry } from '../common/normalize-country';
import { TenantContextService } from '../common/services/tenant-context.service';
import * as crypto from 'crypto';

// Valid RFQ status transitions
const RFQ_TRANSITIONS: Record<string, string[]> = {
    DRAFT: ['ACTIVE'],
    ACTIVE: ['CLOSED', 'ARCHIVED'],
    CLOSED: ['ARCHIVED'],
};

// Valid Offer status transitions
const OFFER_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['VIEWED'],
    VIEWED: ['SUBMITTED'],
    SUBMITTED: ['SHORTLISTED', 'REJECTED', 'ACCEPTED', 'COUNTER_OFFERED'],
    SHORTLISTED: ['ACCEPTED', 'REJECTED', 'COUNTER_OFFERED'],
    COUNTER_OFFERED: ['SUBMITTED'], // Supplier resubmits after counter
};

@Injectable()
export class RequestsService {
    private readonly logger = new Logger(RequestsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notifications: NotificationService,
        private readonly emailService: EmailService,
        private readonly translationService: TranslationService,
        private readonly currencyService: CurrencyService,
        private readonly tenantContext: TenantContextService,
    ) { }

    // --- Ownership helpers ---

    private async verifyRfqOwnership(rfqId: string, userId: string) {
        const rfq = await this.prisma.rfqRequest.findUnique({ where: { id: rfqId } });
        if (!rfq) throw new NotFoundException('RFQ not found');
        if (rfq.ownerId !== userId) throw new ForbiddenException('Not authorized to access this RFQ');
        return rfq;
    }

    private async verifyOfferOwnership(offerId: string, userId: string) {
        const offer = await this.prisma.offer.findUnique({
            where: { id: offerId },
            include: { rfqRequest: true },
        });
        if (!offer) throw new NotFoundException('Offer not found');
        if (offer.rfqRequest?.ownerId !== userId) throw new ForbiddenException('Not authorized to access this offer');
        return offer;
    }

    private validateTransition(current: string, next: string, transitionMap: Record<string, string[]>, entityName: string) {
        const allowed = transitionMap[current];
        if (!allowed || !allowed.includes(next)) {
            throw new BadRequestException(
                `Invalid ${entityName} status transition: ${current} → ${next}. Allowed: ${allowed?.join(', ') || 'none'}`,
            );
        }
    }

    // --- RFQ CRUD ---

    async findAll(userId?: string) {
        const where: any = {};

        // Organization isolation + sharing-aware filtering (via TenantContext)
        if (userId) {
            const tenant = await this.tenantContext.resolve(userId);
            where.OR = tenant.rfqOwnerFilter();
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

    async findOne(id: string, userId?: string) {
        const rfq = await this.prisma.rfqRequest.findUnique({
            where: { id },
            include: {
                deliveryLocation: true,
                offers: true,
            },
        });
        if (!rfq) throw new NotFoundException('RFQ not found');
        if (userId && rfq.ownerId !== userId) throw new ForbiddenException('Not authorized to access this RFQ');
        return rfq;
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
                offerDeadline: data.offerDeadline ? new Date(data.offerDeadline) : null,
                attachments: data.attachments || null,
                status: 'DRAFT',
                ownerId: userId || null,
            },
        });
    }

    async update(id: string, data: any, userId?: string) {
        const rfq = await this.verifyRfqOwnership(id, userId!);

        // If updating status, validate transition
        if (data.status) {
            this.validateTransition(rfq.status, data.status, RFQ_TRANSITIONS, 'RFQ');
        }

        // Allow editing more fields when RFQ is still DRAFT
        if (rfq.status === 'DRAFT') {
            return this.prisma.rfqRequest.update({
                where: { id },
                data: {
                    ...(data.status && { status: data.status }),
                    ...(data.productName !== undefined && { productName: data.productName }),
                    ...(data.partNumber !== undefined && { partNumber: data.partNumber }),
                    ...(data.category !== undefined && { category: data.category }),
                    ...(data.material !== undefined && { material: data.material }),
                    ...(data.description !== undefined && { description: data.description }),
                    ...(data.targetPrice !== undefined && { targetPrice: data.targetPrice ? parseFloat(data.targetPrice) : null }),
                    ...(data.currency !== undefined && { currency: data.currency }),
                    ...(data.quantity !== undefined && { quantity: parseInt(data.quantity?.toString()) || 0 }),
                    ...(data.unit !== undefined && { unit: data.unit }),
                    ...(data.incoterms !== undefined && { incoterms: Array.isArray(data.incoterms) ? data.incoterms.join(',') : data.incoterms }),
                    ...(data.paymentTerms !== undefined && { paymentTerms: data.paymentTerms }),
                    ...(data.deliveryLocationId !== undefined && { deliveryLocationId: data.deliveryLocationId }),
                    ...(data.offerDeadline !== undefined && { offerDeadline: data.offerDeadline ? new Date(data.offerDeadline) : null }),
                    ...(data.attachments !== undefined && { attachments: data.attachments }),
                },
            });
        }

        // Non-DRAFT: only allow status changes
        return this.prisma.rfqRequest.update({
            where: { id },
            data: { status: data.status },
        });
    }

    async acceptOffer(offerId: string, userId?: string) {
        const offer = await this.verifyOfferOwnership(offerId, userId!);
        this.validateTransition(offer.status, 'ACCEPTED', OFFER_TRANSITIONS, 'Offer');

        const requestId = offer.rfqRequestId;

        return this.prisma.$transaction([
            this.prisma.offer.update({
                where: { id: offerId },
                data: { status: 'ACCEPTED' }
            }),
            this.prisma.offer.updateMany({
                where: {
                    rfqRequestId: requestId,
                    id: { not: offerId },
                    status: { notIn: ['REJECTED'] }, // Don't re-reject already rejected
                },
                data: { status: 'REJECTED' }
            }),
            this.prisma.rfqRequest.update({
                where: { id: requestId },
                data: { status: 'CLOSED' }
            })
        ]);
    }

    /**
     * Send RFQ to all suppliers from a campaign
     */
    async sendRfqToCampaign(rfqId: string, campaignId: string, userId?: string): Promise<{ sent: number; failed: number }> {
        if (userId) await this.verifyRfqOwnership(rfqId, userId);

        const suppliers = await this.prisma.supplier.findMany({
            where: { campaignId },
            include: { contacts: true },
        });

        const supplierIds = suppliers.map(s => s.id);
        return this.sendRfqToSuppliers(rfqId, supplierIds, userId);
    }

    /**
     * Send RFQ to specific suppliers
     */
    async sendRfqToSuppliers(rfqId: string, supplierIds: string[], userId?: string): Promise<{ sent: number; failed: number }> {
        const rfq = await this.prisma.rfqRequest.findUnique({
            where: { id: rfqId },
            include: {
                owner: { include: { organization: true } },
            },
        });
        if (!rfq) throw new NotFoundException('RFQ not found');
        if (userId && rfq.ownerId !== userId) throw new ForbiddenException('Not authorized to send this RFQ');

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

                // Prevent duplicate offers for same supplier+RFQ
                const existingOffer = await this.prisma.offer.findFirst({
                    where: { rfqRequestId: rfqId, supplierId: supplier.id, parentOfferId: null },
                });
                if (existingOffer) {
                    this.logger.warn(`Offer already exists for supplier ${supplier.name} on RFQ ${rfqId}, skipping`);
                    continue;
                }

                // Create Offer record (PENDING = invitation sent) with 30-day token expiry
                const offer = await this.prisma.offer.create({
                    data: {
                        rfqRequestId: rfqId,
                        supplierId: supplier.id,
                        status: 'PENDING',
                        price: 0,
                        currency: rfq.currency || 'EUR',
                        tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
                const replyDomain = this.getReplyDomain(supplier);
                const result = await this.emailService.sendEmail({
                    to: primaryEmail,
                    subject: `RFQ: ${rfq.productName}`,
                    html: htmlContent,
                    organizationId,
                    replyTo: `reply-${offer.id}@${replyDomain}`,
                });

                if (result.sent) {
                    // Save Resend emailId for incoming reply matching
                    if (result.emailId) {
                        await this.prisma.offer.update({
                            where: { id: offer.id },
                            data: { resendEmailId: result.emailId },
                        });
                    }
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

        // Update RFQ status to ACTIVE (was incorrectly 'SENT')
        if (sent > 0) {
            await this.prisma.rfqRequest.update({
                where: { id: rfqId },
                data: { status: 'ACTIVE' },
            });
        }

        return { sent, failed };
    }

    private getReplyDomain(supplier: { country?: string | null }): string {
        return supplier.country === 'PL' ? 'procurea.pl' : 'procurea.io';
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

    async getOffersByRfq(rfqId: string, userId?: string) {
        const rfq = await this.prisma.rfqRequest.findUnique({ where: { id: rfqId } });
        if (!rfq) throw new NotFoundException('RFQ not found');
        if (userId && rfq.ownerId !== userId) throw new ForbiddenException('Not authorized to access this RFQ');

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

    async rejectOffer(offerId: string, reason?: string, userId?: string) {
        const offer = await this.verifyOfferOwnership(offerId, userId!);
        this.validateTransition(offer.status, 'REJECTED', OFFER_TRANSITIONS, 'Offer');

        const comments = reason
            ? `${offer.comments ? offer.comments + '\n' : ''}[REJECTION] ${reason}`
            : offer.comments;

        return this.prisma.offer.update({
            where: { id: offerId },
            data: { status: 'REJECTED', comments },
            include: { supplier: true },
        });
    }

    async shortlistOffer(offerId: string, userId?: string) {
        const offer = await this.verifyOfferOwnership(offerId, userId!);
        this.validateTransition(offer.status, 'SHORTLISTED', OFFER_TRANSITIONS, 'Offer');

        return this.prisma.offer.update({
            where: { id: offerId },
            data: { status: 'SHORTLISTED' },
            include: { supplier: true },
        });
    }

    async counterOffer(offerId: string, terms: { price?: number; moq?: number; leadTime?: number; comments?: string }, userId?: string) {
        const offer = await this.verifyOfferOwnership(offerId, userId!);
        this.validateTransition(offer.status, 'COUNTER_OFFERED', OFFER_TRANSITIONS, 'Offer');

        const historyEntry = {
            action: 'COUNTER_OFFERED',
            by: 'buyer',
            terms,
            timestamp: new Date().toISOString(),
        };
        const existingHistory = Array.isArray(offer.negotiationHistory) ? offer.negotiationHistory : [];

        return this.prisma.offer.update({
            where: { id: offerId },
            data: {
                status: 'COUNTER_OFFERED',
                counterOfferTerms: terms as any,
                negotiationHistory: [...existingHistory, historyEntry] as any,
            },
            include: { supplier: true },
        });
    }

    async findOfferById(offerId: string, userId?: string) {
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
        if (userId && offer.rfqRequest?.ownerId !== userId) {
            throw new ForbiddenException('Not authorized to access this offer');
        }

        return offer;
    }

    async resendOfferEmail(offerId: string, userId?: string) {
        let offer = await this.findOfferById(offerId, userId);

        // Regenerate token if expired
        const now = new Date();
        if (offer.tokenExpiresAt && offer.tokenExpiresAt < now) {
            this.logger.log(`Regenerating expired token for offer ${offerId}`);
            const newExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

            await this.prisma.offer.update({
                where: { id: offerId },
                data: {
                    accessToken: crypto.randomUUID(),
                    tokenExpiresAt: newExpiry,
                },
            });

            // Refetch offer with new token
            offer = await this.findOfferById(offerId, userId);
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
        const replyDomain = this.getReplyDomain(offer.supplier);
        const result = await this.emailService.sendEmail({
            to: emails[0],
            subject: `RFQ: ${rfq.productName}`,
            html: htmlContent,
            organizationId,
            replyTo: `reply-${offer.id}@${replyDomain}`,
        });

        if (!result.sent) {
            throw new Error(`Failed to send email to ${emails[0]}`);
        }

        // Update Resend emailId for reply matching
        if (result.emailId) {
            await this.prisma.offer.update({
                where: { id: offer.id },
                data: { resendEmailId: result.emailId },
            });
        }

        this.logger.log(`Resent RFQ email to ${offer.supplier.name} (${emails[0]})`);

        return { success: true, message: 'Email sent successfully' };
    }

    async compareOffers(offerIds: string[], userId?: string) {
        if (!offerIds || offerIds.length < 2) {
            throw new BadRequestException('At least 2 offers required for comparison');
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

        // Verify ownership: all offers must belong to the same RFQ owned by this user
        if (userId) {
            for (const offer of offers) {
                if (offer.rfqRequest?.ownerId !== userId) {
                    throw new ForbiddenException('Not authorized to compare these offers');
                }
            }
        }

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

    async createOffer(data: any, userId?: string) {
        const rfq = await this.prisma.rfqRequest.findUnique({
            where: { id: data.rfqRequestId },
            include: { owner: true }
        });

        if (!rfq) throw new NotFoundException('RFQ not found');
        if (userId && rfq.ownerId !== userId) throw new ForbiddenException('Not authorized to create offers for this RFQ');

        const supplier = await this.prisma.supplier.findUnique({
            where: { id: data.supplierId }
        });

        if (!supplier) throw new NotFoundException('Supplier not found');

        if (rfq.campaignId && supplier.campaignId) {
            if (rfq.campaignId !== supplier.campaignId) {
                throw new ForbiddenException('Supplier cannot bid on RFQ from different campaign');
            }
        }

        const offer = await this.prisma.offer.create({
            data: {
                rfqRequestId: data.rfqRequestId,
                supplierId: data.supplierId,
                price: parseFloat(data.price) || 0,
                currency: data.currency,
                moq: parseInt(data.moq) || 0,
                leadTime: parseInt(data.leadTime) || 0,
                status: 'SUBMITTED',
                validityDate: data.validityDate ? new Date(data.validityDate) : null,
                comments: data.comments,
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
