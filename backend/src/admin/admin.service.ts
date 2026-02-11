import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiUsageService } from '../common/services/api-usage.service';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly apiUsageService: ApiUsageService,
        private readonly emailService: EmailService,
    ) { }

    // =====================
    // Dashboard
    // =====================

    async getDashboardStats() {
        const [
            totalUsers,
            activeUsers,
            blockedUsers,
            totalOrganizations,
            apiStats,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { isBlocked: false } }),
            this.prisma.user.count({ where: { isBlocked: true } }),
            this.prisma.organization.count(),
            this.apiUsageService.getUsageStats({
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
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

    // =====================
    // User Management
    // =====================

    async getUsers(options: {
        skip?: number;
        take?: number;
        search?: string;
        role?: string;
        isBlocked?: boolean;
        organizationId?: string;
    }) {
        const where: any = {};

        if (options.search) {
            where.OR = [
                { email: { contains: options.search, mode: 'insensitive' } },
                { name: { contains: options.search, mode: 'insensitive' } },
            ];
        }
        if (options.role) where.role = options.role;
        if (options.isBlocked !== undefined) where.isBlocked = options.isBlocked;
        if (options.organizationId) where.organizationId = options.organizationId;

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

    async getUserById(userId: string) {
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
            throw new NotFoundException('User not found');
        }

        // Get API usage stats for this user
        const apiStats = await this.apiUsageService.getUsageStats({ userId });

        return {
            ...user,
            apiUsageStats: apiStats,
        };
    }

    async blockUser(userId: string, reason?: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        if (user.role === 'ADMIN') {
            throw new BadRequestException('Cannot block admin users');
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

    async unblockUser(userId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                isBlocked: false,
                blockedAt: null,
                blockedReason: null,
            },
        });
    }

    async initiatePasswordReset(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await this.prisma.verificationToken.create({
            data: {
                identifier: user.email,
                token: resetToken,
                type: 'RESET_PASSWORD',
                expires,
            },
        });

        // Send email (simplified - in production use proper template)
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
        } catch (e) {
            this.logger.error(`Failed to send reset email: ${e.message}`);
        }

        return { success: true, message: 'Password reset email sent' };
    }

    async updateUserRole(userId: string, role: string) {
        const validRoles = ['USER', 'MANAGER', 'ADMIN'];
        if (!validRoles.includes(role)) {
            throw new BadRequestException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: { role },
        });
    }

    // =====================
    // Organization Management
    // =====================

    async getOrganizations(options: {
        skip?: number;
        take?: number;
        search?: string;
    }) {
        const where: any = {};

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

    async getOrganizationById(organizationId: string) {
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
            throw new NotFoundException('Organization not found');
        }

        // Get aggregated API usage for all users in this organization
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

    // =====================
    // API Usage
    // =====================

    async getApiUsageStats(filters?: {
        startDate?: Date;
        endDate?: Date;
        service?: string;
        userId?: string;
    }) {
        return this.apiUsageService.getUsageStats(filters);
    }

    async getApiUsageLogs(options: {
        skip?: number;
        take?: number;
        service?: string;
        status?: string;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
    }) {
        return this.apiUsageService.getUsageLogs(options);
    }

    async promoteToAdmin(userId: string, ip: string) {
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
}
