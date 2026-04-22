import apiClient from './api.client';

export type ContractStatus = 'DRAFT' | 'UNDER_REVIEW' | 'SIGNED' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';

export interface Contract {
  id: string;
  title: string;
  status: ContractStatus;
  terms?: string;
  startDate?: string;
  endDate?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
  offerId: string;
  offer?: {
    id: string;
    price?: number;
    currency?: string;
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
}

export interface CreateContractDto {
  offerId: string;
  title: string;
  terms?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateContractDto {
  title?: string;
  terms?: string;
  startDate?: string;
  endDate?: string;
}

export interface ContractDraft {
  title: string;
  terms: string;
  startDate?: string;
  endDate?: string;
  offerId: string;
}

export interface ContractDraftSource {
  productName: string;
  supplierName: string;
  price: number | null;
  currency: string | null;
  leadTime: number | null;
  incoterms: string | null;
}

export interface GenerateFromOfferResponse {
  draft: ContractDraft;
  source: ContractDraftSource;
}

export const contractsService = {
  getAll: async (status?: ContractStatus): Promise<Contract[]> => {
    const params = status ? { status } : {};
    const { data } = await apiClient.get<Contract[]>('/contracts', { params });
    return data;
  },

  create: async (dto: CreateContractDto): Promise<Contract> => {
    const { data } = await apiClient.post<Contract>('/contracts', dto);
    return data;
  },

  update: async (id: string, dto: UpdateContractDto): Promise<Contract> => {
    const { data } = await apiClient.patch<Contract>(`/contracts/${id}`, dto);
    return data;
  },

  updateStatus: async (id: string, status: ContractStatus, comments?: string): Promise<Contract> => {
    const { data } = await apiClient.patch<Contract>(`/contracts/${id}/status`, { status, comments });
    return data;
  },

  generateFromOffer: async (offerId: string): Promise<GenerateFromOfferResponse> => {
    const { data } = await apiClient.post<GenerateFromOfferResponse>(
      '/contracts/generate-from-offer',
      { offerId },
    );
    return data;
  },

  expressSignAndPO: async (
    offerId: string,
  ): Promise<{
    contract: { id: string; status: string };
    po: { id: string; poNumber?: string; status?: string };
  }> => {
    const { data } = await apiClient.post(`/contracts/express-sign-and-po`, { offerId });
    return data;
  },
};

export default contractsService;
