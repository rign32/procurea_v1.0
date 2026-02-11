import { Controller, Post, Body, BadRequestException, ConflictException, Get, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { MicrosoftAuthGuard } from './guards/microsoft-auth.guard';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthLogsService } from '../common/logger/auth-logs.service';
import { TokensService } from './tokens.service';
import type { Response, CookieOptions } from 'express';

// Cookie configuration for cross-domain auth
// Detect production: Always use production settings in Cloud Functions
// Cloud Run sets FUNCTION_TARGET when running in production
const isProductionEnvironment = () => {
    // DIAGNOSTICS: Log all environment checks
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

const getCookieOptions = (isProduction: boolean): CookieOptions => ({
    httpOnly: true,
    secure: isProduction,
    domain: isProduction ? '.procurea.pl' : undefined,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax', // 'none' required for cross-site OAuth redirects
    // @ts-ignore - Partitioned is not yet in types but supported by browsers
    partitioned: false // Enable CHIPS (Cookies Having Independent Partitioned State)
});

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,
        private readonly authLogsService: AuthLogsService,
        private readonly tokensService: TokensService,
    ) { }

    // ========== GOOGLE OAUTH ==========
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth() {
        // Initiates Google OAuth flow - redirects to Google
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthCallback(@Req() req, @Res() res: Response) {
        const requestId = (req as any).requestId || 'unknown';
        const oauthUser = req.user;
        const isProduction = isProductionEnvironment();

        // Read authMode and origin from cookie (set by frontend before OAuth redirect)
        // Note: OAuth state parameter doesn't work in serverless (no session support)
        const authMode = req.cookies?.procurea_auth_mode || 'login';
        const origin = req.cookies?.procurea_auth_origin || req.query?.origin || 'app';
        console.log('[BACKEND] Google callback - authMode from cookie:', authMode, 'origin:', origin);

        // Clear the authMode and origin cookies as they're no longer needed
        const isProd = isProductionEnvironment();
        res.clearCookie('procurea_auth_mode', {
            path: '/',
            domain: isProd ? '.procurea.pl' : undefined
        });
        res.clearCookie('procurea_auth_origin', {
            path: '/',
            domain: isProd ? '.procurea.pl' : undefined
        });

        // Log OAuth callback start
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
            // Find or create user with SSO info
            const { user, isNewUser } = await this.authService.validateUserByProvider(
                oauthUser.email,
                oauthUser.provider,
                oauthUser.providerId,
                oauthUser.name
            );

            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'user_validated',
                provider: 'google',
                userId: user.id,
                email: user.email,
                success: true,
                metadata: { isNewUser, onboardingCompleted: user.onboardingCompleted }
            });

            // Generate short-lived exchange token (30 seconds)
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

            // Set exchange token in httpOnly cookie
            const isProduction = isProductionEnvironment();
            res.cookie('procurea_exchange', exchangeToken, {
                httpOnly: true,
                secure: isProduction,
                domain: isProduction ? '.procurea.pl' : undefined,
                path: '/',
                maxAge: 30000, // 30 seconds
                sameSite: 'lax',
                // @ts-ignore
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

            // Redirect to frontend WITHOUT token in URL (security improvement)
            // Determine redirect URL based on origin (admin vs app)
            let frontendUrl: string;
            if (origin === 'admin') {
                frontendUrl = process.env.ADMIN_URL || 'https://admin.procurea.pl';
            } else {
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
        } catch (error) {
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

    // ========== EXCHANGE TOKEN FOR COOKIES ==========
    @Post('exchange')
    async exchangeToken(@Res({ passthrough: true }) res: Response, @Req() req) {
        const requestId = (req as any).requestId || 'unknown';

        // Read exchange token from httpOnly cookie
        const exchangeToken = req.cookies?.procurea_exchange;

        if (!exchangeToken) {
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'exchange_token_missing',
                success: false,
                errorMessage: 'Exchange token missing in cookie'
            });
            throw new BadRequestException('Exchange token required');
        }

        await this.authLogsService.logAuthEvent({
            requestId,
            action: 'exchange_token_received',
            success: true,
            metadata: { tokenLength: exchangeToken.length }
        });

        // Validate and consume the exchange token
        const userId = await this.authService.consumeExchangeToken(exchangeToken);

        if (!userId) {
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'exchange_token_invalid',
                success: false,
                errorMessage: 'Exchange token invalid or expired'
            });
            throw new BadRequestException('Invalid or expired exchange token');
        }

        await this.authLogsService.logAuthEvent({
            requestId,
            action: 'exchange_token_valid',
            userId,
            success: true
        });

        // Get user data
        const user = await this.authService.getUserById(userId);

        if (!user) {
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'exchange_user_not_found',
                userId,
                success: false,
                errorMessage: 'User not found'
            });
            throw new BadRequestException('User not found');
        }

        // Generate access token (15 minutes) and refresh token (30 days)
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

        // Set cookies
        const isProduction = isProductionEnvironment();

        // Access token cookie (15 minutes)
        res.cookie('procurea_token', accessToken, {
            httpOnly: true,
            secure: isProduction,
            domain: isProduction ? '.procurea.pl' : undefined,
            path: '/',
            maxAge: this.tokensService.getAccessTokenExpirySeconds() * 1000,
            sameSite: 'lax',
            // @ts-ignore
            partitioned: false,
        });

        // Refresh token cookie (30 days)
        res.cookie('procurea_refresh', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            domain: isProduction ? '.procurea.pl' : undefined,
            path: '/',
            maxAge: this.tokensService.getRefreshTokenExpirySeconds() * 1000,
            sameSite: 'lax',
            // @ts-ignore
            partitioned: false,
        });

        // Clear exchange token cookie
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

        // Return tokens in response body as well (for localStorage fallback when cookies don't work cross-domain)
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

    // ========== REFRESH TOKEN ==========
    @Post('refresh')
    async refreshToken(@Res({ passthrough: true }) res: Response, @Req() req) {
        const requestId = (req as any).requestId || 'unknown';

        // Read refresh token from cookie or Authorization header (fallback for Safari)
        let refreshToken = req.cookies?.procurea_refresh;

        // Fallback: check Authorization header (Bearer token)
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
            throw new UnauthorizedException('Refresh token required');
        }

        await this.authLogsService.logAuthEvent({
            requestId,
            action: 'refresh_token_received',
            success: true
        });

        try {
            // Validate refresh token and get user ID
            const userId = await this.tokensService.validateRefreshToken(refreshToken);

            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'refresh_token_valid',
                userId,
                success: true
            });

            // Get user data
            const user = await this.authService.getUserById(userId);

            if (!user) {
                await this.authLogsService.logAuthEvent({
                    requestId,
                    action: 'refresh_user_not_found',
                    userId,
                    success: false,
                    errorMessage: 'User not found'
                });
                throw new UnauthorizedException('User not found');
            }

            // Rotate refresh token (invalidate old, create new)
            const newAccessToken = this.tokensService.generateAccessToken(user.id, user.email, user.role);
            const newRefreshToken = await this.tokensService.rotateRefreshToken(refreshToken, user.id);

            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'tokens_rotated',
                userId: user.id,
                email: user.email,
                success: true
            });

            // Set new cookies
            const isProduction = isProductionEnvironment();

            // New access token cookie
            res.cookie('procurea_token', newAccessToken, {
                httpOnly: true,
                secure: isProduction,
                domain: isProduction ? '.procurea.pl' : undefined,
                path: '/',
                maxAge: this.tokensService.getAccessTokenExpirySeconds() * 1000,
                sameSite: 'lax',
                // @ts-ignore
                partitioned: false,
            });

            // New refresh token cookie
            res.cookie('procurea_refresh', newRefreshToken, {
                httpOnly: true,
                secure: isProduction,
                domain: isProduction ? '.procurea.pl' : undefined,
                path: '/',
                maxAge: this.tokensService.getRefreshTokenExpirySeconds() * 1000,
                sameSite: 'lax',
                // @ts-ignore
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

            // Return tokens in response body as well (for localStorage fallback)
            return {
                success: true,
                message: 'Tokens refreshed successfully',
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'refresh_token_error',
                success: false,
                errorMessage: error.message
            });
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    // ========== USER PROFILE ==========
    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    async getProfile(@Req() req) {
        const requestId = (req as any).requestId || 'unknown';
        const cookies = req.cookies || {};
        const headers = req.headers || {};

        // Log incoming request details
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
            const userId = req.user.userId || req.user.sub; // Passport property logic
            const user = await this.authService.getUserById(userId);

            if (!user) {
                await this.authLogsService.logAuthEvent({
                    requestId,
                    action: 'auth_me_user_not_found',
                    userId,
                    success: false,
                    errorMessage: 'User not found in database'
                });
                throw new BadRequestException('User not found');
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

            // Return safe user object
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
        } catch (error) {
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

    // ========== MICROSOFT OAUTH ==========
    @Get('microsoft')
    @UseGuards(MicrosoftAuthGuard)
    async microsoftAuth() {
        // Initiates Microsoft OAuth flow
    }

    @Get('microsoft/callback')
    @UseGuards(MicrosoftAuthGuard)
    async microsoftAuthCallback(@Req() req, @Res() res: Response) {
        const requestId = (req as any).requestId || 'unknown';
        const oauthUser = req.user;
        const isProduction = isProductionEnvironment();

        // Read authMode from cookie (set by frontend before OAuth redirect)
        // Note: OAuth state parameter doesn't work in serverless (no session support)
        const authMode = req.cookies?.procurea_auth_mode || 'login';
        console.log('[BACKEND] Microsoft callback - authMode from cookie:', authMode);

        // Clear the authMode cookie as it's no longer needed
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
            const { user, isNewUser } = await this.authService.validateUserByProvider(
                oauthUser.email,
                oauthUser.provider,
                oauthUser.providerId,
                oauthUser.name
            );

            await this.authLogsService.logAuthEvent({
                requestId,
                action: 'user_validated',
                provider: 'microsoft',
                userId: user.id,
                email: user.email,
                success: true,
                metadata: { isNewUser, onboardingCompleted: user.onboardingCompleted }
            });

            // Generate short-lived exchange token (30 seconds)
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

            // Set exchange token in httpOnly cookie
            const isProduction = isProductionEnvironment();
            res.cookie('procurea_exchange', exchangeToken, {
                httpOnly: true,
                secure: isProduction,
                domain: isProduction ? '.procurea.pl' : undefined,
                path: '/',
                maxAge: 30000, // 30 seconds
                sameSite: 'lax',
                // @ts-ignore
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

            // Redirect to frontend WITHOUT token in URL (security improvement)
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
        } catch (error) {
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

    // ========== LOGOUT ==========
    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(@Req() req, @Res() res: Response) {
        const userId = req.user.userId || req.user.sub;

        // Revoke all refresh tokens for this user
        const revokedCount = await this.tokensService.revokeAllRefreshTokens(userId);
        console.log(`[BACKEND] Logout: Revoked ${revokedCount} refresh tokens for user ${userId}`);

        // Clear authentication cookies
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

    // ========== CANCEL REGISTRATION ==========
    @Post('registration/cancel')
    async cancelRegistration(@Body() body: { userId: string }, @Res() res: Response) {
        if (!body.userId) {
            throw new BadRequestException('Missing userId');
        }

        const result = await this.authService.cancelRegistration(body.userId);

        // Clear authentication cookie
        const isProduction = isProductionEnvironment();
        res.clearCookie('procurea_token', {
            path: '/',
            domain: isProduction ? '.procurea.pl' : undefined
        });

        return res.json(result);
    }

    // ========== LEGACY ENDPOINTS (kept for email login) ==========
    @Post('sso/login')
    async ssoLogin(@Body() body: { email: string; provider: string; ssoId?: string; name?: string }) {
        if (!body.email || !body.provider) throw new BadRequestException('Missing email or provider');
        const { user, isNewUser } = await this.authService.validateUserByProvider(body.email, body.provider, body.ssoId, body.name);
        return { ...user, isNewUser };
    }

    @Post('email/login')
    async emailLogin(@Body() body: { email: string }) {
        if (!body.email) throw new BadRequestException('Missing email');
        return this.authService.startEmailLogin(body.email);
    }

    @Post('email/verify')
    async emailVerify(
        @Body() body: { email: string; code: string },
        @Res({ passthrough: true }) res: Response
    ) {
        if (!body.email || !body.code) {
            throw new BadRequestException('Missing email or code');
        }

        // Verify the magic code
        const user = await this.authService.verifyEmailCode(body.email, body.code);

        // Generate tokens (same as OAuth flow)
        const accessToken = this.tokensService.generateAccessToken(user.id, user.email, user.role);
        const refreshToken = await this.tokensService.generateRefreshToken(user.id);

        // Set cookies
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

    @Post('firebase-login')
    @UseGuards(AuthGuard('firebase'))
    async firebaseLogin(@Req() req, @Res({ passthrough: true }) res: Response) {
        const decodedToken = req.user;
        const email = decodedToken.email;
        const uid = decodedToken.uid;
        const name = decodedToken.name || email.split('@')[0];

        const { user, isNewUser } = await this.authService.validateUserByProvider(
            email,
            'firebase',
            uid,
            name
        );

        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);

        const isProduction = isProductionEnvironment();
        res.cookie('procurea_token', token, getCookieOptions(isProduction));

        return { ...user, isNewUser };
    }

    @Post('phone/send')
    async sendPhoneOtp(@Body() body: { userId: string; phone: string }) {
        if (!body.userId || !body.phone) throw new BadRequestException('Missing userId or phone');

        try {
            return await this.authService.initiatePhoneVerification(body.userId, body.phone);
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error; // Rethrow for frontend to handle
            }
            throw error;
        }
    }



    @Post('phone/verify')
    async verifyPhoneOtp(@Body() body: { userId: string; phone: string; code: string }, @Res({ passthrough: true }) res: Response) {
        if (!body.userId || !body.phone || !body.code) throw new BadRequestException('Missing fields');
        const user = await this.authService.verifyPhone(body.userId, body.phone, body.code);

        // Generate JWT
        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);

        // Set authentication cookie
        const isProduction = isProductionEnvironment();
        res.cookie('procurea_token', token, getCookieOptions(isProduction));

        // Return user to let frontend know status (token is in cookie)
        return { ...user, token: undefined }; // Don't return token in body if using cookies, or keep it for legacy? Keeping it out is cleaner.
    }

    @Post('onboarding/complete')
    async completeOnboarding(@Body() body: {
        userId: string;
        firstName?: string;
        lastName?: string;
        companyName: string;
        jobTitle?: string;
        language?: string;
        locations?: { name: string; address: string }[];
        invites?: { email: string }[];
    }, @Res({ passthrough: true }) res: Response) {
        if (!body.userId) throw new BadRequestException('Missing userId');

        const user = await this.authService.completeOnboarding(body.userId, body);

        // After completion, return fresh token with potentially updated roles/claims
        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);

        // Set authentication cookie
        const isProduction = isProductionEnvironment();
        res.cookie('procurea_token', token, getCookieOptions(isProduction));

        return user;
    }

    @Post('phone/remind')
    async remindAccount(@Body() body: { phone: string }) {
        if (!body.phone) throw new BadRequestException('Missing phone');
        return this.authService.sendAccountReminder(body.phone);
    }

    @Post('me/preferences')
    @UseGuards(AuthGuard('jwt'))
    async updatePreferences(@Req() req, @Body() body: { preferences: any[] }) {
        if (!body.preferences) throw new BadRequestException('Missing preferences');
        const userId = req.user.userId || req.user.sub;
        return this.authService.updatePreferences(userId, body.preferences);
    }

    @Post('admin/delete-all-users')
    async deleteAllUsers(@Body() body: { confirm: string }) {
        // Safety check - require confirmation
        if (body.confirm !== 'DELETE_ALL_USERS') {
            throw new BadRequestException('Confirmation required: send { "confirm": "DELETE_ALL_USERS" }');
        }
        return this.authService.deleteAllUsers();
    }
}
