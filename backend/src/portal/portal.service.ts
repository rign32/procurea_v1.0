import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../common/services/notification.service';
import { getLanguageForCountry } from '../common/normalize-country';

interface PriceTierDto {
    minQty: number;
    maxQty?: number;
    unitPrice: number;
}

interface AttachmentDto {
    filename: string;
    originalName: string;
    url: string;
}

interface SubmitOfferDto {
    currency: string;
    moq?: number;
    leadTime?: number;
    validityDate?: string;
    comments?: string;
    specsConfirmed?: boolean;
    incotermsConfirmed?: boolean;
    priceTiers: PriceTierDto[];
    alternative?: {
        altDescription: string;
        altMaterial?: string;
        moq?: number;
        leadTime?: number;
        validityDate?: string;
        comments?: string;
        priceTiers: PriceTierDto[];
    };
    submissionLanguage?: string;
    attachments?: AttachmentDto[];
}

@Injectable()
export class PortalService {
    private readonly logger = new Logger(PortalService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notifications: NotificationService,
    ) {}

    async getOfferByToken(accessToken: string) {
        const offer = await this.prisma.offer.findUnique({
            where: { accessToken },
            include: {
                rfqRequest: {
                    include: {
                        owner: {
                            include: {
                                organization: true,
                            },
                        },
                        deliveryLocation: true,
                    },
                },
                supplier: true,
                priceTiers: { orderBy: { minQty: 'asc' } },
                alternatives: {
                    include: {
                        priceTiers: { orderBy: { minQty: 'asc' } },
                    },
                },
            },
        });

        if (!offer) {
            throw new NotFoundException('Offer not found');
        }

        // Validate token expiry
        if (offer.tokenExpiresAt && offer.tokenExpiresAt < new Date()) {
            throw new BadRequestException('This link has expired. Please contact the buyer for a new invitation.');
        }

        // Mark as VIEWED if still PENDING
        if (offer.status === 'PENDING') {
            await this.prisma.offer.update({
                where: { id: offer.id },
                data: { status: 'VIEWED', viewedAt: new Date() },
            });
        }

        const rfq = offer.rfqRequest;
        const org = (rfq as any)?.owner?.organization;

        // Parse attachments JSON
        let attachments: any[] = [];
        if (rfq.attachments) {
            try {
                attachments = JSON.parse(rfq.attachments);
            } catch {
                attachments = [];
            }
        }

        // Detect portal language from supplier country
        const lang = getLanguageForCountry(offer.supplier?.country);

        return {
            offer: {
                id: offer.id,
                status: offer.status === 'PENDING' ? 'VIEWED' : offer.status,
                price: offer.price,
                currency: offer.currency,
                moq: offer.moq,
                leadTime: offer.leadTime,
                validityDate: offer.validityDate,
                comments: offer.comments,
                specsConfirmed: offer.specsConfirmed,
                incotermsConfirmed: offer.incotermsConfirmed,
                viewedAt: offer.viewedAt || new Date(),
                submittedAt: offer.submittedAt,
                attachments: (offer as any).attachments || [],
                priceTiers: offer.priceTiers.map(t => ({
                    id: t.id,
                    minQty: t.minQty,
                    maxQty: t.maxQty,
                    unitPrice: t.unitPrice,
                })),
                alternatives: offer.alternatives.map(alt => ({
                    id: alt.id,
                    altDescription: alt.altDescription,
                    altMaterial: alt.altMaterial,
                    price: alt.price,
                    currency: alt.currency,
                    moq: alt.moq,
                    leadTime: alt.leadTime,
                    validityDate: alt.validityDate,
                    comments: alt.comments,
                    priceTiers: alt.priceTiers.map(t => ({
                        id: t.id,
                        minQty: t.minQty,
                        maxQty: t.maxQty,
                        unitPrice: t.unitPrice,
                    })),
                })),
            },
            rfq: {
                productName: rfq.productName,
                partNumber: rfq.partNumber,
                category: rfq.category,
                material: rfq.material,
                description: rfq.description,
                quantity: rfq.quantity,
                eau: rfq.eau,
                unit: rfq.unit,
                currency: rfq.currency,
                incoterms: rfq.incoterms,
                desiredDeliveryDate: rfq.desiredDeliveryDate,
                attachments,
                deliveryLocation: rfq.deliveryLocation ? {
                    name: rfq.deliveryLocation.name,
                    address: rfq.deliveryLocation.address,
                } : null,
            },
            organization: org ? {
                name: org.name,
                footerEnabled: org.footerEnabled,
                footerFirstName: org.footerFirstName,
                footerLastName: org.footerLastName,
                footerCompany: org.footerCompany,
                footerPosition: org.footerPosition,
                footerEmail: org.footerEmail,
                footerPhone: org.footerPhone,
                logoUrl: org.logoUrl,
                primaryColor: org.primaryColor,
                accentColor: org.accentColor,
                portalWelcomeText: org.portalWelcomeText,
            } : null,
            supplier: {
                name: offer.supplier?.name,
                country: offer.supplier?.country,
            },
            portalLanguage: lang.code,
        };
    }

    async getOrganizationBranding(orgId: string) {
        const org = await this.prisma.organization.findUnique({
            where: { id: orgId },
            select: {
                id: true,
                name: true,
                logoUrl: true,
                primaryColor: true,
                accentColor: true,
                portalWelcomeText: true,
            },
        });

        if (!org) {
            throw new NotFoundException('Organization not found');
        }

        return org;
    }

    async validateTokenForUpload(accessToken: string) {
        const offer = await this.prisma.offer.findUnique({
            where: { accessToken },
            select: { id: true, status: true, tokenExpiresAt: true },
        });

        if (!offer) {
            throw new NotFoundException('Offer not found');
        }

        if (offer.tokenExpiresAt && offer.tokenExpiresAt < new Date()) {
            throw new BadRequestException('This link has expired.');
        }

        if (!['PENDING', 'VIEWED', 'COUNTER_OFFERED'].includes(offer.status)) {
            throw new BadRequestException('Offer has already been submitted');
        }

        return offer;
    }

    async submitOffer(accessToken: string, dto: SubmitOfferDto) {
        // Validate price tiers
        if (!dto.priceTiers || dto.priceTiers.length === 0) {
            throw new BadRequestException('At least one price tier is required');
        }
        for (const tier of dto.priceTiers) {
            if (tier.minQty < 1) throw new BadRequestException('minQty must be >= 1');
            if (tier.unitPrice <= 0) throw new BadRequestException('unitPrice must be > 0');
            if (tier.maxQty != null && tier.maxQty < tier.minQty) {
                throw new BadRequestException('maxQty must be >= minQty');
            }
        }
        if (dto.alternative?.priceTiers) {
            if (dto.alternative.priceTiers.length === 0) {
                throw new BadRequestException('Alternative must have at least one price tier');
            }
            for (const tier of dto.alternative.priceTiers) {
                if (tier.minQty < 1) throw new BadRequestException('Alternative: minQty must be >= 1');
                if (tier.unitPrice <= 0) throw new BadRequestException('Alternative: unitPrice must be > 0');
            }
        }

        const offer = await this.prisma.offer.findUnique({
            where: { accessToken },
            include: {
                rfqRequest: {
                    include: { owner: true },
                },
                supplier: true,
            },
        });

        if (!offer) {
            throw new NotFoundException('Offer not found');
        }

        // Validate token expiry
        if (offer.tokenExpiresAt && offer.tokenExpiresAt < new Date()) {
            throw new BadRequestException('This link has expired. Please contact the buyer for a new invitation.');
        }

        if (!['PENDING', 'VIEWED', 'COUNTER_OFFERED'].includes(offer.status)) {
            throw new BadRequestException('Offer has already been submitted or processed');
        }

        // Use first tier price as backward-compatible price field
        const primaryPrice = dto.priceTiers[0].unitPrice;

        const result = await this.prisma.$transaction(async (tx) => {
            // Update main offer
            const updated = await tx.offer.update({
                where: { id: offer.id },
                data: {
                    status: 'SUBMITTED',
                    submittedAt: new Date(),
                    price: primaryPrice,
                    currency: dto.currency || offer.currency,
                    moq: dto.moq,
                    leadTime: dto.leadTime,
                    validityDate: dto.validityDate ? new Date(dto.validityDate) : null,
                    comments: dto.comments,
                    specsConfirmed: dto.specsConfirmed ?? false,
                    incotermsConfirmed: dto.incotermsConfirmed ?? false,
                    submissionLanguage: dto.submissionLanguage,
                    attachments: dto.attachments && dto.attachments.length > 0
                        ? (dto.attachments as unknown as Prisma.InputJsonValue)
                        : undefined,
                },
            });

            // Create price tiers for main offer
            await tx.offerPriceTier.createMany({
                data: dto.priceTiers.map(t => ({
                    offerId: offer.id,
                    minQty: t.minQty,
                    maxQty: t.maxQty ?? null,
                    unitPrice: t.unitPrice,
                })),
            });

            // Create alternative offer if provided
            if (dto.alternative) {
                const altPrimaryPrice = dto.alternative.priceTiers[0].unitPrice;

                const altOffer = await tx.offer.create({
                    data: {
                        status: 'SUBMITTED',
                        submittedAt: new Date(),
                        price: altPrimaryPrice,
                        currency: dto.currency,
                        moq: dto.alternative.moq,
                        leadTime: dto.alternative.leadTime,
                        validityDate: dto.alternative.validityDate ? new Date(dto.alternative.validityDate) : null,
                        comments: dto.alternative.comments,
                        rfqRequestId: offer.rfqRequestId,
                        supplierId: offer.supplierId,
                        parentOfferId: offer.id,
                        altDescription: dto.alternative.altDescription,
                        altMaterial: dto.alternative.altMaterial,
                        submissionLanguage: dto.submissionLanguage,
                        viewedAt: offer.viewedAt || new Date(),
                    },
                });

                // Create price tiers for alternative
                await tx.offerPriceTier.createMany({
                    data: dto.alternative.priceTiers.map(t => ({
                        offerId: altOffer.id,
                        minQty: t.minQty,
                        maxQty: t.maxQty ?? null,
                        unitPrice: t.unitPrice,
                    })),
                });
            }

            return updated;
        });

        // Notify RFQ owner
        if (offer.rfqRequest?.ownerId) {
            const supplierName = offer.supplier?.name || 'Dostawca';
            const hasAlt = dto.alternative ? ' (+ oferta alternatywna)' : '';
            await this.notifications.send(offer.rfqRequest.ownerId, 'OFFER_RECEIVED', {
                subject: 'Nowa oferta od dostawcy',
                message: `Dostawca ${supplierName} złożył ofertę na ${offer.rfqRequest.productName}. Cena: ${primaryPrice} ${dto.currency || offer.currency}${hasAlt}.`,
                data: { offerId: offer.id, rfqId: offer.rfqRequest.id },
            });
        }

        this.logger.log(`Offer ${offer.id} submitted by supplier ${offer.supplierId}`);

        return {
            success: true,
            offerId: result.id,
            status: result.status,
        };
    }
}
