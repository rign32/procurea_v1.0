import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthLogsService } from '../common/logger/auth-logs.service';
import { TokensService } from './tokens.service';
import type { Response } from 'express';
export declare class AuthController {
    private readonly authService;
    private readonly jwtService;
    private readonly authLogsService;
    private readonly tokensService;
    constructor(authService: AuthService, jwtService: JwtService, authLogsService: AuthLogsService, tokensService: TokensService);
    googleAuth(): Promise<void>;
    googleAuthCallback(req: any, res: Response): Promise<void>;
    exchangeToken(res: Response, req: any): Promise<{
        success: boolean;
        message: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: string;
            companyName: string | null;
            jobTitle: string | null;
            phone: string | null;
            organizationId: string | null;
            onboardingCompleted: boolean;
            isPhoneVerified: boolean;
        };
    }>;
    refreshToken(res: Response, req: any): Promise<{
        success: boolean;
        message: string;
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(req: any): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: string;
        companyName: string | null;
        jobTitle: string | null;
        isPhoneVerified: boolean;
        phone: string | null;
        onboardingCompleted: boolean;
        organizationId: string | null;
    }>;
    microsoftAuth(): Promise<void>;
    microsoftAuthCallback(req: any, res: Response): Promise<void>;
    logout(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    cancelRegistration(body: {
        userId: string;
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    ssoLogin(body: {
        email: string;
        provider: string;
        ssoId?: string;
        name?: string;
    }): Promise<any>;
    emailLogin(body: {
        email: string;
    }): Promise<{
        message: string;
        userId: any;
    }>;
    emailVerify(body: {
        email: string;
        code: string;
    }, res: Response): Promise<{
        success: boolean;
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            companyName: any;
            jobTitle: any;
            phone: any;
            organizationId: any;
            onboardingCompleted: any;
            isPhoneVerified: any;
        };
    }>;
    firebaseLogin(req: any, res: Response): Promise<any>;
    sendPhoneOtp(body: {
        userId: string;
        phone: string;
    }): Promise<{
        message: string;
    }>;
    verifyPhoneOtp(body: {
        userId: string;
        phone: string;
        code: string;
    }, res: Response): Promise<{
        token: undefined;
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
    completeOnboarding(body: {
        userId: string;
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
    }, res: Response): Promise<{
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
    remindAccount(body: {
        phone: string;
    }): Promise<{
        message: string;
    }>;
    updatePreferences(req: any, body: {
        preferences: any[];
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
    deleteAllUsers(body: {
        confirm: string;
    }): Promise<{
        success: boolean;
        count: number;
        message: string;
    }>;
}
