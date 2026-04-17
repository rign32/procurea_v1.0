import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../common/services/notification.service';
import { EmailService } from '../email/email.service';
import { TranslationService } from '../common/services/translation.service';
import { CurrencyService } from '../common/services/currency.service';
import { GeminiService } from '../common/services/gemini.service';
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
        private readonly geminiService: GeminiService,
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

    async compareOffers(offerIds: string[], userId?: string, includeAiRecommendation = true) {
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
                        qualityScore: true,
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
        const rfq = offers[0]?.rfqRequest;

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

        // --- Risk flags per offer ---
        const avgPrice = offersWithConvertedPrices.length > 0
            ? offersWithConvertedPrices.reduce((sum, o) => sum + o.convertedPrice, 0) / offersWithConvertedPrices.length
            : 0;

        // Count total offers per supplier (to detect new suppliers)
        const supplierIds = offersWithConvertedPrices.map(o => o.supplierId);
        const supplierOfferCounts = await this.prisma.offer.groupBy({
            by: ['supplierId'],
            where: { supplierId: { in: supplierIds } },
            _count: { id: true },
        });
        const offerCountMap = new Map(supplierOfferCounts.map(s => [s.supplierId, s._count.id]));

        const offersEnriched = offersWithConvertedPrices.map(offer => {
            // Risk: new supplier (only 1 offer ever = this one)
            const isNewSupplier = (offerCountMap.get(offer.supplierId) || 0) <= 1;

            // Risk: lead time tight — less than 7 days buffer before desired delivery
            let leadTimeRisk = false;
            if (rfq?.desiredDeliveryDate && offer.leadTime) {
                const deliveryDate = new Date(rfq.desiredDeliveryDate);
                const now = new Date();
                const leadTimeDays = offer.leadTime * 7; // leadTime is in weeks
                const estimatedDelivery = new Date(now.getTime() + leadTimeDays * 86400000);
                const bufferDays = (deliveryDate.getTime() - estimatedDelivery.getTime()) / 86400000;
                leadTimeRisk = bufferDays < 7;
            }

            // Risk: price outlier (< 50% or > 200% of average)
            const priceOutlier = avgPrice > 0 && (offer.convertedPrice < avgPrice * 0.5 || offer.convertedPrice > avgPrice * 2);

            return {
                ...offer,
                qualityScore: offer.supplier?.qualityScore ?? null,
                riskFlags: {
                    isNewSupplier,
                    leadTimeRisk,
                    priceOutlier,
                },
                compliance: {
                    specsConfirmed: offer.specsConfirmed,
                    incotermsConfirmed: offer.incotermsConfirmed,
                },
            };
        });

        // --- AI Recommendation (optional, graceful degradation) ---
        let aiRecommendation: {
            recommendedOfferId: string;
            reasoning: string;
            scores: Array<{ offerId: string; score: number; breakdown: { price: number; delivery: number; quality: number; compliance: number } }>;
        } | null = null;

        if (includeAiRecommendation && offersEnriched.length >= 2) {
            try {
                aiRecommendation = await this.generateOfferRecommendation(offersEnriched, rfq);
            } catch (err) {
                this.logger.warn(`AI recommendation failed, returning comparison without it: ${err}`);
            }
        }

        return {
            offers: offersEnriched,
            baseCurrency, // Include for frontend display
            comparison: {
                lowestPrice: lowestPrice ? { offerId: lowestPrice.id, supplierId: lowestPrice.supplierId } : null,
                fastestDelivery: fastestDelivery ? { offerId: fastestDelivery.id, supplierId: fastestDelivery.supplierId } : null,
                bestValue: bestValue ? { offerId: bestValue.id, supplierId: bestValue.supplierId } : null,
            },
            aiRecommendation,
        };
    }

    private async generateOfferRecommendation(
        offers: Array<{
            id: string;
            price?: number | null;
            currency?: string | null;
            leadTime?: number | null;
            moq?: number | null;
            specsConfirmed: boolean;
            incotermsConfirmed: boolean;
            supplier: { id: string; name: string; country?: string | null; qualityScore?: number | null } | null;
            convertedPrice: number;
        }>,
        rfq: { productName: string; quantity: number; targetPrice?: number | null; currency: string; desiredDeliveryDate?: Date | null } | null | undefined,
    ) {
        const prompt = `You are a procurement advisor. Compare these ${offers.length} offers and recommend the best one.

RFQ: ${rfq?.productName || 'N/A'}, qty ${rfq?.quantity || '?'}, target price ${rfq?.targetPrice || 'N/A'} ${rfq?.currency || 'EUR'}
Desired delivery: ${rfq?.desiredDeliveryDate ? new Date(rfq.desiredDeliveryDate).toISOString().split('T')[0] : 'Flexible'}

Offers:
${offers.map((o, i) => `${i + 1}. [ID:${o.id}] ${o.supplier?.name || 'Unknown'} (${o.supplier?.country || '?'}): price ${o.price} ${o.currency}, lead ${o.leadTime || '?'} weeks, MOQ ${o.moq || '?'}, quality score ${o.supplier?.qualityScore ?? 'N/A'}/100, specs confirmed: ${o.specsConfirmed}, incoterms confirmed: ${o.incotermsConfirmed}`).join('\n')}

Score each offer 0-100 on: price (weight 40%), delivery (20%), quality (20%), compliance (20%).
Recommend the best match overall.

JSON response ONLY:
{
  "recommendedOfferId": "offer id of the best match",
  "reasoning": "2-3 sentences explaining why (Polish if any supplier is from PL, otherwise English)",
  "scores": [
    { "offerId": "...", "score": 85, "breakdown": { "price": 90, "delivery": 80, "quality": 85, "compliance": 100 } }
  ]
}`;

        const raw = await this.geminiService.generateContent(prompt, undefined, 'offer-comparison');
        return this.parseOfferRecommendation(raw, offers);
    }

    private parseOfferRecommendation(
        raw: string,
        offers: Array<{ id: string }>,
    ): { recommendedOfferId: string; reasoning: string; scores: Array<{ offerId: string; score: number; breakdown: { price: number; delivery: number; quality: number; compliance: number } }> } {
        try {
            // Strip markdown code fences if present
            const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
            const parsed = JSON.parse(cleaned);

            const validOfferIds = new Set(offers.map(o => o.id));

            // Validate recommendedOfferId exists
            if (!parsed.recommendedOfferId || !validOfferIds.has(parsed.recommendedOfferId)) {
                // Fallback: pick first scored offer
                if (parsed.scores?.length > 0) {
                    const bestScore = parsed.scores.reduce((best: any, s: any) =>
                        (s.score > (best?.score || 0) ? s : best), parsed.scores[0]);
                    parsed.recommendedOfferId = bestScore.offerId;
                } else {
                    parsed.recommendedOfferId = offers[0].id;
                }
            }

            // Validate scores array references valid offer IDs
            if (Array.isArray(parsed.scores)) {
                parsed.scores = parsed.scores.filter((s: any) => validOfferIds.has(s.offerId));
            } else {
                parsed.scores = [];
            }

            return {
                recommendedOfferId: parsed.recommendedOfferId,
                reasoning: parsed.reasoning || '',
                scores: parsed.scores,
            };
        } catch (err) {
            this.logger.warn(`Failed to parse AI recommendation JSON: ${err}`);
            throw new Error('Invalid AI response format');
        }
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
