import apiClient from './api.client';

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes?: string[];
  lastUsedAt?: string;
  expiresAt?: string;
  enabled: boolean;
  createdAt: string;
}

export interface CreateApiKeyDto {
  name: string;
  scopes?: string[];
  expiresInDays?: number;
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey;
  rawKey: string;
}

export const apiKeysService = {
  getAll: async (): Promise<ApiKey[]> => {
    const { data } = await apiClient.get<ApiKey[]>('/api-keys');
    return data;
  },

  create: async (dto: CreateApiKeyDto): Promise<CreateApiKeyResponse> => {
    const { data } = await apiClient.post<CreateApiKeyResponse>('/api-keys', dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api-keys/${id}`);
  },
};

export default apiKeysService;
