import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('auth/diagnostics')
export class AuthDiagnosticsController {

    @Get('cookies')
    getCookieDiagnostics(@Req() req: Request) {
        return {
            timestamp: new Date().toISOString(),
            requestInfo: {
                url: req.url,
                method: req.method,
                origin: req.headers.origin,
                referer: req.headers.referer,
                userAgent: req.headers['user-agent'],
            },
            cookies: {
                raw: req.headers.cookie || 'No cookie header',
                parsed: req.cookies || {},
                allCookieNames: req.cookies ? Object.keys(req.cookies) : [],
                hasProcureaToken: !!req.cookies?.procurea_token,
                hasProcureaRefresh: !!req.cookies?.procurea_refresh,
                hasProcureaExchange: !!req.cookies?.procurea_exchange,
            },
            expectedCookies: [
                'procurea_token (access token, 15min)',
                'procurea_refresh (refresh token, 30d)',
                'procurea_exchange (exchange token, 30s - only during OAuth)'
            ]
        };
    }

    @Post('test-cookie')
    async testCookieSetting(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
        const testValue = `test_${Date.now()}`;

        // Test 1: Simple cookie (no domain)
        res.cookie('test_simple', testValue, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
        });

        // Test 2: Cookie with partitioned
        res.cookie('test_partitioned', testValue, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            // @ts-ignore
            partitioned: true,
        });

        return {
            message: 'Test cookies set',
            testValue,
            cookiesSet: [
                { name: 'test_simple', attributes: 'httpOnly, secure, sameSite=none' },
                { name: 'test_partitioned', attributes: 'httpOnly, secure, sameSite=none, partitioned' }
            ],
            instructions: 'Check Application → Cookies in DevTools to see if these cookies were set',
            currentRequestCookies: req.cookies || {}
        };
    }

    @Get('session-flow')
    getSessionFlowDiagnostics(@Req() req: Request) {
        const hasCookies = req.cookies && Object.keys(req.cookies).length > 0;
        const hasAuthCookies = req.cookies?.procurea_token || req.cookies?.procurea_refresh;

        return {
            status: hasAuthCookies ? 'AUTHENTICATED' : hasCookies ? 'HAS_COOKIES_BUT_NOT_AUTH' : 'NO_COOKIES',
            details: {
                cookiesPresent: hasCookies,
                authCookiesPresent: hasAuthCookies,
                allCookies: req.cookies || {},
                cookieHeader: req.headers.cookie || null,
            },
            flowSteps: {
                step1_oauth: 'User clicks "Login with Google"',
                step2_callback: 'Google redirects to /auth/google/callback',
                step3_exchange_cookie: 'Backend sets procurea_exchange cookie',
                step4_frontend_redirect: 'Backend redirects to /auth/callback',
                step5_exchange_call: 'Frontend calls POST /auth/exchange',
                step6_tokens_set: 'Backend sets procurea_token and procurea_refresh cookies',
                step7_redirect_dashboard: 'Frontend redirects to /dashboard',
                step8_auth_check: 'Dashboard calls GET /auth/me with cookies',
                currentStep: this.detectCurrentStep(req)
            },
            troubleshooting: {
                ifNoCookies: 'Cookies may be blocked by browser or set for wrong domain',
                ifCookiesButNotSent: 'Check SameSite and Secure attributes, ensure credentials: include',
                ifWrongDomain: 'Ensure all API calls go to the same domain where cookies were set'
            }
        };
    }

    private detectCurrentStep(req: Request): string {
        if (req.cookies?.procurea_token && req.cookies?.procurea_refresh) {
            return 'STEP_8_OR_LATER: Authenticated with access and refresh tokens';
        }
        if (req.cookies?.procurea_exchange) {
            return 'STEP_4_OR_5: Has exchange token, waiting for /auth/exchange call';
        }
        return 'STEP_1_TO_3: No auth cookies yet, user needs to login';
    }
}
