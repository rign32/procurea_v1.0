import apiClient from './api.client';
import type {
  Supplier,
  UpdateSupplierDto,
  SupplierFilters,
  CompanyRegistry,
  RegistryFilters,
} from '../types/supplier.types';
import type {
  GetSuppliersResponse,
  GetSupplierDetailResponse,
  GetRegistryResponse,
} from '../types/api.types';

/**
 * Suppliers Service - API calls dla dostawców
 */
export const suppliersService = {
  /**
   * Pobierz wszystkich dostawców (z filtrami)
   */
  getAll: async (filters?: SupplierFilters): Promise<{ suppliers: Supplier[]; total: number }> => {
    const { campaignIds, ...rest } = filters || {};
    const params: any = { ...rest };
    if (campaignIds && campaignIds.length > 0) {
      params.campaignIds = campaignIds.join(',');
    }
    const { data } = await apiClient.get<GetSuppliersResponse>('/suppliers', {
      params,
    });
    return {
      suppliers: data.suppliers as Supplier[],
      total: data.total,
    };
  },

  /**
   * Pobierz szczegóły dostawcy
   */
  getById: async (id: string): Promise<Supplier> => {
    const { data } = await apiClient.get<GetSupplierDetailResponse>(`/suppliers/${id}`);
    return data as Supplier;
  },

  /**
   * Aktualizuj dane dostawcy
   */
  update: async (id: string, dto: UpdateSupplierDto): Promise<Supplier> => {
    const { data } = await apiClient.patch<Supplier>(`/suppliers/${id}`, dto);
    return data;
  },

  /**
   * Oznacz dostawcę jako zweryfikowany
   */
  markVerified: async (id: string): Promise<Supplier> => {
    const { data } = await apiClient.post<Supplier>(`/suppliers/${id}/verify`);
    return data;
  },

  /**
   * Dodaj dostawcę do czarnej listy
   */
  blacklist: async (id: string, reason?: string): Promise<Supplier> => {
    const { data } = await apiClient.post<Supplier>(`/suppliers/${id}/blacklist`, {
      reason,
    });
    return data;
  },

  /**
   * Wyklucz dostawcę z kampanii (soft-delete)
   */
  exclude: async (id: string, reason?: string): Promise<Supplier> => {
    const { data } = await apiClient.post<Supplier>(`/suppliers/${id}/exclude`, { reason });
    return data;
  },

  /**
   * Eksportuj dostawców do CSV
   */
  exportCSV: async (filters?: SupplierFilters): Promise<Blob> => {
    const { data } = await apiClient.get('/suppliers/export', {
      params: filters,
      responseType: 'blob',
    });
    return data;
  },
};

/**
 * Registry Service - API calls dla Company Registry (global knowledge base)
 */
export const registryService = {
  /**
   * Pobierz firmy z rejestru (z filtrami i statystykami)
   */
  getAll: async (filters?: RegistryFilters): Promise<{
    companies: CompanyRegistry[];
    total: number;
    stats: {
      totalCompanies: number;
      withEmails: number;
      verified: number;
      blacklisted: number;
      averageQuality: number;
    };
  }> => {
    const { data } = await apiClient.get<GetRegistryResponse>('/registry', {
      params: filters,
    });
    return {
      companies: data.companies as CompanyRegistry[],
      total: data.total,
      stats: data.stats,
    };
  },

  /**
   * Pobierz szczegóły firmy z rejestru
   */
  getById: async (id: string): Promise<CompanyRegistry> => {
    const { data } = await apiClient.get<CompanyRegistry>(`/registry/${id}`);
    return data;
  },

  /**
   * Pobierz firmę po domenie
   */
  getByDomain: async (domain: string): Promise<CompanyRegistry | null> => {
    const { data } = await apiClient.get<CompanyRegistry>(`/registry/domain/${domain}`);
    return data;
  },

  /**
   * Weryfikacja grupowa firm
   */
  bulkVerify: async (ids: string[]): Promise<{ verified: number }> => {
    const { data } = await apiClient.post('/registry/bulk-verify', { ids });
    return data;
  },

  /**
   * Eksportuj rejestr do CSV
   */
  exportCSV: async (filters?: RegistryFilters): Promise<Blob> => {
    const { data } = await apiClient.get('/registry/export', {
      params: filters,
      responseType: 'blob',
    });
    return data;
  },
};

export default suppliersService;
