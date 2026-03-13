import apiClient from './api.client';

export interface CreditTransaction {
    id: string;
    amount: number;
    type: string;
    description: string | null;
    createdAt: string;
    balanceAfter: number;
}

export interface BillingInfo {
    searchCredits: number;
    personalCredits: number;
    orgCredits: number;
    plan: string;
    orgPlan: string;
    hasStripeCustomer: boolean;
    trialCreditsUsed?: boolean;
    cancelAtPeriodEnd?: boolean;
    currentPeriodEnd?: string | null;
    recentTransactions: (CreditTransaction & { source?: 'personal' | 'org' })[];
}

export const billingService = {
    getInfo: async (): Promise<BillingInfo> => {
        const { data } = await apiClient.get('/billing/info');
        return data;
    },

    createCreditCheckout: async (packId: string): Promise<{ url: string }> => {
        const { data } = await apiClient.post('/billing/checkout/credits', { packId });
        return data;
    },

    createSubscriptionCheckout: async (): Promise<{ url: string }> => {
        const { data } = await apiClient.post('/billing/checkout/subscription');
        return data;
    },

    createPortalSession: async (): Promise<{ url: string }> => {
        const { data } = await apiClient.post('/billing/portal');
        return data;
    },

    verifySession: async (sessionId: string): Promise<{ fulfilled: boolean; credits?: number; plan?: string }> => {
        const { data } = await apiClient.post('/billing/verify-session', { sessionId });
        return data;
    },

    cancelSubscription: async (): Promise<{ canceledAt: string; cancelAtPeriodEnd: boolean }> => {
        const { data } = await apiClient.post('/billing/cancel-subscription');
        return data;
    },

    contributeCredits: async (amount: number): Promise<{ personalCredits: number; orgCredits: number }> => {
        const { data } = await apiClient.post('/billing/contribute', { amount });
        return data;
    },
};
