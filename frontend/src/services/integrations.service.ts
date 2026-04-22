import apiClient from './api.client';

export interface IntegrationConnection {
    id: string;
    provider: string;
    platformSlug: string | null;
    platformName: string | null;
    integrationCategory: string | null;
    status: 'PENDING' | 'LINKED' | 'ERROR' | 'DISCONNECTED' | string;
    statusMessage: string | null;
    capabilities: unknown;
    lastSyncedAt: string | null;
    lastSyncSupplierCount: number | null;
    createdAt: string;
}

export interface SupplierMatch {
    id: string;
    supplierId: string;
    externalSupplierId: string;
    confidence: number;
    matchType: string;
    status: 'suggested' | 'confirmed' | 'rejected' | string;
    externalSupplier: {
        id: string;
        name: string;
        taxNumber: string | null;
        website: string | null;
        primaryEmail: string | null;
        connection: { platformName: string | null; platformSlug: string | null };
    };
    supplier?: {
        id: string;
        name: string | null;
        website: string | null;
        country: string | null;
    };
}

export const integrationsService = {
    listConnections: async (): Promise<IntegrationConnection[]> => {
        const { data } = await apiClient.get<IntegrationConnection[]>(
            '/integrations/connections',
        );
        return data;
    },

    sync: async (connectionId: string): Promise<unknown> => {
        const { data } = await apiClient.post(
            `/integrations/connections/${connectionId}/sync`,
        );
        return data;
    },

    disconnect: async (connectionId: string): Promise<void> => {
        await apiClient.delete(`/integrations/connections/${connectionId}`);
    },

    listMatches: async (): Promise<SupplierMatch[]> => {
        const { data } = await apiClient.get<SupplierMatch[]>('/integrations/matches');
        return data;
    },

    matchesForSupplier: async (supplierId: string): Promise<SupplierMatch[]> => {
        const { data } = await apiClient.get<SupplierMatch[]>(
            `/integrations/matches/by-supplier/${supplierId}`,
        );
        return data;
    },

    confirmMatch: async (
        matchId: string,
        status: 'confirmed' | 'rejected',
        rejectedReason?: string,
    ): Promise<SupplierMatch> => {
        const { data } = await apiClient.post<SupplierMatch>(
            '/integrations/matches/confirm',
            { matchId, status, rejectedReason },
        );
        return data;
    },
};

export default integrationsService;
