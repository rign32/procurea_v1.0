import { Controller, Get, Post, Param, Query, Body, UseGuards, Req, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeyGuard } from './api-key.guard';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../common/services/tenant-context.service';
import * as crypto from 'crypto';

/**
 * API Key Management (JWT auth — for the app UI)
 */
@UseGuards(AuthGuard('jwt'))
@Controller('api-keys')
export class ApiKeyManagementController {
    constructor(private readonly prisma: PrismaService) {}

    @Get()
    async listKeys(@Req() req: any) {
        const userId = req.user?.userId || req.user?.sub;
        return this.prisma.apiKey.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                prefix: true,
                scopes: true,
                enabled: true,
                lastUsedAt: true,
                expiresAt: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    @Post()
    async createKey(@Req() req: any, @Body() body: { name: string; scopes?: string[]; expiresInDays?: number }) {
        const userId = req.user?.userId || req.user?.sub;

        // Generate API key
        const rawKey = `pk_${crypto.randomBytes(32).toString('hex')}`;
        const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
        const prefix = rawKey.substring(0, 10);

        const expiresAt = body.expiresInDays
            ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000)
            : null;

        const apiKey = await this.prisma.apiKey.create({
            data: {
                userId,
                name: body.name,
                hashedKey,
                prefix,
                scopes: body.scopes || ['read'],
                expiresAt,
            },
        });

        // Return raw key ONLY on creation (never again)
        return {
            id: apiKey.id,
            name: apiKey.name,
            key: rawKey,
            prefix,
            scopes: apiKey.scopes,
            expiresAt,
            warning: 'Save this key now. It will not be shown again.',
        };
    }

    @Delete(':id')
    async deleteKey(@Param('id') id: string, @Req() req: any) {
        const userId = req.user?.userId || req.user?.sub;
        const key = await this.prisma.apiKey.findFirst({ where: { id, userId } });
        if (!key) return { error: 'Not found' };

        await this.prisma.apiKey.delete({ where: { id } });
        return { success: true };
    }
}

/**
 * Public API v1 (API Key auth)
 */
@UseGuards(ApiKeyGuard)
@Controller('v1')
export class PublicApiV1Controller {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantContext: TenantContextService,
    ) {}

    @Get('campaigns')
    async listCampaigns(@Req() req: any, @Query('status') status?: string, @Query('page') page?: string) {
        const userId = req.user.userId;
        const tenant = await this.tenantContext.resolve(userId);

        const where: any = { deletedAt: null, rfqRequest: tenant.campaignOwnerFilter() };
        if (status) where.status = status;

        const pageNum = parseInt(page || '1', 10);
        const pageSize = 50;

        const [campaigns, total] = await Promise.all([
            this.prisma.campaign.findMany({
                where,
                skip: (pageNum - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { suppliers: true } },
                    rfqRequest: { select: { productName: true, status: true } },
                },
            }),
            this.prisma.campaign.count({ where }),
        ]);

        return {
            data: campaigns.map(c => ({
                id: c.id,
                name: c.name,
                status: c.status,
                stage: c.stage,
                suppliersCount: c._count.suppliers,
                productName: c.rfqRequest?.productName,
                createdAt: c.createdAt,
            })),
            pagination: { page: pageNum, pageSize, total, totalPages: Math.ceil(total / pageSize) },
        };
    }

    @Get('campaigns/:id')
    async getCampaign(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.userId;
        const tenant = await this.tenantContext.resolve(userId);

        const campaign = await this.prisma.campaign.findFirst({
            where: { id, deletedAt: null, rfqRequest: tenant.campaignOwnerFilter() },
            include: {
                suppliers: {
                    where: { deletedAt: null },
                    select: {
                        id: true, name: true, country: true, city: true, website: true,
                        analysisScore: true, specialization: true, companyType: true,
                        contactEmails: true, employeeCount: true,
                    },
                },
                rfqRequest: { select: { id: true, productName: true, status: true, quantity: true, unit: true } },
            },
        });

        if (!campaign) return { error: 'Campaign not found' };
        return { data: campaign };
    }

    @Get('suppliers')
    async listSuppliers(@Req() req: any, @Query('page') page?: string, @Query('search') search?: string) {
        const userId = req.user.userId;
        const tenant = await this.tenantContext.resolve(userId);

        const where: any = { deletedAt: null, campaign: tenant.supplierCampaignFilter() };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { country: { contains: search, mode: 'insensitive' } },
            ];
        }

        const pageNum = parseInt(page || '1', 10);
        const pageSize = 100;

        const [suppliers, total] = await Promise.all([
            this.prisma.supplier.findMany({
                where,
                skip: (pageNum - 1) * pageSize,
                take: pageSize,
                orderBy: { name: 'asc' },
                select: {
                    id: true, name: true, country: true, city: true, website: true,
                    analysisScore: true, specialization: true, companyType: true,
                    contactEmails: true, employeeCount: true, certificates: true,
                },
            }),
            this.prisma.supplier.count({ where }),
        ]);

        return {
            data: suppliers,
            pagination: { page: pageNum, pageSize, total, totalPages: Math.ceil(total / pageSize) },
        };
    }

    @Get('rfqs')
    async listRfqs(@Req() req: any, @Query('status') status?: string) {
        const userId = req.user.userId;
        const tenant = await this.tenantContext.resolve(userId);

        const where: any = { deletedAt: null, OR: tenant.rfqOwnerFilter() };
        if (status) where.status = status;

        const rfqs = await this.prisma.rfqRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true, status: true, productName: true, quantity: true, unit: true,
                currency: true, targetPrice: true, category: true,
                createdAt: true, updatedAt: true,
                _count: { select: { offers: true } },
            },
        });

        return { data: rfqs };
    }
}
