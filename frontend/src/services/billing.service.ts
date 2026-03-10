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
    plan: string;
    hasStripeCustomer: boolean;
    recentTransactions: CreditTransaction[];
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
};
