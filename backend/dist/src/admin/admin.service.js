"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const api_usage_service_1 = require("../common/services/api-usage.service");
const email_service_1 = require("../email/email.service");
const crypto = __importStar(require("crypto"));
let AdminService = AdminService_1 = class AdminService {
    prisma;
    apiUsageService;
    emailService;
    logger = new common_1.Logger(AdminService_1.name);
    constructor(prisma, apiUsageService, emailService) {
        this.prisma = prisma;
        this.apiUsageService = apiUsageService;
        this.emailService = emailService;
    }
    async getDashboardStats() {
        const [totalUsers, activeUsers, blockedUsers, totalOrganizations, apiStats,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { isBlocked: false } }),
            this.prisma.user.count({ where: { isBlocked: true } }),
            this.prisma.organization.count(),
            this.apiUsageService.getUsageStats({
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            }),
        ]);
        return {
            users: {
                total: totalUsers,
                active: activeUsers,
                blocked: blockedUsers,
            },
            organizations: {
                total: totalOrganizations,
            },
            apiUsage: apiStats,
        };
    }
    async getUsers(options) {
        const where = {};
        if (options.search) {
            where.OR = [
                { email: { contains: options.search, mode: 'insensitive' } },
                { name: { contains: options.search, mode: 'insensitive' } },
            ];
        }
        if (options.role)
            where.role = options.role;
        if (options.isBlocked !== undefined)
            where.isBlocked = options.isBlocked;
        if (options.organizationId)
            where.organizationId = options.organizationId;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip: options.skip || 0,
                take: options.take || 50,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    phone: true,
                    isEmailVerified: true,
                    isPhoneVerified: true,
                    isBlocked: true,
                    blockedAt: true,
                    blockedReason: true,
                    createdAt: true,
                    lastLoginAt: true,
                    organization: {
                        select: { id: true, name: true, domain: true },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return { users, total };
    }
    async getUserById(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                organization: {
                    include: { locations: true },
                },
                _count: {
                    select: {
                        ownedRfqs: true,
                        auditLogs: true,
                        aiInteractions: true,
                        apiUsageLogs: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const apiStats = await this.apiUsageService.getUsageStats({ userId });
        return {
            ...user,
            apiUsageStats: apiStats,
        };
    }
    async blockUser(userId, reason) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.role === 'ADMIN') {
            throw new common_1.BadRequestException('Cannot block admin users');
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isBlocked: true,
                blockedAt: new Date(),
                blockedReason: reason,
            },
        });
    }
    async unblockUser(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isBlocked: false,
                blockedAt: null,
                blockedReason: null,
            },
        });
    }
    async initiatePasswordReset(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.prisma.verificationToken.create({
            data: {
                identifier: user.email,
                token: resetToken,
                type: 'RESET_PASSWORD',
                expires,
            },
        });
        try {
            await this.emailService.sendEmail({
                to: user.email,
                subject: 'Password Reset - Procurea',
                html: `
                    <p>Ktoś zainicjował reset Twojego hasła.</p>
                    <p>Token resetowania: <strong>${resetToken}</strong></p>
                    <p>Token wygasa za 24 godziny.</p>
                `,
            });
            this.logger.log(`Password reset initiated for user: ${user.email}`);
        }
        catch (e) {
            this.logger.error(`Failed to send reset email: ${e.message}`);
        }
        return { success: true, message: 'Password reset email sent' };
    }
    async updateUserRole(userId, role) {
        const validRoles = ['USER', 'MANAGER', 'ADMIN'];
        if (!validRoles.includes(role)) {
            throw new common_1.BadRequestException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: { role },
        });
    }
    async getOrganizations(options) {
        const where = {};
        if (options.search) {
            where.OR = [
                { name: { contains: options.search, mode: 'insensitive' } },
                { domain: { contains: options.search, mode: 'insensitive' } },
            ];
        }
        const [organizations, total] = await Promise.all([
            this.prisma.organization.findMany({
                where,
                skip: options.skip || 0,
                take: options.take || 50,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { users: true, locations: true },
                    },
                    users: {
                        take: 5,
                        select: { id: true, email: true, name: true, role: true },
                    },
                },
            }),
            this.prisma.organization.count({ where }),
        ]);
        return { organizations, total };
    }
    async getOrganizationById(organizationId) {
        const organization = await this.prisma.organization.findUnique({
            where: { id: organizationId },
            include: {
                locations: true,
                users: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        isBlocked: true,
                        createdAt: true,
                        lastLoginAt: true,
                    },
                },
            },
        });
        if (!organization) {
            throw new common_1.NotFoundException('Organization not found');
        }
        const userIds = organization.users.map(u => u.id);
        const apiUsageLogs = await this.prisma.apiUsageLog.findMany({
            where: { userId: { in: userIds } },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        const totalCost = apiUsageLogs.reduce((sum, l) => sum + (l.estimatedCost || 0), 0);
        const totalCalls = apiUsageLogs.length;
        return {
            ...organization,
            apiUsageSummary: {
                totalCalls,
                totalCost,
            },
        };
    }
    async getApiUsageStats(filters) {
        return this.apiUsageService.getUsageStats(filters);
    }
    async getApiUsageLogs(options) {
        return this.apiUsageService.getUsageLogs(options);
    }
    async promoteToAdmin(userId, ip) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                role: 'ADMIN',
                isBlocked: false
            }
        });
        this.logger.log(`User ${userId} promoted to ADMIN from IP: ${ip}`);
        return {
            success: true,
            message: 'Konto zostało pomyślnie podniesione do uprawnień ADMINISTRATORA.',
            info: `Zidentyfikowano IP urządzenia: ${ip}. Możesz teraz korzystać z panelu /admin.`,
            deviceData: {
                ip,
                timestamp: new Date().toISOString()
            }
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        api_usage_service_1.ApiUsageService,
        email_service_1.EmailService])
], AdminService);
//# sourceMappingURL=admin.service.js.map