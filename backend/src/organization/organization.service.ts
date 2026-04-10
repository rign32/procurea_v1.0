import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

export interface AuditLogFilters {
    entityType?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
}

@Injectable()
export class OrganizationService {
    private readonly logger = new Logger(OrganizationService.name);

    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
    ) { }

    async getOrganization(id: string) {
        const organization = await this.prisma.organization.findUnique({
            where: { id },
            include: { locations: true },
        });

        if (!organization) {
            throw new NotFoundException(`Organization with ID ${id} not found`);
        }

        return organization;
    }

    async updateOrganization(id: string, data: {
        name?: string;
        baseCurrency?: string;
        footerText?: string;
        footerEnabled?: boolean;
        footerFirstName?: string;
        footerLastName?: string;
        footerCompany?: string;
        footerPosition?: string;
        footerEmail?: string;
        footerPhone?: string;
        logoUrl?: string;
        primaryColor?: string;
        accentColor?: string;
        portalWelcomeText?: string;
    }) {
        // Validate currency code if provided
        if (data.baseCurrency) {
            const SUPPORTED_CURRENCIES = ['PLN', 'EUR', 'USD', 'GBP', 'CHF', 'CNY'];
            if (!SUPPORTED_CURRENCIES.includes(data.baseCurrency)) {
                throw new Error(`Unsupported currency: ${data.baseCurrency}. Supported: ${SUPPORTED_CURRENCIES.join(', ')}`);
            }
        }

        // Validate hex color format if provided
        const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
        if (data.primaryColor && !hexColorRegex.test(data.primaryColor)) {
            throw new Error('primaryColor must be a valid hex color (e.g. #5E8C8F)');
        }
        if (data.accentColor && !hexColorRegex.test(data.accentColor)) {
            throw new Error('accentColor must be a valid hex color (e.g. #E8F0F0)');
        }

        return this.prisma.organization.update({
            where: { id },
            data,
        });
    }

    async addLocation(organizationId: string, data: { name: string; address: string; isDefault?: boolean }) {
        // If setting as default, unset others
        if (data.isDefault) {
            await this.prisma.organizationLocation.updateMany({
                where: { organizationId },
                data: { isDefault: false },
            });
        }

        return this.prisma.organizationLocation.create({
            data: {
                organizationId,
                ...data,
            },
        });
    }

    async updateLocation(locationId: string, organizationId: string, data: { name?: string; address?: string; isDefault?: boolean }) {
        // verification ownership
        const loc = await this.prisma.organizationLocation.findFirst({
            where: { id: locationId, organizationId }
        });
        if (!loc) throw new NotFoundException('Location not found');

        if (data.isDefault) {
            await this.prisma.organizationLocation.updateMany({
                where: { organizationId },
                data: { isDefault: false },
            });
        }

        return this.prisma.organizationLocation.update({
            where: { id: locationId },
            data,
        });
    }

    async removeLocation(locationId: string, organizationId: string) {
        // verification ownership
        const loc = await this.prisma.organizationLocation.findFirst({
            where: { id: locationId, organizationId }
        });
        if (!loc) throw new NotFoundException('Location not found');

        return this.prisma.organizationLocation.delete({
            where: { id: locationId },
        });
    }

    async getOrganizationUsers(organizationId: string) {
        return this.prisma.user.findMany({
            where: { organizationId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                campaignAccess: true,
                jobTitle: true,
                isEmailVerified: true,
                createdAt: true,
            }
        });
    }

    async removeUserFromOrganization(organizationId: string, userId: string, requestingUserId: string) {
        // Can't remove yourself
        if (userId === requestingUserId) {
            throw new ForbiddenException('Cannot remove yourself from the organization');
        }

        const user = await this.prisma.user.findFirst({
            where: { id: userId, organizationId },
        });
        if (!user) throw new NotFoundException('User not found in this organization');

        // Requesting user must be ADMIN
        const requestingUser = await this.prisma.user.findUnique({ where: { id: requestingUserId } });
        if (requestingUser?.role !== 'ADMIN') {
            throw new ForbiddenException('Only admins can remove team members');
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: { organizationId: null },
        });
    }

    async addUserToOrganization(organizationId: string, data: { email: string; name?: string; role?: string; campaignAccess?: string }, requestingUserId?: string) {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email }
        });

        let result;
        if (existingUser) {
            result = await this.prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    organizationId,
                    role: data.role || 'USER',
                    campaignAccess: data.campaignAccess || 'own',
                }
            });
        } else {
            // Create new shadow user
            result = await this.prisma.user.create({
                data: {
                    email: data.email,
                    name: data.name,
                    organizationId,
                    role: data.role || 'USER',
                    campaignAccess: data.campaignAccess || 'own',
                }
            });
        }

        // Send invite email
        try {
            const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
            let inviterName = 'Zespół';
            let locale = 'pl';
            if (requestingUserId) {
                const inviter = await this.prisma.user.findUnique({ where: { id: requestingUserId }, select: { name: true, language: true } });
                if (inviter?.name) inviterName = inviter.name;
                if (inviter?.language) locale = inviter.language;
            }
            await this.emailService.sendTeamInvite(data.email, inviterName, org?.name || 'Procurea', locale);
        } catch (err) {
            this.logger.error(`Failed to send team invite email to ${data.email}:`, err);
        }

        return result;
    }

    async updateUserAccess(organizationId: string, userId: string, data: { role?: string; campaignAccess?: string }, requestingUserId: string) {
        const requestingUser = await this.prisma.user.findUnique({ where: { id: requestingUserId } });
        if (requestingUser?.role !== 'ADMIN') {
            throw new ForbiddenException('Only admins can modify team member permissions');
        }

        const user = await this.prisma.user.findFirst({
            where: { id: userId, organizationId },
        });
        if (!user) throw new NotFoundException('User not found in this organization');

        const updateData: any = {};
        if (data.role) updateData.role = data.role;
        if (data.campaignAccess) updateData.campaignAccess = data.campaignAccess;

        return this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                campaignAccess: true,
                jobTitle: true,
            },
        });
    }

    // --- Democratic Team: Sharing Preferences ---

    async getSharingPreferences(userId: string, organizationId: string) {
        // Get all org members except current user
        const orgUsers = await this.prisma.user.findMany({
            where: { organizationId, id: { not: userId } },
            select: { id: true, email: true, name: true, jobTitle: true },
        });

        // Get current user's preferences
        const myPreferences = await this.prisma.userSharingPreference.findMany({
            where: { fromUserId: userId },
        });

        // Get others' preferences towards current user
        const othersPreferences = await this.prisma.userSharingPreference.findMany({
            where: { toUserId: userId },
        });

        return orgUsers.map(member => ({
            ...member,
            iShareWithThem: myPreferences.find(p => p.toUserId === member.id)?.enabled ?? false,
            theyShareWithMe: othersPreferences.find(p => p.fromUserId === member.id)?.enabled ?? false,
        }));
    }

    async updateSharingPreference(fromUserId: string, toUserId: string, enabled: boolean) {
        return this.prisma.userSharingPreference.upsert({
            where: { fromUserId_toUserId: { fromUserId, toUserId } },
            update: { enabled },
            create: { fromUserId, toUserId, enabled },
        });
    }

    async leaveOrganization(userId: string, organizationId: string) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, organizationId },
        });
        if (!user) throw new NotFoundException('User not found in this organization');

        // Remove user from org
        await this.prisma.user.update({
            where: { id: userId },
            data: { organizationId: null },
        });

        // Delete all sharing preferences involving this user
        await this.prisma.userSharingPreference.deleteMany({
            where: {
                OR: [
                    { fromUserId: userId },
                    { toUserId: userId },
                ],
            },
        });

        this.logger.log(`User ${userId} left organization ${organizationId}`);
        return { success: true };
    }

    // --- Audit Log ---

    async getAuditLogs(requestingUserId: string, filters: AuditLogFilters) {
        // Look up requesting user to get their organization
        const requestingUser = await this.prisma.user.findUnique({
            where: { id: requestingUserId },
            select: { organizationId: true, role: true },
        });

        if (!requestingUser?.organizationId) {
            throw new ForbiddenException('You must belong to an organization to view audit logs');
        }
        if (requestingUser.role !== 'ADMIN') {
            throw new ForbiddenException('Only organization admins can view audit logs');
        }

        const organizationId = requestingUser.organizationId;
        const page = filters.page ?? 1;
        const pageSize = Math.min(filters.pageSize ?? 20, 100);
        const skip = (page - 1) * pageSize;

        // Get all user IDs in this organization
        const orgUsers = await this.prisma.user.findMany({
            where: { organizationId },
            select: { id: true },
        });
        const orgUserIds = orgUsers.map((u) => u.id);

        // Build where clause
        const where: any = {
            userId: { in: orgUserIds },
        };
        if (filters.entityType) {
            where.entityType = filters.entityType;
        }
        if (filters.userId && orgUserIds.includes(filters.userId)) {
            where.userId = filters.userId;
        }
        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
            if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
        }

        const [items, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return {
            data: items.map((log) => ({
                id: log.id,
                userId: log.userId,
                userName: log.user?.name || null,
                userEmail: log.user?.email || null,
                action: log.action,
                entityType: log.entityType,
                entityId: log.entityId,
                changes: log.changes ? JSON.parse(log.changes) : null,
                metadata: log.metadata ? JSON.parse(log.metadata) : null,
                createdAt: log.createdAt.toISOString(),
            })),
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
}
