import { Injectable, NotFoundException, ForbiddenException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/services/tenant-context.service';
import { GeminiService } from '../common/services/gemini.service';
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service';
import { parseAiJson } from '../common/utils/parse-ai-json';

const CONTRACT_TRANSITIONS: Record<string, string[]> = {
    DRAFT: ['UNDER_REVIEW'],
    UNDER_REVIEW: ['SIGNED', 'DRAFT'],
    SIGNED: ['ACTIVE'],
    ACTIVE: ['EXPIRED', 'TERMINATED'],
};

@Injectable()
export class ContractsService {
    private readonly logger = new Logger(ContractsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantContext: TenantContextService,
        private readonly geminiService: GeminiService,
        private readonly purchaseOrders: PurchaseOrdersService,
    ) {}

    async findAll(userId: string, status?: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });

        const where: any = {};
        if (user?.organizationId) {
            where.organizationId = user.organizationId;
        } else {
            where.createdById = userId;
        }
        if (status) where.status = status;

        return this.prisma.contract.findMany({
            where,
            include: {
                offer: {
                    select: {
                        id: true,
                        supplier: { select: { id: true, name: true, country: true } },
                        rfqRequest: { select: { id: true, productName: true } },
                    },
                },
                createdBy: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });

        const contract = await this.prisma.contract.findFirst({
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
                createdBy: { select: { id: true, name: true, email: true } },
            },
        });
        if (!contract) throw new NotFoundException('Contract not found');
        return contract;
    }

    async create(userId: string, data: {
        offerId: string;
        title: string;
        terms?: string;
        startDate?: string;
        endDate?: string;
    }) {
        // Verify offer exists and is accepted
        const offer = await this.prisma.offer.findUnique({
            where: { id: data.offerId },
            include: {
                rfqRequest: { select: { ownerId: true } },
                supplier: { select: { name: true } },
            },
        });
        if (!offer) throw new NotFoundException('Offer not found');
        if (offer.status !== 'ACCEPTED') throw new BadRequestException('Can only create contracts for accepted offers');

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });

        return this.prisma.contract.create({
            data: {
                offerId: data.offerId,
                createdById: userId,
                organizationId: user?.organizationId || undefined,
                title: data.title,
                terms: data.terms,
                status: 'DRAFT',
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
    }

    async updateStatus(id: string, userId: string, newStatus: string, comments?: string) {
        const contract = await this.findOne(id, userId); // Reuse ownership check

        const allowed = CONTRACT_TRANSITIONS[contract.status];
        if (!allowed?.includes(newStatus)) {
            throw new BadRequestException(`Cannot transition from ${contract.status} to ${newStatus}`);
        }

        const data: any = { status: newStatus };
        if (newStatus === 'SIGNED') data.signedAt = new Date();

        const updated = await this.prisma.contract.update({ where: { id }, data });

        // Orchestration: when a contract is signed, auto-create a DRAFT PO so the
        // buyer doesn't have to click "Generate PO" separately. Idempotent — if a
        // PO already exists for this contract, skip. Errors are logged but don't
        // fail the status transition (signing the contract is the primary action).
        if (newStatus === 'SIGNED') {
            try {
                const existing = await this.prisma.purchaseOrder.findFirst({
                    where: { contractId: id },
                    select: { id: true },
                });
                if (!existing) {
                    const po = await this.purchaseOrders.generateFromContract(userId, id);
                    this.logger.log(
                        `Auto-generated PO ${po.id} (${po.poNumber}) for signed contract ${id}`,
                    );
                } else {
                    this.logger.log(
                        `Skipped PO auto-gen for contract ${id} — PO ${existing.id} already exists`,
                    );
                }
            } catch (err) {
                this.logger.warn(
                    `Failed to auto-generate PO for contract ${id}: ${(err as Error).message}`,
                );
            }
        }

        return updated;
    }

    async update(id: string, userId: string, data: any) {
        const contract = await this.findOne(id, userId); // Reuse ownership check
        if (contract.status !== 'DRAFT') throw new BadRequestException('Can only edit DRAFT contracts');

        return this.prisma.contract.update({
            where: { id },
            data: {
                title: data.title,
                terms: data.terms,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        });
    }

    /**
     * Generate an AI-powered contract draft from an accepted offer.
     * Uses Gemini to produce a title, full terms body, and suggested start/end dates
     * based on the Offer + RfqRequest + Supplier context.
     *
     * Does NOT persist the contract — returns a draft for the frontend to pre-fill
     * the contract creation form. The user edits and then saves via POST /contracts.
     */
    async generateFromOffer(userId: string, offerId: string): Promise<{
        draft: {
            title: string;
            terms: string;
            startDate?: string;
            endDate?: string;
            offerId: string;
        };
        source: {
            productName: string;
            supplierName: string;
            price: number | null;
            currency: string | null;
            leadTime: number | null;
            incoterms: string | null;
        };
    }> {
        // 1. Load Offer with full context
        const offer = await this.prisma.offer.findUnique({
            where: { id: offerId },
            include: {
                rfqRequest: {
                    include: {
                        owner: true,
                        campaign: true,
                        deliveryLocation: true,
                    },
                },
                supplier: { include: { contacts: true } },
                priceTiers: true,
            },
        });
        if (!offer) throw new NotFoundException('Offer not found');
        if (offer.status !== 'ACCEPTED') {
            throw new BadRequestException('Can only generate contracts for accepted offers');
        }

        // 2. Authorization: follow the same pattern as create() — verify the user has
        //    access to the underlying RFQ (owner OR same organization)
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });
        const rfqOwnerId = offer.rfqRequest?.ownerId ?? null;
        const rfqOwnerOrgId = offer.rfqRequest?.owner?.organizationId ?? null;
        const hasAccess =
            rfqOwnerId === userId ||
            (!!user?.organizationId && user.organizationId === rfqOwnerOrgId);
        if (!hasAccess) {
            throw new ForbiddenException('You do not have access to this offer');
        }

        // 3. Build Gemini prompt and call the model
        const prompt = this.buildContractPrompt(offer);
        let aiResponse: string;
        try {
            aiResponse = await this.geminiService.generateContent(
                prompt,
                userId,
                'contract-generation',
            );
        } catch (err: any) {
            this.logger.error(`Gemini call failed for offer ${offerId}: ${err?.message}`);
            throw new InternalServerErrorException(
                'Failed to generate contract draft. Please try again.',
            );
        }

        // 4. Parse JSON response
        const parsed = this.parseContractDraft(aiResponse);

        return {
            draft: {
                title: parsed.title,
                terms: parsed.terms,
                startDate: parsed.startDate,
                endDate: parsed.endDate,
                offerId: offer.id,
            },
            source: {
                productName: offer.rfqRequest.productName,
                supplierName: offer.supplier.name ?? 'Unknown Supplier',
                price: offer.price ?? null,
                currency: offer.currency ?? null,
                leadTime: offer.leadTime ?? null,
                incoterms: offer.rfqRequest.incoterms ?? null,
            },
        };
    }

    private buildContractPrompt(offer: any): string {
        const rfq = offer.rfqRequest;
        const supplier = offer.supplier;
        const ownerLanguage: string = rfq.owner?.language || 'pl';
        const isPolish = ownerLanguage === 'pl';

        const fmtDate = (d: Date | string | null | undefined): string => {
            if (!d) return 'TBD';
            try {
                return new Date(d).toISOString().slice(0, 10);
            } catch {
                return 'TBD';
            }
        };

        const priceTiersText = (offer.priceTiers || [])
            .map((t: any) => {
                const range = t.maxQty == null
                    ? `${t.minQty}+`
                    : `${t.minQty}-${t.maxQty}`;
                return `  - ${range} ${rfq.unit || 'pcs'}: ${t.unitPrice} ${offer.currency || 'EUR'}`;
            })
            .join('\n') || '  (single price — no tiers)';

        const deliveryAddress = rfq.deliveryLocation
            ? [rfq.deliveryLocation.name, rfq.deliveryLocation.address]
                .filter(Boolean)
                .join(' — ')
            : rfq.deliveryAddress || 'N/A';

        return `You are a procurement contract drafting assistant. Generate a draft commercial contract in ${isPolish ? 'Polish' : 'English'} based on the data below.

RFQ (Request for Quotation):
- Product: ${rfq.productName}
- Part number: ${rfq.partNumber || 'N/A'}
- Category: ${rfq.category || 'N/A'}
- Material: ${rfq.material || 'N/A'}
- Description: ${rfq.description || 'N/A'}
- Quantity: ${rfq.quantity} ${rfq.unit || 'pcs'}
- Estimated Annual Usage (EAU): ${rfq.eau || 'N/A'}
- Target price: ${rfq.targetPrice != null ? `${rfq.targetPrice} ${rfq.currency || 'EUR'}` : 'N/A'}
- Incoterms: ${rfq.incoterms || 'N/A'}
- Payment terms: ${rfq.paymentTerms || 'N/A'}
- Delivery address: ${deliveryAddress}
- Desired delivery date: ${fmtDate(rfq.desiredDeliveryDate)}

Supplier:
- Name: ${supplier.name || 'N/A'}
- Country: ${supplier.country || 'N/A'}
- City: ${supplier.city || 'N/A'}
- Website: ${supplier.website || 'N/A'}
- Specialization: ${supplier.specialization || 'N/A'}

Accepted Offer:
- Price: ${offer.price != null ? `${offer.price} ${offer.currency || 'EUR'}` : 'N/A'}
- Price tiers:
${priceTiersText}
- MOQ: ${offer.moq || 'N/A'}
- Lead time: ${offer.leadTime != null ? `${offer.leadTime} weeks` : 'N/A'}
- Validity date: ${fmtDate(offer.validityDate)}
- Incoterms confirmed: ${offer.incotermsConfirmed ? 'yes' : 'no'}
- Specs confirmed: ${offer.specsConfirmed ? 'yes' : 'no'}
- Supplier comments: ${offer.comments || 'N/A'}

Generate a JSON response with this EXACT structure (no markdown fences, no explanation, no prose before or after the JSON):
{
  "title": "Contract title, e.g. 'Supply Agreement - [Product] with [Supplier]' (in ${isPolish ? 'Polish' : 'English'})",
  "terms": "Full contract body as plain markdown. Include sections: 1) Parties (Buyer and Seller with concrete names), 2) Subject of agreement (product, specs, quantity), 3) Price & payment terms, 4) Delivery (incoterms, date, address), 5) Quality & specifications, 6) Liability & warranties, 7) Termination, 8) Governing law & jurisdiction (Polish law & Polish courts if supplier is in PL or EU, otherwise flexible jurisdiction aligned with the buyer). Use concrete values from the data above. Use [PLACEHOLDER] markers only where information is truly missing from the data provided.",
  "startDate": "YYYY-MM-DD (suggest today)",
  "endDate": "YYYY-MM-DD (suggest today + 12 months, or aligned with delivery date + warranty period)"
}`;
    }

    private parseContractDraft(aiResponse: string): {
        title: string;
        terms: string;
        startDate?: string;
        endDate?: string;
    } {
        let parsed: any;
        try {
            parsed = parseAiJson<any>(aiResponse);
        } catch (err: any) {
            this.logger.error(`Failed to parse AI response: ${err?.message}`);
            throw new InternalServerErrorException(
                'AI returned an invalid response. Please try again.',
            );
        }

        if (!parsed || typeof parsed !== 'object') {
            throw new InternalServerErrorException('AI returned an empty response.');
        }

        const title = typeof parsed.title === 'string' ? parsed.title.trim() : '';
        const terms = typeof parsed.terms === 'string' ? parsed.terms.trim() : '';

        if (!title) {
            throw new InternalServerErrorException('AI response missing title field.');
        }
        if (!terms) {
            throw new InternalServerErrorException('AI response missing terms field.');
        }

        const isValidDate = (s: unknown): s is string =>
            typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

        return {
            title,
            terms,
            startDate: isValidDate(parsed.startDate) ? parsed.startDate : undefined,
            endDate: isValidDate(parsed.endDate) ? parsed.endDate : undefined,
        };
    }
}
