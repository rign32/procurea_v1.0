import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MergeDevAdapter } from '../adapters/merge-dev.adapter';
import { SupplierMatchingService } from './supplier-matching.service';
import { ConnectIntegrationDto } from '../dto/integrations.dto';
import {
    ExternalSupplierData,
} from '../interfaces/supplier-connector.interface';
import { MatchCandidate } from '../interfaces/supplier-match.interface';

/**
 * IntegrationsService — orchestrates the lifecycle of a customer's ERP/CRM connection:
 *   connect → sync external suppliers → run matching against Procurea suppliers →
 *   surface matches for user confirmation.
 *
 * Faza 1 status: persistence + matching orchestration are wired live.
 * External sync (listSuppliers) depends on MergeDevAdapter which is still a skeleton.
 */
@Injectable()
export class IntegrationsService {
    private readonly logger = new Logger(IntegrationsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly merge: MergeDevAdapter,
        private readonly matcher: SupplierMatchingService,
    ) {}

    async connect(organizationId: string, userId: string, dto: ConnectIntegrationDto) {
        return this.prisma.integrationConnection.upsert({
            where: {
                organizationId_providerAccountId: {
                    organizationId,
                    providerAccountId: dto.providerAccountId,
                },
            },
            create: {
                organizationId,
                connectedByUserId: userId,
                provider: 'merge_dev',
                providerAccountId: dto.providerAccountId,
                providerAccountToken: dto.providerAccountToken,
                integrationCategory: dto.integrationCategory,
                platformSlug: dto.platformSlug,
                platformName: dto.platformName,
                status: 'active',
            },
            update: {
                providerAccountToken: dto.providerAccountToken ?? undefined,
                platformName: dto.platformName,
                status: 'active',
                disconnectedAt: null,
            },
        });
    }

    async disconnect(organizationId: string, connectionId: string) {
        const connection = await this.prisma.integrationConnection.findFirst({
            where: { id: connectionId, organizationId },
        });
        if (!connection) throw new NotFoundException('Connection not found');
        return this.prisma.integrationConnection.update({
            where: { id: connectionId },
            data: {
                status: 'disconnected',
                disconnectedAt: new Date(),
                providerAccountToken: null,
            },
        });
    }

    async listConnections(organizationId: string) {
        return this.prisma.integrationConnection.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                provider: true,
                platformSlug: true,
                platformName: true,
                integrationCategory: true,
                status: true,
                statusMessage: true,
                capabilities: true,
                lastSyncedAt: true,
                lastSyncSupplierCount: true,
                createdAt: true,
            },
        });
    }

    /**
     * Pull suppliers from the customer's ERP, cache them in ExternalSupplier,
     * and (re)run matching against the org's Procurea suppliers.
     */
    async sync(organizationId: string, connectionId: string) {
        const connection = await this.prisma.integrationConnection.findFirst({
            where: { id: connectionId, organizationId },
        });
        if (!connection) throw new NotFoundException('Connection not found');
        if (!connection.providerAccountToken) {
            throw new NotFoundException(
                'Connection has no auth token — reconnect required',
            );
        }

        const external = await this.merge.listSuppliers(
            connection.providerAccountToken,
        );

        const upsertCount = await this.persistExternalSuppliers(
            connection.id,
            external,
        );

        await this.prisma.integrationConnection.update({
            where: { id: connection.id },
            data: {
                lastSyncedAt: new Date(),
                lastSyncSupplierCount: upsertCount,
                status: 'active',
                statusMessage: null,
            },
        });

        const matchCount = await this.runMatching(organizationId, connection.id);

        return { externalCount: upsertCount, matchCount };
    }

    private async persistExternalSuppliers(
        connectionId: string,
        external: ExternalSupplierData[],
    ): Promise<number> {
        if (!external.length) return 0;
        const now = new Date();
        await this.prisma.$transaction(
            external.map((e) =>
                this.prisma.externalSupplier.upsert({
                    where: {
                        connectionId_externalId: {
                            connectionId,
                            externalId: e.externalId,
                        },
                    },
                    create: {
                        connectionId,
                        externalId: e.externalId,
                        name: e.name,
                        taxNumber: e.taxNumber ?? null,
                        website: e.website ?? null,
                        primaryEmail: e.primaryEmail ?? null,
                        emails: e.emails ?? undefined,
                        phoneNumbers: e.phoneNumbers ?? undefined,
                        addresses: (e.addresses as object[] | undefined) ?? undefined,
                        currency: e.currency ?? null,
                        isSupplier: e.isSupplier ?? true,
                        isActive: e.isActive ?? true,
                        rawData: (e.rawData as object) ?? undefined,
                        lastSyncedAt: now,
                    },
                    update: {
                        name: e.name,
                        taxNumber: e.taxNumber ?? null,
                        website: e.website ?? null,
                        primaryEmail: e.primaryEmail ?? null,
                        emails: e.emails ?? undefined,
                        phoneNumbers: e.phoneNumbers ?? undefined,
                        addresses: (e.addresses as object[] | undefined) ?? undefined,
                        currency: e.currency ?? null,
                        isSupplier: e.isSupplier ?? true,
                        isActive: e.isActive ?? true,
                        rawData: (e.rawData as object) ?? undefined,
                        lastSyncedAt: now,
                    },
                }),
            ),
        );
        return external.length;
    }

    private async runMatching(
        organizationId: string,
        connectionId: string,
    ): Promise<number> {
        // Load this org's non-deleted Procurea suppliers through the organization's campaigns.
        // Organization → User → (owned campaigns) isn't explicit in schema, but users have
        // organizationId, and campaigns link to rfqRequest.owner. For Faza 1 we match against
        // ALL suppliers in campaigns owned by users in this org.
        const procureaSuppliers = await this.prisma.supplier.findMany({
            where: {
                deletedAt: null,
                campaign: {
                    rfqRequest: {
                        owner: { organizationId },
                    },
                },
            },
            select: {
                id: true,
                name: true,
                website: true,
                contactEmails: true,
            },
        });

        const externalSuppliers = await this.prisma.externalSupplier.findMany({
            where: { connectionId, isActive: true, isSupplier: true },
            select: {
                id: true,
                name: true,
                taxNumber: true,
                website: true,
                primaryEmail: true,
            },
        });

        const procCandidates: MatchCandidate[] = procureaSuppliers.map((s) => ({
            id: s.id,
            name: s.name ?? null,
            website: s.website ?? null,
            emails: s.contactEmails ? s.contactEmails.split(',').map((e) => e.trim()) : [],
        }));

        const extCandidates: MatchCandidate[] = externalSuppliers.map((s) => ({
            id: s.id,
            name: s.name,
            taxNumber: s.taxNumber,
            website: s.website,
            emails: s.primaryEmail ? [s.primaryEmail] : [],
        }));

        const matches = this.matcher.findBestMatches(
            procCandidates,
            extCandidates,
            0.7,
        );

        if (!matches.length) return 0;

        await this.prisma.$transaction(
            matches.map((m) =>
                this.prisma.supplierMatch.upsert({
                    where: {
                        supplierId_externalSupplierId: {
                            supplierId: m.procureaId,
                            externalSupplierId: m.externalId,
                        },
                    },
                    create: {
                        supplierId: m.procureaId,
                        externalSupplierId: m.externalId,
                        confidence: m.result.confidence,
                        matchType: m.result.matchType,
                        signals: m.result.signals as unknown as object,
                        status: 'suggested',
                    },
                    update: {
                        confidence: m.result.confidence,
                        matchType: m.result.matchType,
                        signals: m.result.signals as unknown as object,
                    },
                }),
            ),
        );

        return matches.length;
    }
}
