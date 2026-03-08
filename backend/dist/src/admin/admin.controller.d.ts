import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getDashboard(): Promise<{
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
    getUsers(skip?: string, take?: string, search?: string, role?: string, isBlocked?: string, organizationId?: string): Promise<{
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
    getUserById(id: string): Promise<{
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
            footerEnabled: boolean;
            footerFirstName: string | null;
            footerLastName: string | null;
            footerCompany: string | null;
            footerPosition: string | null;
            footerEmail: string | null;
            footerPhone: string | null;
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
    blockUser(id: string, body: {
        reason?: string;
    }): Promise<{
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
    unblockUser(id: string): Promise<{
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
    initiatePasswordReset(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updateUserRole(id: string, body: {
        role: string;
    }): Promise<{
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
    getOrganizations(skip?: string, take?: string, search?: string): Promise<{
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
            footerEnabled: boolean;
            footerFirstName: string | null;
            footerLastName: string | null;
            footerCompany: string | null;
            footerPosition: string | null;
            footerEmail: string | null;
            footerPhone: string | null;
        })[];
        total: number;
    }>;
    getOrganizationById(id: string): Promise<{
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
        footerEnabled: boolean;
        footerFirstName: string | null;
        footerLastName: string | null;
        footerCompany: string | null;
        footerPosition: string | null;
        footerEmail: string | null;
        footerPhone: string | null;
    }>;
    getApiUsageStats(startDate?: string, endDate?: string, service?: string, userId?: string): Promise<import("../common/services/api-usage.service").ApiUsageStats>;
    getApiUsageLogs(skip?: string, take?: string, service?: string, status?: string, userId?: string, startDate?: string, endDate?: string): Promise<{
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
}
