import apiClient from './api.client';

export type POStatus = 'DRAFT' | 'SUBMITTED' | 'CONFIRMED' | 'DELIVERED' | 'INVOICED' | 'CANCELLED';

export interface PurchaseOrderLine {
  id: string;
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  totalPrice: number;
  sortOrder: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber?: string;
  status: POStatus;
  totalAmount?: number;
  currency?: string;
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  contractId: string;
  contract?: {
    id: string;
    title: string;
  };
  offerId: string;
  offer?: {
    id: string;
    supplier?: {
      id: string;
      name: string;
      country?: string;
    };
    rfqRequest?: {
      id: string;
      productName: string;
    };
  };
  lines?: PurchaseOrderLine[];
  createdBy?: {
    id: string;
    name?: string;
    email: string;
  };
}

export const purchaseOrdersService = {
  getAll: async (status?: POStatus): Promise<PurchaseOrder[]> => {
    const params = status ? { status } : {};
    const { data } = await apiClient.get<PurchaseOrder[]>('/purchase-orders', { params });
    return data;
  },

  getOne: async (id: string): Promise<PurchaseOrder> => {
    const { data } = await apiClient.get<PurchaseOrder>(`/purchase-orders/${id}`);
    return data;
  },

  generate: async (contractId: string): Promise<PurchaseOrder> => {
    const { data } = await apiClient.post<PurchaseOrder>('/purchase-orders/generate', { contractId });
    return data;
  },

  updateStatus: async (id: string, status: POStatus): Promise<PurchaseOrder> => {
    const { data } = await apiClient.patch<PurchaseOrder>(`/purchase-orders/${id}/status`, { status });
    return data;
  },
};

export default purchaseOrdersService;
