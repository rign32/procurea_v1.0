import apiClient from './api.client';

export interface RfqLineItem {
  id: string;
  rfqRequestId: string;
  sortOrder: number;
  sku: string | null;
  name: string;
  description: string | null;
  material: string | null;
  quantity: number;
  unit: string;
  targetPrice: number | null;
  requiredCerts: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface LineItemInput {
  sku?: string;
  name: string;
  description?: string;
  material?: string;
  quantity: number;
  unit?: string;
  targetPrice?: number;
  requiredCerts?: string[];
  sortOrder?: number;
}

export const rfqLineItemsService = {
  list: async (rfqId: string): Promise<{ items: RfqLineItem[] }> => {
    const { data } = await apiClient.get(`/requests/${rfqId}/line-items`);
    return data;
  },

  add: async (rfqId: string, item: LineItemInput): Promise<RfqLineItem> => {
    const { data } = await apiClient.post(`/requests/${rfqId}/line-items`, item);
    return data;
  },

  bulkReplace: async (
    rfqId: string,
    items: LineItemInput[],
  ): Promise<{ items: RfqLineItem[] }> => {
    const { data } = await apiClient.post(
      `/requests/${rfqId}/line-items/bulk-replace`,
      { items },
    );
    return data;
  },

  remove: async (rfqId: string, lineItemId: string): Promise<void> => {
    await apiClient.delete(`/requests/${rfqId}/line-items/${lineItemId}`);
  },
};
