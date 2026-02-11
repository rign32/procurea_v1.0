import { OrganizationService } from './organization.service';
export declare class OrganizationController {
    private readonly organizationService;
    constructor(organizationService: OrganizationService);
    getOrganization(id: string): Promise<{
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
    }>;
    updateOrganization(id: string, body: {
        name?: string;
        footerText?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        domain: string | null;
        footerText: string | null;
    }>;
    getOrganizationUsers(id: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: string;
        isEmailVerified: boolean;
        jobTitle: string | null;
        createdAt: Date;
    }[]>;
    addUserToOrganization(id: string, body: {
        email: string;
        name?: string;
        role?: string;
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
    addLocation(id: string, body: {
        name: string;
        address: string;
        isDefault?: boolean;
    }): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        isDefault: boolean;
    }>;
    updateLocation(orgId: string, locId: string, body: {
        name?: string;
        address?: string;
        isDefault?: boolean;
    }): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        isDefault: boolean;
    }>;
    removeLocation(orgId: string, locId: string): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        isDefault: boolean;
    }>;
}
