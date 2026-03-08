import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from './sms.service';
import { EmailService } from '../email/email.service';
import { RedisService } from './redis.service';
export declare class AuthService {
    private prisma;
    private smsService;
    private emailService;
    private configService;
    private redisService;
    private exchangeTokens;
    constructor(prisma: PrismaService, smsService: SmsService, emailService: EmailService, configService: ConfigService, redisService: RedisService);
    generateExchangeToken(userId: string): Promise<string>;
    consumeExchangeToken(exchangeToken: string): Promise<string | null>;
    private cleanupExpiredTokens;
    private mockSendEmail;
    getUserById(userId: string): Promise<({
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
    } & {
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
    }) | null>;
    validateUserByProvider(email: string, provider: string, ssoId?: string, name?: string): Promise<{
        user: any;
        isNewUser: boolean;
    }>;
    startEmailLogin(email: string): Promise<{
        message: string;
        userId: any;
    }>;
    verifyEmailCode(email: string, code: string): Promise<any>;
    initiatePhoneVerification(userId: string, phone: string): Promise<{
        message: string;
    }>;
    verifyPhone(userId: string, phone: string, code: string): Promise<{
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
    completeOnboarding(userId: string, data: {
        firstName?: string;
        lastName?: string;
        companyName: string;
        jobTitle?: string;
        language?: string;
        locations?: {
            name: string;
            address: string;
        }[];
        invites?: {
            email: string;
        }[];
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
    sendAccountReminder(phone: string): Promise<{
        message: string;
    }>;
    updatePreferences(userId: string, preferences: any[]): Promise<{
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
    cancelRegistration(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private maskEmail;
    updateProfile(userId: string, data: {
        name?: string;
        phone?: string;
        jobTitle?: string;
        companyName?: string;
    }): Promise<{
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
    } & {
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
    deleteAllUsers(): Promise<{
        success: boolean;
        count: number;
        message: string;
    }>;
}
