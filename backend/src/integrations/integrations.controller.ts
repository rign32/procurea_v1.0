import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { IntegrationsService } from './services/integrations.service';
import {
    ConfirmMatchDto,
    ConnectIntegrationDto,
} from './dto/integrations.dto';
import { PrismaService } from '../prisma/prisma.service';

interface AuthedUser {
    id: string;
    organizationId?: string | null;
}

@Controller('integrations')
@UseGuards(AuthGuard('jwt'))
export class IntegrationsController {
    constructor(
        private readonly service: IntegrationsService,
        private readonly prisma: PrismaService,
    ) {}

    @Post('connections')
    async connect(@Req() req: Request, @Body() dto: ConnectIntegrationDto) {
        const user = this.requireOrgUser(req);
        return this.service.connect(user.organizationId, user.id, dto);
    }

    @Get('connections')
    async list(@Req() req: Request) {
        const user = this.requireOrgUser(req);
        return this.service.listConnections(user.organizationId);
    }

    @Delete('connections/:id')
    async disconnect(@Req() req: Request, @Param('id') id: string) {
        const user = this.requireOrgUser(req);
        return this.service.disconnect(user.organizationId, id);
    }

    @Post('connections/:id/sync')
    async sync(@Req() req: Request, @Param('id') id: string) {
        const user = this.requireOrgUser(req);
        return this.service.sync(user.organizationId, id);
    }

    @Get('matches')
    async listMatches(@Req() req: Request) {
        const user = this.requireOrgUser(req);
        return this.prisma.supplierMatch.findMany({
            where: {
                externalSupplier: {
                    connection: { organizationId: user.organizationId },
                },
            },
            include: {
                externalSupplier: {
                    select: {
                        id: true,
                        name: true,
                        taxNumber: true,
                        website: true,
                        primaryEmail: true,
                        connection: {
                            select: { platformName: true, platformSlug: true },
                        },
                    },
                },
                supplier: {
                    select: { id: true, name: true, website: true, country: true },
                },
            },
            orderBy: [{ status: 'asc' }, { confidence: 'desc' }],
            take: 500,
        });
    }

    /**
     * Single-supplier ERP match lookup — used by SupplierDetailPage to render
     * the "Already in ERP" badge without loading the full matches list.
     */
    @Get('matches/by-supplier/:supplierId')
    async matchesForSupplier(
        @Req() req: Request,
        @Param('supplierId') supplierId: string,
    ) {
        const user = this.requireOrgUser(req);
        return this.prisma.supplierMatch.findMany({
            where: {
                supplierId,
                externalSupplier: {
                    connection: { organizationId: user.organizationId },
                },
            },
            include: {
                externalSupplier: {
                    select: {
                        id: true,
                        name: true,
                        taxNumber: true,
                        website: true,
                        primaryEmail: true,
                        connection: {
                            select: { platformName: true, platformSlug: true },
                        },
                    },
                },
            },
            orderBy: [{ status: 'asc' }, { confidence: 'desc' }],
        });
    }

    @Post('matches/confirm')
    async confirmMatch(@Req() req: Request, @Body() dto: ConfirmMatchDto) {
        const user = this.requireOrgUser(req);
        const match = await this.prisma.supplierMatch.findFirst({
            where: {
                id: dto.matchId,
                externalSupplier: {
                    connection: { organizationId: user.organizationId },
                },
            },
        });
        if (!match) throw new NotFoundException('Match not found');

        return this.prisma.supplierMatch.update({
            where: { id: match.id },
            data: {
                status: dto.status,
                confirmedByUserId: user.id,
                confirmedAt: new Date(),
                rejectedReason: dto.status === 'rejected' ? dto.rejectedReason ?? null : null,
            },
        });
    }

    private requireOrgUser(req: Request): AuthedUser & { organizationId: string } {
        const user = req.user as AuthedUser | undefined;
        if (!user?.id || !user.organizationId) {
            throw new NotFoundException('Authenticated organization required');
        }
        return { id: user.id, organizationId: user.organizationId };
    }
}
