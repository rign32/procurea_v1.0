import type { Request, Response } from 'express';
export declare class AuthDiagnosticsController {
    private ensureDevMode;
    getCookieDiagnostics(req: Request): {
        timestamp: string;
        requestInfo: {
            url: string;
            method: string;
            origin: string | undefined;
            referer: string | undefined;
            userAgent: string | undefined;
        };
        cookies: {
            raw: string;
            parsed: Record<string, any>;
            allCookieNames: string[];
            hasProcureaToken: boolean;
            hasProcureaRefresh: boolean;
            hasProcureaExchange: boolean;
        };
        expectedCookies: string[];
    };
    testCookieSetting(res: Response, req: Request): Promise<{
        message: string;
        testValue: string;
        cookiesSet: {
            name: string;
            attributes: string;
        }[];
        instructions: string;
        currentRequestCookies: Record<string, any>;
    }>;
    getSessionFlowDiagnostics(req: Request): {
        status: string;
        details: {
            cookiesPresent: boolean;
            authCookiesPresent: any;
            allCookies: Record<string, any>;
            cookieHeader: string | null;
        };
        flowSteps: {
            step1_oauth: string;
            step2_callback: string;
            step3_exchange_cookie: string;
            step4_frontend_redirect: string;
            step5_exchange_call: string;
            step6_tokens_set: string;
            step7_redirect_dashboard: string;
            step8_auth_check: string;
            currentStep: string;
        };
        troubleshooting: {
            ifNoCookies: string;
            ifCookiesButNotSent: string;
            ifWrongDomain: string;
        };
    };
    private detectCurrentStep;
}
