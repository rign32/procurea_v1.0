/**
 * Mock implementations for external services used in E2E tests.
 * These replace Resend, Gemini, SMS etc. so tests don't hit real APIs.
 */

export const createMockEmailService = () => {
    let counter = 0;
    return {
        // EmailService.sendEmail returns { sent: boolean, emailId?: string } — callers
        // (e.g. requests.service.sendRfqToCampaign) check result.sent, NOT the boolean
        // shorthand the old mock returned.
        sendEmail: jest.fn().mockImplementation(async () => ({
            sent: true,
            emailId: `mock-email-${++counter}`,
        })),
        sendMagicLink: jest.fn().mockResolvedValue(true),
        sendWelcomeEmail: jest.fn().mockResolvedValue(true),
        sendNotificationEmail: jest.fn().mockResolvedValue(true),
        sendTeamInvite: jest.fn().mockResolvedValue(true),
        sendTrialEndedEmail: jest.fn().mockResolvedValue(true),
        sendFeedbackRequestEmail: jest.fn().mockResolvedValue(true),
        buildFooterHtml: jest.fn().mockReturnValue(''),
        getFooterHtmlForOrg: jest.fn().mockResolvedValue(''),
    };
};

export const createMockNotificationService = () => ({
    send: jest.fn().mockResolvedValue(undefined),
});

export const createMockTranslationService = () => ({
    translateEmailTemplate: jest.fn().mockImplementation(async (data: any) => {
        return `<html><body><h1>RFQ: ${data.productName}</h1><a href="${data.portalUrl}">Submit offer</a></body></html>`;
    }),
    translateText: jest.fn().mockImplementation(async (text: string) => text),
    translatePortalUI: jest.fn().mockImplementation(async (langCode: string) => ({
        success: true,
        language: langCode,
        translations: {},
    })),
});

export const createMockCurrencyService = () => ({
    convert: jest.fn().mockImplementation(async (amount: number, from: string, to: string) => {
        if (from === to) return amount;
        // Simple mock: 1 EUR = 4.3 PLN, 1 USD = 4.0 PLN
        const toPln: Record<string, number> = { EUR: 4.3, USD: 4.0, PLN: 1, GBP: 5.1 };
        const fromRate = toPln[from] || 1;
        const toRate = toPln[to] || 1;
        return (amount * fromRate) / toRate;
    }),
});

export const createMockGeminiService = () => ({
    generateContent: jest.fn().mockResolvedValue('{}'),
    generateContentCached: jest.fn().mockResolvedValue('{}'),
});

export const createMockSmsService = () => ({
    sendVerificationCode: jest.fn().mockResolvedValue(true),
    verifyCode: jest.fn().mockResolvedValue(true),
    sendCustomSms: jest.fn().mockResolvedValue(true),
});

export const createMockRedisService = () => {
    const store = new Map<string, { value: string; attempts: number }>();
    return {
        storeMagicCode: jest.fn().mockImplementation(async (email: string, code: string) => {
            store.set(`magic:${email}`, { value: code, attempts: 0 });
        }),
        verifyAndDeleteMagicCode: jest.fn().mockImplementation(async (email: string, code: string) => {
            const entry = store.get(`magic:${email}`);
            if (!entry || entry.value !== code) return false;
            store.delete(`magic:${email}`);
            return true;
        }),
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue(undefined),
        del: jest.fn().mockResolvedValue(undefined),
        storeExchangeToken: jest.fn().mockResolvedValue(undefined),
        getExchangeToken: jest.fn().mockResolvedValue(null),
        deleteExchangeToken: jest.fn().mockResolvedValue(undefined),
        _store: store,
    };
};

export const createMockPostHogService = () => ({
    capture: jest.fn(),
    identify: jest.fn(),
    shutdown: jest.fn().mockResolvedValue(undefined),
});

export const createMockSalesOpsService = () => ({
    onUserRegistered: jest.fn().mockResolvedValue(undefined),
    onCampaignCompleted: jest.fn().mockResolvedValue(undefined),
    onTrialStarted: jest.fn().mockResolvedValue(undefined),
});

export const createMockObservabilityService = () => ({
    trackEvent: jest.fn(),
    trackError: jest.fn(),
    flush: jest.fn().mockResolvedValue(undefined),
});

export const createMockErrorTrackingService = () => ({
    captureException: jest.fn(),
    captureMessage: jest.fn(),
});
