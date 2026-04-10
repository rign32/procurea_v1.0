import apiClient from './api.client';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Approval {
  id: string;
  status: ApprovalStatus;
  entityType: string;
  entityId: string;
  reason?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
  requester?: {
    id: string;
    name?: string;
    email: string;
  };
}

export const approvalsService = {
  getAll: async (status?: ApprovalStatus): Promise<Approval[]> => {
    const params = status ? { status } : {};
    const { data } = await apiClient.get<Approval[]>('/approvals', { params });
    return data;
  },

  approve: async (id: string, comments?: string): Promise<Approval> => {
    const { data } = await apiClient.patch<Approval>(`/approvals/${id}/approve`, { comments });
    return data;
  },

  reject: async (id: string, reason?: string): Promise<Approval> => {
    const { data } = await apiClient.patch<Approval>(`/approvals/${id}/reject`, { reason });
    return data;
  },
};

export default approvalsService;
