import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

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
    }) {
        // Validate currency code if provided
        if (data.baseCurrency) {
            const SUPPORTED_CURRENCIES = ['PLN', 'EUR', 'USD', 'GBP', 'CHF', 'CNY'];
            if (!SUPPORTED_CURRENCIES.includes(data.baseCurrency)) {
                throw new Error(`Unsupported currency: ${data.baseCurrency}. Supported: ${SUPPORTED_CURRENCIES.join(', ')}`);
            }
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
}
