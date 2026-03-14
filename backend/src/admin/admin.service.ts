import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiUsageService } from '../common/services/api-usage.service';
import { ErrorTrackingService } from '../common/services/error-tracking.service';
import { HealthService } from '../common/services/health.service';
import { AuthLogsService } from '../common/logger/auth-logs.service';
import { EmailService } from '../email/email.service';
import { TokensService } from '../auth/tokens.service';
import * as crypto from 'crypto';

// Hardcoded admin credentials for testing
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly apiUsageService: ApiUsageService,
        private readonly errorTrackingService: ErrorTrackingService,
        private readonly healthService: HealthService,
        private readonly authLogsService: AuthLogsService,
        private readonly emailService: EmailService,
        private readonly tokensService: TokensService,
    ) { }

    // =====================
    // Admin Authentication
    // =====================

    async adminLogin(username: string, password: string) {
        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
            throw new UnauthorizedException('Invalid admin credentials');
        }

        // Find or create the admin user in DB
        let adminUser = await this.prisma.user.findFirst({
            where: { role: 'ADMIN' },
        });

        if (!adminUser) {
            // Create a system admin user
            adminUser = await this.prisma.user.create({
                data: {
                    email: 'admin@procurea.pl',
                    name: 'System Admin',
                    role: 'ADMIN',
                    isEmailVerified: true,
                    onboardingCompleted: true,
                },
            });
            this.logger.log('System admin user created');
        }

        // Generate tokens
        const accessToken = this.tokensService.generateAccessToken(
            adminUser.id,
            adminUser.email,
            adminUser.role,
        );
        const refreshToken = await this.tokensService.generateRefreshToken(adminUser.id);

        return {
            accessToken,
            refreshToken,
            user: {
                id: adminUser.id,
                email: adminUser.email,
                name: adminUser.name,
                role: adminUser.role,
            },
        };
    }

    // =====================
    // User Impersonation
    // =====================

    async impersonateUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const accessToken = this.tokensService.generateAccessToken(
            user.id,
            user.email,
            user.role,
        );

        const refreshToken = await this.tokensService.generateRefreshToken(user.id);

        this.logger.log(`Admin impersonating user: ${user.email} (${user.id})`);

        return { accessToken, refreshToken };
    }

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
                    onboardingCompleted: true,
                    ssoProvider: true,
                    plan: true,
                    searchCredits: true,
                    stripeSubscriptionId: true,
                    subscriptionCancelAtPeriodEnd: true,
                    trialCreditsUsed: true,
                    organization: {
                        select: { id: true, name: true, domain: true, plan: true, searchCredits: true },
                    },
                    _count: {
                        select: { ownedRfqs: true },
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

    async getUserBilling(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                plan: true,
                searchCredits: true,
                stripeCustomerId: true,
                stripeSubscriptionId: true,
                subscriptionCancelAtPeriodEnd: true,
                trialCreditsUsed: true,
                organization: {
                    select: { id: true, name: true, plan: true, searchCredits: true, stripeSubscriptionId: true },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get user's campaigns via RfqRequest.ownerId
        const rfqs = await this.prisma.rfqRequest.findMany({
            where: { ownerId: userId },
            orderBy: { createdAt: 'desc' },
            take: 30,
            select: {
                id: true,
                createdAt: true,
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        createdAt: true,
                        _count: { select: { suppliers: true } },
                    },
                },
            },
        });

        const campaigns = rfqs
            .filter(r => r.campaign)
            .map(r => ({
                id: r.campaign!.id,
                name: r.campaign!.name,
                status: r.campaign!.status,
                createdAt: r.campaign!.createdAt,
                suppliersCount: r.campaign!._count.suppliers,
            }));

        const totalSearches = await this.prisma.rfqRequest.count({
            where: { ownerId: userId },
        });

        const monthlySearches = await this.prisma.rfqRequest.count({
            where: { ownerId: userId, createdAt: { gte: firstDayOfMonth } },
        });

        const totalSuppliersFound = campaigns.reduce((sum, c) => sum + c.suppliersCount, 0);

        // Credit transactions (personal)
        const creditTransactions = await this.prisma.creditTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return {
            user: {
                plan: user.plan,
                searchCredits: user.searchCredits,
                stripeCustomerId: user.stripeCustomerId,
                stripeSubscriptionId: user.stripeSubscriptionId,
                subscriptionCancelAtPeriodEnd: user.subscriptionCancelAtPeriodEnd,
                trialCreditsUsed: user.trialCreditsUsed,
            },
            orgCredits: user.organization?.searchCredits ?? null,
            orgPlan: user.organization?.plan ?? null,
            orgName: user.organization?.name ?? null,
            totalSearches,
            monthlySearches,
            totalSuppliersFound,
            creditTransactions,
            campaigns,
        };
    }

    async blockUser(userId: string, reason?: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        if (user.role === 'ADMIN') {
            throw new BadRequestException('Cannot block admin users');
        }

        const [updatedUser] = await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: userId },
                data: {
                    isBlocked: true,
                    blockedAt: new Date(),
                    blockedReason: reason,
                },
            }),
            // Revoke all active refresh tokens to invalidate existing sessions
            this.prisma.refreshToken.updateMany({
                where: { userId, revoked: false },
                data: { revoked: true, revokedAt: new Date() },
            }),
        ]);

        this.logger.log(`User blocked: ${user.email} (${userId}), reason: ${reason || 'none'}`);
        return updatedUser;
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

    async deleteUser(userId: string, requestingUserId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, role: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (userId === requestingUserId) {
            throw new BadRequestException('Cannot delete your own account');
        }

        await this.prisma.$transaction(async (tx) => {
            // 1. Delete AuditLogs (userId NOT NULL, no cascade)
            await tx.auditLog.deleteMany({ where: { userId } });

            // 2. Set null on nullable relations (no cascade defined)
            await tx.aiInteraction.updateMany({
                where: { userId },
                data: { userId: null },
            });
            await tx.apiUsageLog.updateMany({
                where: { userId },
                data: { userId: null },
            });
            await tx.rfqRequest.updateMany({
                where: { ownerId: userId },
                data: { ownerId: null },
            });

            // 3. Delete the User record
            // Cascades handle: RefreshToken, CreditTransaction, UserSharingPreference
            await tx.user.delete({ where: { id: userId } });
        });

        this.logger.log(`User deleted: ${user.email} (${userId})`);

        return { success: true, message: `User ${user.email} has been deleted` };
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
    // Error Logs
    // =====================

    async getErrorLogs(category?: string, limit: number = 50) {
        if (category === 'auth') {
            // Get auth-specific error logs from in-memory auth log service
            const authLogs = this.authLogsService.getRecentLogs(limit, {});
            const authErrors = authLogs.filter(log => !log.success);
            return {
                category: 'auth',
                total: authErrors.length,
                logs: authErrors,
            };
        }

        if (category === 'sourcing') {
            // Get sourcing/API error logs from the DATABASE (ApiUsageLog where status='error')
            const dbErrors = await this.prisma.apiUsageLog.findMany({
                where: {
                    status: 'error',
                    service: { in: ['gemini', 'serper'] },
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                include: {
                    user: { select: { id: true, email: true, name: true } },
                },
            });

            // Also merge any in-memory errors from ErrorTrackingService
            const inMemoryErrors = this.errorTrackingService.getRecentErrors(limit);

            return {
                category: 'sourcing',
                total: dbErrors.length + inMemoryErrors.length,
                dbErrors: dbErrors.map(e => ({
                    id: e.id,
                    timestamp: e.createdAt,
                    service: e.service,
                    endpoint: e.endpoint,
                    errorMessage: e.errorMessage,
                    requestPayload: e.requestPayload,
                    responseTimeMs: e.responseTimeMs,
                    tokensUsed: e.tokensUsed,
                    user: e.user,
                })),
                systemErrors: inMemoryErrors,
            };
        }

        // Return all errors combined
        const authLogs = this.authLogsService.getRecentLogs(limit, {});
        const authErrors = authLogs.filter(log => !log.success);

        // Get API errors from the database 
        const dbErrors = await this.prisma.apiUsageLog.findMany({
            where: { status: 'error' },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: { select: { id: true, email: true, name: true } },
            },
        });

        const inMemoryErrors = this.errorTrackingService.getRecentErrors(limit);

        // Get per-service error counts from DB
        const errorsByService = await this.prisma.apiUsageLog.groupBy({
            by: ['service'],
            where: { status: 'error' },
            _count: { id: true },
        });

        const serviceErrorMap: Record<string, number> = {};
        for (const entry of errorsByService) {
            serviceErrorMap[entry.service] = entry._count.id;
        }

        return {
            category: 'all',
            auth: {
                total: authErrors.length,
                logs: authErrors.slice(0, 20),
            },
            sourcing: {
                total: dbErrors.length + inMemoryErrors.length,
                dbErrors: dbErrors.map(e => ({
                    id: e.id,
                    timestamp: e.createdAt,
                    service: e.service,
                    endpoint: e.endpoint,
                    errorMessage: e.errorMessage,
                    requestPayload: e.requestPayload,
                    responseTimeMs: e.responseTimeMs,
                    tokensUsed: e.tokensUsed,
                    user: e.user,
                })),
                systemErrors: inMemoryErrors.slice(0, 20),
            },
            stats: {
                ...this.errorTrackingService.getStats(),
                dbErrorsByService: serviceErrorMap,
                totalDbErrors: dbErrors.length,
            },
        };
    }

    // =====================
    // Integrations Status
    // =====================

    async getIntegrationStatus(deepCheck: boolean = false) {
        const health = await this.healthService.getSystemHealth(deepCheck ? 'deep' : 'shallow');

        // Add email/resend status
        const resendKey = process.env.RESEND_API_KEY;
        const firebaseConfigured = !!process.env.FIREBASE_PROJECT_ID || !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

        return {
            overall: health.status,
            timestamp: health.timestamp,
            version: health.version,
            environment: health.environment,
            services: {
                gemini: {
                    ...health.services.gemini,
                    apiKey: process.env.GEMINI_API_KEY ? '***' + process.env.GEMINI_API_KEY.slice(-4) : 'NOT SET',
                },
                serper: {
                    ...health.services.serper,
                    provider: 'serper',
                    apiKey: process.env.SERPER_API_KEY ? '***' + process.env.SERPER_API_KEY.slice(-4) : 'NOT SET',
                },
                database: health.services.database,
                email: {
                    status: resendKey ? 'healthy' : 'degraded',
                    lastCheck: new Date(),
                    message: resendKey ? 'Resend API configured' : 'Email not configured (RESEND_API_KEY missing)',
                    apiKey: resendKey ? '***' + resendKey.slice(-4) : 'NOT SET',
                },
                firebase: {
                    status: firebaseConfigured ? 'healthy' : 'degraded',
                    lastCheck: new Date(),
                    message: firebaseConfigured ? 'Firebase configured' : 'Firebase not configured',
                },
            },
            recentErrors: health.recentErrors,
        };
    }

    // =====================
    // Cost Tracking
    // =====================

    async getCostSummary(startDate?: Date, endDate?: Date) {
        const stats = await this.apiUsageService.getUsageStats({
            startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate,
        });

        // Get per-user cost breakdown
        const usersWithCosts = await this.prisma.apiUsageLog.groupBy({
            by: ['userId'],
            _sum: { estimatedCost: true },
            _count: { id: true },
            where: {
                createdAt: {
                    gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    ...(endDate ? { lte: endDate } : {}),
                },
            },
            orderBy: { _sum: { estimatedCost: 'desc' } },
            take: 20,
        });

        // Enrich with user details
        const userIds = usersWithCosts.map(u => u.userId).filter(Boolean) as string[];
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, email: true, name: true },
        });

        const userMap = new Map(users.map(u => [u.id, u]));

        const perUserCosts = usersWithCosts.map(entry => ({
            userId: entry.userId,
            email: entry.userId ? userMap.get(entry.userId)?.email : 'system',
            name: entry.userId ? userMap.get(entry.userId)?.name : 'System',
            totalCost: entry._sum.estimatedCost || 0,
            totalCalls: entry._count.id,
        }));

        return {
            ...stats,
            perUserCosts,
        };
    }

    async getSourcingCostPerRequest() {
        // Get all sourcing-related API calls (gemini + serper combined)
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const sourcingCalls = await this.prisma.apiUsageLog.findMany({
            where: {
                service: { in: ['gemini', 'serper'] },
                status: 'success',
                createdAt: { gte: last30Days },
            },
            select: {
                service: true,
                estimatedCost: true,
                tokensUsed: true,
                responseTimeMs: true,
            },
        });

        const totalCost = sourcingCalls.reduce((sum, c) => sum + (c.estimatedCost || 0), 0);
        const totalCalls = sourcingCalls.length;
        const avgCostPerCall = totalCalls > 0 ? totalCost / totalCalls : 0;

        // Break down by service
        const byService: Record<string, { calls: number; cost: number; avgCost: number }> = {};
        for (const call of sourcingCalls) {
            if (!byService[call.service]) {
                byService[call.service] = { calls: 0, cost: 0, avgCost: 0 };
            }
            byService[call.service].calls++;
            byService[call.service].cost += call.estimatedCost || 0;
        }
        for (const svc of Object.values(byService)) {
            svc.avgCost = svc.calls > 0 ? svc.cost / svc.calls : 0;
        }

        // Estimate sourcing pipeline cost (typically: multiple Serper + multiple Gemini per pipeline)
        // A single sourcing request roughly uses: 5-15 search queries + 10-20 Gemini calls
        const avgSerpCost = byService['serper']?.avgCost || 0;
        const avgGeminiCost = byService['gemini']?.avgCost || 0;
        const estimatedPipelineCost = (avgSerpCost * 10) + (avgGeminiCost * 15);

        return {
            period: 'last_30_days',
            totalCost,
            totalCalls,
            avgCostPerApiCall: avgCostPerCall,
            estimatedCostPerSourcingRequest: estimatedPipelineCost,
            byService,
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
