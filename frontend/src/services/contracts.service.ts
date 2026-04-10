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
};

export default contractsService;
