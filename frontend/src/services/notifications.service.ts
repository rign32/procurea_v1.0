import apiClient from './api.client';

export interface Notification {
  id: string;
  userId: string;
  type: string; // "approval_request" | "offer_submitted" | "campaign_completed" | "comment_mention"
  title: string;
  message?: string;
  entityType?: string; // "campaign" | "supplier" | "rfq" | "approval"
  entityId?: string;
  read: boolean;
  createdAt: string;
}

export const notificationsService = {
  getAll: async (unreadOnly = false): Promise<Notification[]> => {
    const params = unreadOnly ? { unreadOnly: 'true' } : {};
    const { data } = await apiClient.get<Notification[]>('/notifications', { params });
    return data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return data.count;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const { data } = await apiClient.patch<Notification>(`/notifications/${id}/read`);
    return data;
  },

  markAllRead: async (): Promise<{ updated: number }> => {
    const { data } = await apiClient.post<{ updated: number }>('/notifications/mark-all-read');
    return data;
  },
};

export default notificationsService;
