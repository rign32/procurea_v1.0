"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrganizationService = class OrganizationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrganization(id) {
        const organization = await this.prisma.organization.findUnique({
            where: { id },
            include: { locations: true },
        });
        if (!organization) {
            throw new common_1.NotFoundException(`Organization with ID ${id} not found`);
        }
        return organization;
    }
    async updateOrganization(id, data) {
        return this.prisma.organization.update({
            where: { id },
            data,
        });
    }
    async addLocation(organizationId, data) {
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
    async updateLocation(locationId, organizationId, data) {
        const loc = await this.prisma.organizationLocation.findFirst({
            where: { id: locationId, organizationId }
        });
        if (!loc)
            throw new common_1.NotFoundException('Location not found');
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
    async removeLocation(locationId, organizationId) {
        const loc = await this.prisma.organizationLocation.findFirst({
            where: { id: locationId, organizationId }
        });
        if (!loc)
            throw new common_1.NotFoundException('Location not found');
        return this.prisma.organizationLocation.delete({
            where: { id: locationId },
        });
    }
    async getOrganizationUsers(organizationId) {
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
    async addUserToOrganization(organizationId, data) {
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
        return this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                organizationId,
                role: data.role || 'USER',
            }
        });
    }
};
exports.OrganizationService = OrganizationService;
exports.OrganizationService = OrganizationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizationService);
//# sourceMappingURL=organization.service.js.map