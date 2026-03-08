import apiClient from './api.client';

export interface SequenceStep {
  id: string;
  dayOffset: number;
  type: 'INITIAL' | 'REMINDER' | 'FINAL';
  subject: string;
  bodySnippet: string;
  templateId: string;
}

export interface SequenceTemplate {
  id: string;
  name: string;
  isSystem: boolean;
  steps: SequenceStep[];
  createdAt: string;
  updatedAt: string;
}

export interface EmailPreviewResponse {
  subject: string;
  html: string;
}

export const sequencesService = {
  getAll: async (): Promise<SequenceTemplate[]> => {
    const { data } = await apiClient.get<SequenceTemplate[]>('/sequences');
    return data;
  },

  getById: async (id: string): Promise<SequenceTemplate> => {
    const { data } = await apiClient.get<SequenceTemplate>(`/sequences/${id}`);
    return data;
  },

  create: async (name: string): Promise<SequenceTemplate> => {
    const { data } = await apiClient.post<SequenceTemplate>('/sequences', { name });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/sequences/${id}`);
  },

  clone: async (id: string, name: string): Promise<SequenceTemplate> => {
    const { data } = await apiClient.post<SequenceTemplate>(`/sequences/${id}/clone`, { name });
    return data;
  },

  addStep: async (templateId: string, step: {
    dayOffset: number;
    type: string;
    subject: string;
    bodySnippet: string;
  }): Promise<SequenceStep> => {
    const { data } = await apiClient.post<SequenceStep>(`/sequences/${templateId}/steps`, step);
    return data;
  },

  updateStep: async (stepId: string, update: {
    subject?: string;
    body?: string;
  }): Promise<SequenceStep> => {
    const { data } = await apiClient.patch<SequenceStep>(`/sequences/steps/${stepId}`, update);
    return data;
  },

  deleteStep: async (stepId: string): Promise<void> => {
    await apiClient.delete(`/sequences/steps/${stepId}`);
  },

  previewEmail: async (params: {
    stepId?: string;
    subject?: string;
    bodySnippet?: string;
    organizationId?: string;
    sampleData?: {
      productName?: string;
      senderName?: string;
      senderCompany?: string;
      supplierName?: string;
      quantity?: string;
      currency?: string;
    };
  }): Promise<EmailPreviewResponse> => {
    const { data } = await apiClient.post<EmailPreviewResponse>('/email/preview', params);
    return data;
  },
};

export default sequencesService;
