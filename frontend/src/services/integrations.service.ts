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
};

export default integrationsService;
