import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationService {
    constructor(private prisma: PrismaService) { }

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

    async updateOrganization(id: string, data: { name?: string; footerText?: string }) {
        return this.prisma.organization.update({
            where: { id },
            data: {
                name: data.name,
                footerText: data.footerText
            },
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
                jobTitle: true,
                isEmailVerified: true,
                createdAt: true,
            }
        });
    }

    async addUserToOrganization(organizationId: string, data: { email: string; name?: string; role?: string }) {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            return this.prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    organizationId,
                    role: data.role || 'USER',
                }
            });
        }

        // Create new shadow user
        return this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                organizationId,
                role: data.role || 'USER',
            }
        });
    }
}
