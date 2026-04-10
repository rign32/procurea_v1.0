import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface TenantFilter {
    /** Current user ID */
    userId: string;
    /** User's organization ID (null if personal account) */
    organizationId: string | null;
    /** All user IDs whose data is visible (self + shared) */
    visibleOwnerIds: string[];
}

/**
 * Centralized tenant isolation service.
 * Replaces duplicated 8-line blocks across sourcing, suppliers, requests, and contacts services.
 *
 * Usage:
 *   const tenant = await this.tenantContext.resolve(userId);
 *   // For campaigns (filter via RfqRequest):
 *   where.rfqRequest = tenant.campaignOwnerFilter();
 *   // For suppliers (filter via Campaign → RfqRequest):
 *   where.campaign = { rfqRequest: tenant.campaignOwnerFilter() };
 *   // For RFQs (filter directly on ownerId):
 *   where.OR = tenant.rfqOwnerFilter();
 */
@Injectable()
export class TenantContextService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Resolve tenant context for a given user.
     * Fetches organization membership and sharing preferences.
     */
    async resolve(userId: string): Promise<ResolvedTenantContext> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
        });

        let visibleOwnerIds: string[];

        if (user?.organizationId) {
            const sharingWith = await this.prisma.userSharingPreference.findMany({
                where: { toUserId: userId, enabled: true },
                select: { fromUserId: true },
            });
            visibleOwnerIds = [userId, ...sharingWith.map(s => s.fromUserId)];
        } else {
            visibleOwnerIds = [userId];
        }

        return new ResolvedTenantContext({
            userId,
            organizationId: user?.organizationId || null,
            visibleOwnerIds,
        });
    }
}

export class ResolvedTenantContext {
    readonly userId: string;
    readonly organizationId: string | null;
    readonly visibleOwnerIds: string[];

    constructor(filter: TenantFilter) {
        this.userId = filter.userId;
        this.organizationId = filter.organizationId;
        this.visibleOwnerIds = filter.visibleOwnerIds;
    }

    /**
     * Filter for Campaign ownership (via RfqRequest.ownerId).
     * Use as: where.rfqRequest = tenant.campaignOwnerFilter()
     */
    campaignOwnerFilter(): { ownerId: { in: string[] } } | { ownerId: string } {
        if (this.visibleOwnerIds.length > 1) {
            return { ownerId: { in: this.visibleOwnerIds } };
        }
        return { ownerId: this.userId };
    }

    /**
     * Filter for RFQ listing with DRAFT visibility rules.
     * DRAFTs visible only to owner; other statuses visible to shared users.
     * Use as: where.OR = tenant.rfqOwnerFilter()
     */
    rfqOwnerFilter(): any[] {
        if (this.visibleOwnerIds.length > 1) {
            return [
                { ownerId: { in: this.visibleOwnerIds }, status: { not: 'DRAFT' } },
                { ownerId: this.userId }, // Owner sees all including DRAFT
            ];
        }
        return [{ ownerId: this.userId }];
    }

    /**
     * Filter for Supplier listing (via Campaign → RfqRequest).
     * Use as: where.campaign = tenant.supplierCampaignFilter()
     */
    supplierCampaignFilter(): { rfqRequest: { ownerId: { in: string[] } } | { ownerId: string } } {
        return { rfqRequest: this.campaignOwnerFilter() };
    }

    /**
     * Check if a specific ownerId is visible to this tenant.
     */
    canAccess(ownerId: string): boolean {
        return this.visibleOwnerIds.includes(ownerId);
    }
}
