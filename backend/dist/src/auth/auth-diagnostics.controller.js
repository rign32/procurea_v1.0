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
exports.AuthDiagnosticsController = void 0;
const common_1 = require("@nestjs/common");
let AuthDiagnosticsController = class AuthDiagnosticsController {
    getCookieDiagnostics(req) {
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
    async testCookieSetting(res, req) {
        const testValue = `test_${Date.now()}`;
        res.cookie('test_simple', testValue, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
        });
        res.cookie('test_partitioned', testValue, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
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
    getSessionFlowDiagnostics(req) {
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
    detectCurrentStep(req) {
        if (req.cookies?.procurea_token && req.cookies?.procurea_refresh) {
            return 'STEP_8_OR_LATER: Authenticated with access and refresh tokens';
        }
        if (req.cookies?.procurea_exchange) {
            return 'STEP_4_OR_5: Has exchange token, waiting for /auth/exchange call';
        }
        return 'STEP_1_TO_3: No auth cookies yet, user needs to login';
    }
};
exports.AuthDiagnosticsController = AuthDiagnosticsController;
__decorate([
    (0, common_1.Get)('cookies'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthDiagnosticsController.prototype, "getCookieDiagnostics", null);
__decorate([
    (0, common_1.Post)('test-cookie'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthDiagnosticsController.prototype, "testCookieSetting", null);
__decorate([
    (0, common_1.Get)('session-flow'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthDiagnosticsController.prototype, "getSessionFlowDiagnostics", null);
exports.AuthDiagnosticsController = AuthDiagnosticsController = __decorate([
    (0, common_1.Controller)('auth/diagnostics')
], AuthDiagnosticsController);
//# sourceMappingURL=auth-diagnostics.controller.js.map