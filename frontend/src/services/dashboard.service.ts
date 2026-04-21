import { apiClient } from './api.client';

export interface DashboardStats {
  campaigns: {
    total: number;
    active: number;
    completed: number;
  };
  suppliers: {
    total: number;
    last30d: number;
    shortlisted: number;
    /** Mean analysisScore across top-decile suppliers, scaled 0–100. `null` when no data. */
    avgMatchTopDecile: number | null;
  };
  offers: {
    pending: number;
    expiringSoon: number;
  };
  attention: {
    pendingApprovals: number;
    stuckCampaigns: Array<{
      id: string;
      name: string;
      stage: string;
      stuckSince: string;
    }>;
    zeroSupplierCampaigns7d: number;
  };
}

export interface DashboardActivityEvent {
  id: string;
  type: 'campaign' | 'offer' | 'audit';
  tone: 'ok' | 'warn' | 'info';
  text: string;
  ts: string;
  href?: string;
}

const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<DashboardStats>('/dashboard/stats');
    return data;
  },

  getActivity: async (limit: number = 20): Promise<DashboardActivityEvent[]> => {
    const { data } = await apiClient.get<DashboardActivityEvent[]>('/dashboard/activity', {
      params: { limit },
    });
    return data;
  },
};

export default dashboardService;
