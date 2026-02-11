import { PrismaService } from '../prisma/prisma.service';
import { ApiUsageService } from '../common/services/api-usage.service';
import { EmailService } from '../email/email.service';
export declare class AdminService {
    private readonly prisma;
    private readonly apiUsageService;
    private readonly emailService;
    private readonly logger;
    constructor(prisma: PrismaService, apiUsageService: ApiUsageService, emailService: EmailService);
    getDashboardStats(): Promise<{
        users: {
            total: number;
            active: number;
            blocked: number;
        };
        organizations: {
            total: number;
        };
        apiUsage: import("../common/services/api-usage.service").ApiUsageStats;
    }>;
    getUsers(options: {
        skip?: number;
        take?: number;
        search?: string;
        role?: string;
        isBlocked?: boolean;
        organizationId?: string;
    }): Promise<{
        users: {
            id: string;
            email: string;
            name: string | null;
            phone: string | null;
            role: string;
            isEmailVerified: boolean;
            isPhoneVerified: boolean;
            createdAt: Date;
            lastLoginAt: Date | null;
            isBlocked: boolean;
            blockedAt: Date | null;
            blockedReason: string | null;
            organization: {
                id: string;
                name: string;
                domain: string | null;
            } | null;
        }[];
        total: number;
    }>;
    getUserById(userId: string): Promise<{
        apiUsageStats: import("../common/services/api-usage.service").ApiUsageStats;
        organization: ({
            locations: {
                id: string;
                name: string;
                organizationId: string;
                createdAt: Date;
                updatedAt: Date;
                address: string;
                isDefault: boolean;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            domain: string | null;
            footerText: string | null;
        }) | null;
        _count: {
            ownedRfqs: number;
            auditLogs: number;
            aiInteractions: number;
            apiUsageLogs: number;
        };
        id: string;
        email: string;
        passwordHash: string | null;
        name: string | null;
        phone: string | null;
        role: string;
        ssoProvider: string | null;
        ssoId: string | null;
        pendingPhone: string | null;
        isEmailVerified: boolean;
        isPhoneVerified: boolean;
        phoneVerifiedAt: Date | null;
        twoFactorEnabled: boolean;
        onboardingCompleted: boolean;
        companyName: string | null;
        jobTitle: string | null;
        language: string;
        notificationPreferences: string | null;
        organizationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
        isBlocked: boolean;
        blockedAt: Date | null;
        blockedReason: string | null;
    }>;
    blockUser(userId: string, reason?: string): Promise<{
        id: string;
        email: string;
        passwordHash: string | null;
        name: string | null;
        phone: string | null;
        role: string;
        ssoProvider: string | null;
        ssoId: string | null;
        pendingPhone: string | null;
        isEmailVerified: boolean;
        isPhoneVerified: boolean;
        phoneVerifiedAt: Date | null;
        twoFactorEnabled: boolean;
        onboardingCompleted: boolean;
        companyName: string | null;
        jobTitle: string | null;
        language: string;
        notificationPreferences: string | null;
        organizationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
        isBlocked: boolean;
        blockedAt: Date | null;
        blockedReason: string | null;
    }>;
    unblockUser(userId: string): Promise<{
        id: string;
        email: string;
        passwordHash: string | null;
        name: string | null;
        phone: string | null;
        role: string;
        ssoProvider: string | null;
        ssoId: string | null;
        pendingPhone: string | null;
        isEmailVerified: boolean;
        isPhoneVerified: boolean;
        phoneVerifiedAt: Date | null;
        twoFactorEnabled: boolean;
        onboardingCompleted: boolean;
        companyName: string | null;
        jobTitle: string | null;
        language: string;
        notificationPreferences: string | null;
        organizationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
        isBlocked: boolean;
        blockedAt: Date | null;
        blockedReason: string | null;
    }>;
    initiatePasswordReset(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updateUserRole(userId: string, role: string): Promise<{
        id: string;
        email: string;
        passwordHash: string | null;
        name: string | null;
        phone: string | null;
        role: string;
        ssoProvider: string | null;
        ssoId: string | null;
        pendingPhone: string | null;
        isEmailVerified: boolean;
        isPhoneVerified: boolean;
        phoneVerifiedAt: Date | null;
        twoFactorEnabled: boolean;
        onboardingCompleted: boolean;
        companyName: string | null;
        jobTitle: string | null;
        language: string;
        notificationPreferences: string | null;
        organizationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
        isBlocked: boolean;
        blockedAt: Date | null;
        blockedReason: string | null;
    }>;
    getOrganizations(options: {
        skip?: number;
        take?: number;
        search?: string;
    }): Promise<{
        organizations: ({
            _count: {
                users: number;
                locations: number;
            };
            users: {
                id: string;
                email: string;
                name: string | null;
                role: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            domain: string | null;
            footerText: string | null;
        })[];
        total: number;
    }>;
    getOrganizationById(organizationId: string): Promise<{
        apiUsageSummary: {
            totalCalls: number;
            totalCost: number;
        };
        users: {
            id: string;
            email: string;
            name: string | null;
            role: string;
            createdAt: Date;
            lastLoginAt: Date | null;
            isBlocked: boolean;
        }[];
        locations: {
            id: string;
            name: string;
            organizationId: string;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            isDefault: boolean;
        }[];
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        domain: string | null;
        footerText: string | null;
    }>;
    getApiUsageStats(filters?: {
        startDate?: Date;
        endDate?: Date;
        service?: string;
        userId?: string;
    }): Promise<import("../common/services/api-usage.service").ApiUsageStats>;
    getApiUsageLogs(options: {
        skip?: number;
        take?: number;
        service?: string;
        status?: string;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        logs: ({
            user: {
                id: string;
                email: string;
                name: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            service: string;
            endpoint: string | null;
            requestPayload: string | null;
            status: string;
            errorMessage: string | null;
            tokensUsed: number | null;
            estimatedCost: number | null;
            responseTimeMs: number | null;
            userId: string | null;
        })[];
        total: number;
    }>;
    promoteToAdmin(userId: string, ip: string): Promise<{
        success: boolean;
        message: string;
        info: string;
        deviceData: {
            ip: string;
            timestamp: string;
        };
    }>;
}
