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

// --- Faza 2B: per-line offer quotes ---

export interface OfferLineItem {
  id: string;
  offerId: string;
  rfqLineItemId: string;
  unitPrice: number | null;
  currency: string | null;
  moq: number | null;
  leadTime: number | null;
  altDescription: string | null;
  altMaterial: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OfferLineInput {
  rfqLineItemId: string;
  unitPrice?: number;
  currency?: string;
  moq?: number;
  leadTime?: number;
  altDescription?: string;
  altMaterial?: string;
  notes?: string;
}

export interface OfferLinesResponse {
  lines: Array<{
    rfqLine: RfqLineItem;
    offerLine: OfferLineItem | null;
  }>;
}

export const offerLineItemsService = {
  list: async (offerId: string): Promise<OfferLinesResponse> => {
    const { data } = await apiClient.get(
      `/requests/offers/${offerId}/line-items`,
    );
    return data;
  },

  saveAll: async (
    offerId: string,
    items: OfferLineInput[],
  ): Promise<{ items: OfferLineItem[] }> => {
    const { data } = await apiClient.post(
      `/requests/offers/${offerId}/line-items/bulk-replace`,
      { items },
    );
    return data;
  },
};
