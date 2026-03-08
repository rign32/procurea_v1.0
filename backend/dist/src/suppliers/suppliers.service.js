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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SuppliersService = class SuppliersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = { deletedAt: null };
        if (filters?.country) {
            where.country = filters.country;
        }
        if (filters?.minScore !== undefined) {
            where.analysisScore = { gte: filters.minScore };
        }
        if (filters?.hasEmail) {
            where.contactEmails = { not: null };
        }
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { specialization: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (filters?.campaignId) {
            where.campaignId = filters.campaignId;
        }
        const suppliers = await this.prisma.supplier.findMany({
            where,
            include: {
                campaign: true,
                offers: true,
                contacts: true,
            },
            orderBy: { name: 'asc' },
        });
        return { suppliers, total: suppliers.length };
    }
    async findOne(id) {
        return this.prisma.supplier.findUnique({
            where: { id },
            include: {
                campaign: true,
                offers: true,
                contacts: true,
                documentChunks: true,
            },
        });
    }
    async update(id, data) {
        return this.prisma.supplier.update({
            where: { id },
            data,
        });
    }
    async exclude(id, reason) {
        return this.prisma.supplier.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                analysisReason: reason || 'Wykluczony przez użytkownika',
            },
        });
    }
    async verify(id) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            select: { registryId: true },
        });
        if (supplier?.registryId) {
            await this.prisma.companyRegistry.update({
                where: { id: supplier.registryId },
                data: { isVerified: true },
            });
        }
        return { success: true };
    }
    async blacklist(id, reason) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            select: { registryId: true },
        });
        if (supplier?.registryId) {
            await this.prisma.companyRegistry.update({
                where: { id: supplier.registryId },
                data: {
                    isBlacklisted: true,
                    blacklistReason: reason || 'Zablokowany przez użytkownika',
                },
            });
        }
        return { success: true };
    }
    async exportCSV(filters) {
        const { suppliers } = await this.findAll(filters);
        const header = 'Name,Country,City,Website,ContactEmails,Score,Specialization,Certificates';
        const rows = suppliers.map((s) => {
            const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
            return [
                esc(s.name), esc(s.country), esc(s.city), esc(s.website),
                esc(s.contactEmails), esc(s.analysisScore), esc(s.specialization), esc(s.certificates),
            ].join(',');
        });
        return [header, ...rows].join('\n');
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map