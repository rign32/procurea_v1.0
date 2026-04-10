import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/services/tenant-context.service';

const CONTRACT_TRANSITIONS: Record<string, string[]> = {
    DRAFT: ['UNDER_REVIEW'],
    UNDER_REVIEW: ['SIGNED', 'DRAFT'],
    SIGNED: ['ACTIVE'],
    ACTIVE: ['EXPIRED', 'TERMINATED'],
};

@Injectable()
export class ContractsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantContext: TenantContextService,
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

        return this.prisma.contract.update({ where: { id }, data });
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
}
