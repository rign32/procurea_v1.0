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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const google_auth_guard_1 = require("./guards/google-auth.guard");
const microsoft_auth_guard_1 = require("./guards/microsoft-auth.guard");
const auth_service_1 = require("./auth.service");
const jwt_1 = require("@nestjs/jwt");
const auth_logs_service_1 = require("../common/logger/auth-logs.service");
const tokens_service_1 = require("./tokens.service");
const isProductionEnvironment = () => {
    const functionTarget = !!process.env.FUNCTION_TARGET;
    const kService = !!process.env.K_SERVICE;
    const frontendUrl = process.env.FRONTEND_URL || '';
    const nodeEnv = process.env.NODE_ENV;
    const isProduction = functionTarget || kService || frontendUrl.includes('procurea.pl') || nodeEnv === 'production';
    console.log('[isProductionEnvironment] Diagnostics:');
    console.log('  - FUNCTION_TARGET:', functionTarget, `(${process.env.FUNCTION_TARGET || 'undefined'})`);
    console.log('  - K_SERVICE:', kService, `(${process.env.K_SERVICE || 'undefined'})`);
    console.log('  - FRONTEND_URL:', frontendUrl);
    console.log('  - NODE_ENV:', nodeEnv || 'undefined');
    console.log('  - Result:', isProduction ? '✅ PRODUCTION' : '❌ DEVELOPMENT');
    return isProduction;
};
const getCookieOptions = (isProduction) => ({
    httpOnly: true,
    secure: isProduction,
    domain: isProduction ? '.procurea.pl' : undefined,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    partitioned: false
});
let AuthController = class AuthController {
    authService;
    jwtService;
    authLogsService;
    tokensService;
    constructor(authService, jwtService, authLogsService, tokensService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.authLogsService = authLogsService;
        this.tokensService = tokensService;
    }
    async googleAuth() {
    }
    async googleAuthCallback(req, res) {
        const requestId = req.requestId || 'unknown';
        const oauthUser = req.user;
        const isProduction = isProductionEnvironment();
        const authMode = req.cookies?.procurea_auth_mode || 'login';
        const origin = req.cookies?.procurea_auth_origin || req.query?.origin || 'app';
        console.log('[BACKEND] Google callback - authMode from cookie:', authMode, 'origin:', origin);
        const isProd = isProductionEnvironment();
        res.clearCookie('procurea_auth_mode', {
            path: '/',
            domain: isProd ? '.procurea.pl' : undefined
        });
        res.clearCookie('procurea_auth_origin', {
            path: '/',
            domain: isProd ? '.procurea.pl' : undefined
        });
        await this.authLogsService.logAuthEvent({
            requestId,
            action: 'oauth_callback_start',
            provider: 'google',
            email: oauthUser.email,
            success: true,
            metadata: {
                providerId: oauthUser.providerId,
                name: oauthUser.name,
                authMode
            }
        });
        try {
            const { user, isNewUser } = await this.authService.validateUserByProvider(oauthUser.email, oauthUser.provider, oauthUser.providerId, oauthUser.name);
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'user_validated',
                provider: 'google',
                userId: user.id,
                email: user.email,
                success: true,
                metadata: { isNewUser, onboardingCompleted: user.onboardingCompleted }
            });
            const exchangeToken = await this.authService.generateExchangeToken(user.id);
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'exchange_token_generated',
                provider: 'google',
                userId: user.id,
                email: user.email,
                success: true,
                metadata: { tokenLength: exchangeToken.length }
            });
            const isProduction = isProductionEnvironment();
            res.cookie('procurea_exchange', exchangeToken, {
                httpOnly: true,
                secure: isProduction,
                domain: isProduction ? '.procurea.pl' : undefined,
                path: '/',
                maxAge: 30000,
                sameSite: 'lax',
                partitioned: false,
            });
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'exchange_cookie_set',
                provider: 'google',
                userId: user.id,
                email: user.email,
                success: true,
                metadata: { isProduction }
            });
            let frontendUrl;
            if (origin === 'admin') {
                frontendUrl = process.env.ADMIN_URL || 'https://admin.procurea.pl';
            }
            else {
                frontendUrl = process.env.FRONTEND_URL || 'https://app.procurea.pl';
            }
            const redirectUrl = `${frontendUrl}/auth/callback?userId=${user.id}&needsPhone=${!user.isPhoneVerified}&onboardingCompleted=${user.onboardingCompleted}&isNewUser=${isNewUser}&authMode=${authMode}`;
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'redirect_to_frontend',
                provider: 'google',
                userId: user.id,
                email: user.email,
                success: true,
                metadata: {
                    redirectUrl,
                    needsPhone: !user.isPhoneVerified,
                    onboardingCompleted: user.onboardingCompleted,
                    isNewUser
                }
            });
            console.log('[BACKEND] OAuth callback redirect URL (secure, no JWT in URL):', redirectUrl);
            console.log('[BACKEND] User data:', { id: user.id, email: user.email, onboardingCompleted: user.onboardingCompleted, isPhoneVerified: user.isPhoneVerified });
            console.log('[BACKEND] Exchange token set in httpOnly cookie (frontend will exchange for access token)');
            console.log('[BACKEND] Request ID:', requestId);
            return res.redirect(redirectUrl);
        }
        catch (error) {
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'oauth_callback_error',
                provider: 'google',
                email: oauthUser.email,
                success: false,
                errorMessage: error.message,
                metadata: { stack: error.stack }
            });
            throw error;
        }
    }
    async exchangeToken(res, req) {
        const requestId = req.requestId || 'unknown';
        const exchangeToken = req.cookies?.procurea_exchange;
        if (!exchangeToken) {
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'exchange_token_missing',
                success: false,
                errorMessage: 'Exchange token missing in cookie'
            });
            throw new common_1.BadRequestException('Exchange token required');
        }
        await this.authLogsService.logAuthEvent({
            requestId,
            action: 'exchange_token_received',
            success: true,
            metadata: { tokenLength: exchangeToken.length }
        });
        const userId = await this.authService.consumeExchangeToken(exchangeToken);
        if (!userId) {
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'exchange_token_invalid',
                success: false,
                errorMessage: 'Exchange token invalid or expired'
            });
            throw new common_1.BadRequestException('Invalid or expired exchange token');
        }
        await this.authLogsService.logAuthEvent({
            requestId,
            action: 'exchange_token_valid',
            userId,
            success: true
        });
        const user = await this.authService.getUserById(userId);
        if (!user) {
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'exchange_user_not_found',
                userId,
                success: false,
                errorMessage: 'User not found'
            });
            throw new common_1.BadRequestException('User not found');
        }
        const accessToken = this.tokensService.generateAccessToken(user.id, user.email, user.role);
        const refreshToken = await this.tokensService.generateRefreshToken(user.id);
        await this.authLogsService.logAuthEvent({
            requestId,
            action: 'tokens_generated',
            userId: user.id,
            email: user.email,
            success: true,
            metadata: {
                accessTokenLength: accessToken.length,
                refreshTokenLength: refreshToken.length
            }
        });
        const isProduction = isProductionEnvironment();
        res.cookie('procurea_token', accessToken, {
            httpOnly: true,
            secure: isProduction,
            domain: isProduction ? '.procurea.pl' : undefined,
            path: '/',
            maxAge: this.tokensService.getAccessTokenExpirySeconds() * 1000,
            sameSite: 'lax',
            partitioned: false,
        });
        res.cookie('procurea_refresh', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            domain: isProduction ? '.procurea.pl' : undefined,
            path: '/',
            maxAge: this.tokensService.getRefreshTokenExpirySeconds() * 1000,
            sameSite: 'lax',
            partitioned: false,
        });
        res.clearCookie('procurea_exchange', {
            path: '/',
            domain: isProduction ? '.procurea.pl' : undefined
        });
        await this.authLogsService.logAuthEvent({
            requestId,
            action: 'exchange_cookies_set',
            userId: user.id,
            email: user.email,
            success: true,
            metadata: {
                isProduction,
                accessTokenExpiry: '15m',
                refreshTokenExpiry: '30d'
            }
        });
        console.log('[BACKEND] Exchange: Access and refresh tokens set in cookies');
        return {
            success: true,
            message: 'Authentication successful',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                companyName: user.companyName,
                jobTitle: user.jobTitle,
                phone: user.phone,
                organizationId: user.organizationId,
                onboardingCompleted: user.onboardingCompleted,
                isPhoneVerified: user.isPhoneVerified,
            }
        };
    }
    async refreshToken(res, req) {
        const requestId = req.requestId || 'unknown';
        let refreshToken = req.cookies?.procurea_refresh;
        if (!refreshToken) {
            const authHeader = req.headers.authorization;
            if (authHeader?.startsWith('Bearer ')) {
                refreshToken = authHeader.substring(7);
                console.log('[BACKEND] Refresh: Using token from Authorization header');
            }
        }
        if (!refreshToken) {
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'refresh_token_missing',
                success: false,
                errorMessage: 'Refresh token missing in cookie and header'
            });
            throw new common_1.UnauthorizedException('Refresh token required');
        }
        await this.authLogsService.logAuthEvent({
            requestId,
            action: 'refresh_token_received',
            success: true
        });
        try {
            const userId = await this.tokensService.validateRefreshToken(refreshToken);
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'refresh_token_valid',
                userId,
                success: true
            });
            const user = await this.authService.getUserById(userId);
            if (!user) {
                await this.authLogsService.logAuthEvent({
                    requestId,
                    action: 'refresh_user_not_found',
                    userId,
                    success: false,
                    errorMessage: 'User not found'
                });
                throw new common_1.UnauthorizedException('User not found');
            }
            const newAccessToken = this.tokensService.generateAccessToken(user.id, user.email, user.role);
            const newRefreshToken = await this.tokensService.rotateRefreshToken(refreshToken, user.id);
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'tokens_rotated',
                userId: user.id,
                email: user.email,
                success: true
            });
            const isProduction = isProductionEnvironment();
            res.cookie('procurea_token', newAccessToken, {
                httpOnly: true,
                secure: isProduction,
                domain: isProduction ? '.procurea.pl' : undefined,
                path: '/',
                maxAge: this.tokensService.getAccessTokenExpirySeconds() * 1000,
                sameSite: 'lax',
                partitioned: false,
            });
            res.cookie('procurea_refresh', newRefreshToken, {
                httpOnly: true,
                secure: isProduction,
                domain: isProduction ? '.procurea.pl' : undefined,
                path: '/',
                maxAge: this.tokensService.getRefreshTokenExpirySeconds() * 1000,
                sameSite: 'lax',
                partitioned: false,
            });
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'refresh_cookies_set',
                userId: user.id,
                email: user.email,
                success: true
            });
            console.log('[BACKEND] Refresh: New access and refresh tokens set');
            return {
                success: true,
                message: 'Tokens refreshed successfully',
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        }
        catch (error) {
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'refresh_token_error',
                success: false,
                errorMessage: error.message
            });
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
    async getProfile(req) {
        const requestId = req.requestId || 'unknown';
        const cookies = req.cookies || {};
        const headers = req.headers || {};
        await this.authLogsService.logAuthEvent({
            requestId,
            action: 'auth_me_request',
            success: true,
            metadata: {
                hasCookie: !!cookies.procurea_token,
                cookieLength: cookies.procurea_token?.length || 0,
                hasAuthHeader: !!headers.authorization,
                origin: headers.origin,
                referer: headers.referer,
                userAgent: headers['user-agent']
            }
        });
        try {
            const userId = req.user.userId || req.user.sub;
            const user = await this.authService.getUserById(userId);
            if (!user) {
                await this.authLogsService.logAuthEvent({
                    requestId,
                    action: 'auth_me_user_not_found',
                    userId,
                    success: false,
                    errorMessage: 'User not found in database'
                });
                throw new common_1.BadRequestException('User not found');
            }
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'auth_me_success',
                userId: user.id,
                email: user.email,
                success: true,
                metadata: {
                    onboardingCompleted: user.onboardingCompleted,
                    isPhoneVerified: user.isPhoneVerified
                }
            });
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                companyName: user.companyName,
                jobTitle: user.jobTitle,
                isPhoneVerified: user.isPhoneVerified,
                phone: user.phone,
                onboardingCompleted: user.onboardingCompleted,
                organizationId: user.organizationId
            };
        }
        catch (error) {
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'auth_me_error',
                success: false,
                errorMessage: error.message,
                metadata: {
                    stack: error.stack,
                    hasCookie: !!cookies.procurea_token
                }
            });
            throw error;
        }
    }
    async microsoftAuth() {
    }
    async microsoftAuthCallback(req, res) {
        const requestId = req.requestId || 'unknown';
        const oauthUser = req.user;
        const isProduction = isProductionEnvironment();
        const authMode = req.cookies?.procurea_auth_mode || 'login';
        console.log('[BACKEND] Microsoft callback - authMode from cookie:', authMode);
        const isProd = isProductionEnvironment();
        res.clearCookie('procurea_auth_mode', {
            path: '/',
            domain: isProd ? '.procurea.pl' : undefined
        });
        await this.authLogsService.logAuthEvent({
            requestId,
            action: 'oauth_callback_start',
            provider: 'microsoft',
            email: oauthUser.email,
            success: true,
            metadata: {
                providerId: oauthUser.providerId,
                name: oauthUser.name,
                authMode
            }
        });
        try {
            const { user, isNewUser } = await this.authService.validateUserByProvider(oauthUser.email, oauthUser.provider, oauthUser.providerId, oauthUser.name);
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'user_validated',
                provider: 'microsoft',
                userId: user.id,
                email: user.email,
                success: true,
                metadata: { isNewUser, onboardingCompleted: user.onboardingCompleted }
            });
            const exchangeToken = await this.authService.generateExchangeToken(user.id);
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'exchange_token_generated',
                provider: 'microsoft',
                userId: user.id,
                email: user.email,
                success: true,
                metadata: { tokenLength: exchangeToken.length }
            });
            const isProduction = isProductionEnvironment();
            res.cookie('procurea_exchange', exchangeToken, {
                httpOnly: true,
                secure: isProduction,
                domain: isProduction ? '.procurea.pl' : undefined,
                path: '/',
                maxAge: 30000,
                sameSite: 'lax',
                partitioned: false,
            });
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'exchange_cookie_set',
                provider: 'microsoft',
                userId: user.id,
                email: user.email,
                success: true,
                metadata: { isProduction }
            });
            const frontendUrl = process.env.FRONTEND_URL || 'https://app.procurea.pl';
            const redirectUrl = `${frontendUrl}/auth/callback?userId=${user.id}&needsPhone=${!user.isPhoneVerified}&onboardingCompleted=${user.onboardingCompleted}&isNewUser=${isNewUser}&authMode=${authMode}`;
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'redirect_to_frontend',
                provider: 'microsoft',
                userId: user.id,
                email: user.email,
                success: true,
                metadata: {
                    redirectUrl,
                    needsPhone: !user.isPhoneVerified,
                    onboardingCompleted: user.onboardingCompleted,
                    isNewUser
                }
            });
            console.log('[BACKEND] Microsoft OAuth callback redirect URL (secure, no JWT in URL):', redirectUrl);
            console.log('[BACKEND] User data:', { id: user.id, email: user.email, onboardingCompleted: user.onboardingCompleted, isPhoneVerified: user.isPhoneVerified });
            console.log('[BACKEND] Exchange token set in httpOnly cookie (frontend will exchange for access token)');
            console.log('[BACKEND] Request ID:', requestId);
            return res.redirect(redirectUrl);
        }
        catch (error) {
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'oauth_callback_error',
                provider: 'microsoft',
                email: oauthUser.email,
                success: false,
                errorMessage: error.message,
                metadata: { stack: error.stack }
            });
            throw error;
        }
    }
    async logout(req, res) {
        const userId = req.user.userId || req.user.sub;
        const revokedCount = await this.tokensService.revokeAllRefreshTokens(userId);
        console.log(`[BACKEND] Logout: Revoked ${revokedCount} refresh tokens for user ${userId}`);
        const isProduction = isProductionEnvironment();
        res.clearCookie('procurea_token', {
            path: '/',
            domain: isProduction ? '.procurea.pl' : undefined
        });
        res.clearCookie('procurea_refresh', {
            path: '/',
            domain: isProduction ? '.procurea.pl' : undefined
        });
        return res.json({ success: true, message: 'Logged out successfully' });
    }
    async cancelRegistration(body, res) {
        if (!body.userId) {
            throw new common_1.BadRequestException('Missing userId');
        }
        const result = await this.authService.cancelRegistration(body.userId);
        const isProduction = isProductionEnvironment();
        res.clearCookie('procurea_token', {
            path: '/',
            domain: isProduction ? '.procurea.pl' : undefined
        });
        return res.json(result);
    }
    async ssoLogin(body) {
        if (!body.email || !body.provider)
            throw new common_1.BadRequestException('Missing email or provider');
        const { user, isNewUser } = await this.authService.validateUserByProvider(body.email, body.provider, body.ssoId, body.name);
        return { ...user, isNewUser };
    }
    async emailLogin(body) {
        if (!body.email)
            throw new common_1.BadRequestException('Missing email');
        return this.authService.startEmailLogin(body.email);
    }
    async emailVerify(body, res) {
        if (!body.email || !body.code) {
            throw new common_1.BadRequestException('Missing email or code');
        }
        const user = await this.authService.verifyEmailCode(body.email, body.code);
        const accessToken = this.tokensService.generateAccessToken(user.id, user.email, user.role);
        const refreshToken = await this.tokensService.generateRefreshToken(user.id);
        const isProduction = isProductionEnvironment();
        res.cookie('procurea_token', accessToken, {
            httpOnly: true,
            secure: isProduction,
            domain: isProduction ? '.procurea.pl' : undefined,
            path: '/',
            maxAge: this.tokensService.getAccessTokenExpirySeconds() * 1000,
            sameSite: 'lax',
        });
        res.cookie('procurea_refresh', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            domain: isProduction ? '.procurea.pl' : undefined,
            path: '/',
            maxAge: this.tokensService.getRefreshTokenExpirySeconds() * 1000,
            sameSite: 'lax',
        });
        console.log(`[AUTH] Email login successful for ${body.email}`);
        return {
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                companyName: user.companyName,
                jobTitle: user.jobTitle,
                phone: user.phone,
                organizationId: user.organizationId,
                onboardingCompleted: user.onboardingCompleted,
                isPhoneVerified: user.isPhoneVerified,
            }
        };
    }
    async firebaseLogin(req, res) {
        const decodedToken = req.user;
        const email = decodedToken.email;
        const uid = decodedToken.uid;
        const name = decodedToken.name || email.split('@')[0];
        const { user, isNewUser } = await this.authService.validateUserByProvider(email, 'firebase', uid, name);
        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);
        const isProduction = isProductionEnvironment();
        res.cookie('procurea_token', token, getCookieOptions(isProduction));
        return { ...user, isNewUser };
    }
    async sendPhoneOtp(body) {
        if (!body.userId || !body.phone)
            throw new common_1.BadRequestException('Missing userId or phone');
        try {
            return await this.authService.initiatePhoneVerification(body.userId, body.phone);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw error;
        }
    }
    async verifyPhoneOtp(body, res) {
        if (!body.userId || !body.phone || !body.code)
            throw new common_1.BadRequestException('Missing fields');
        const user = await this.authService.verifyPhone(body.userId, body.phone, body.code);
        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);
        const isProduction = isProductionEnvironment();
        res.cookie('procurea_token', token, getCookieOptions(isProduction));
        return { ...user, token: undefined };
    }
    async completeOnboarding(body, res) {
        if (!body.userId)
            throw new common_1.BadRequestException('Missing userId');
        const user = await this.authService.completeOnboarding(body.userId, body);
        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);
        const isProduction = isProductionEnvironment();
        res.cookie('procurea_token', token, getCookieOptions(isProduction));
        return user;
    }
    async remindAccount(body) {
        if (!body.phone)
            throw new common_1.BadRequestException('Missing phone');
        return this.authService.sendAccountReminder(body.phone);
    }
    async updatePreferences(req, body) {
        if (!body.preferences)
            throw new common_1.BadRequestException('Missing preferences');
        const userId = req.user.userId || req.user.sub;
        return this.authService.updatePreferences(userId, body.preferences);
    }
    async deleteAllUsers(body) {
        if (body.confirm !== 'DELETE_ALL_USERS') {
            throw new common_1.BadRequestException('Confirmation required: send { "confirm": "DELETE_ALL_USERS" }');
        }
        return this.authService.deleteAllUsers();
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuthCallback", null);
__decorate([
    (0, common_1.Post)('exchange'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "exchangeToken", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('microsoft'),
    (0, common_1.UseGuards)(microsoft_auth_guard_1.MicrosoftAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "microsoftAuth", null);
__decorate([
    (0, common_1.Get)('microsoft/callback'),
    (0, common_1.UseGuards)(microsoft_auth_guard_1.MicrosoftAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "microsoftAuthCallback", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('registration/cancel'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "cancelRegistration", null);
__decorate([
    (0, common_1.Post)('sso/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "ssoLogin", null);
__decorate([
    (0, common_1.Post)('email/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "emailLogin", null);
__decorate([
    (0, common_1.Post)('email/verify'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "emailVerify", null);
__decorate([
    (0, common_1.Post)('firebase-login'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('firebase')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "firebaseLogin", null);
__decorate([
    (0, common_1.Post)('phone/send'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendPhoneOtp", null);
__decorate([
    (0, common_1.Post)('phone/verify'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyPhoneOtp", null);
__decorate([
    (0, common_1.Post)('onboarding/complete'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "completeOnboarding", null);
__decorate([
    (0, common_1.Post)('phone/remind'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "remindAccount", null);
__decorate([
    (0, common_1.Post)('me/preferences'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updatePreferences", null);
__decorate([
    (0, common_1.Post)('admin/delete-all-users'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deleteAllUsers", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService,
        auth_logs_service_1.AuthLogsService,
        tokens_service_1.TokensService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map