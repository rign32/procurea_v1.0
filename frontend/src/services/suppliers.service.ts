import apiClient from './api.client';
import type {
  Supplier,
  UpdateSupplierDto,
  SupplierFilters,
  SupplierPerformance,
  CompanyRegistry,
  RegistryFilters,
  RecommendationsResponse,
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
   * Pobierz metryki wydajności dostawcy (scorecard)
   */
  getPerformance: async (id: string): Promise<SupplierPerformance> => {
    const { data } = await apiClient.get<SupplierPerformance>(`/suppliers/${id}/performance`);
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
   * Pobierz rekomendowanych dostawców na podstawie kryteriów
   */
  getRecommendations: async (params: {
    productName?: string;
    category?: string;
    country?: string;
    limit?: number;
  }): Promise<RecommendationsResponse> => {
    const { data } = await apiClient.get<RecommendationsResponse>('/suppliers/recommendations', {
      params,
    });
    return data;
  },

  /**
   * Update supplier internal notes and tags
   */
  updateNotes: async (id: string, body: { internalNotes?: string; internalTags?: string[] }): Promise<Supplier> => {
    const { data } = await apiClient.patch<Supplier>(`/suppliers/${id}/notes`, body);
    return data;
  },

  /**
   * Import suppliers from CSV/XLSX file
   */
  importSuppliers: async (file: File, campaignId: string): Promise<{ imported: number; skipped: number; errors: string[] }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('campaignId', campaignId);
    const { data } = await apiClient.post('/suppliers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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

  /**
   * Re-run VIES VAT verification for a single supplier.
   * On success (VAT valid) promotes all PIPELINE certs to VERIFIED server-side.
   */
  verifyVat: async (supplierId: string): Promise<VerifyVatResult> => {
    const { data } = await apiClient.post<VerifyVatResult>(`/suppliers/${supplierId}/verify-vat`);
    return data;
  },

  /**
   * Bulk VIES re-check across all suppliers in a campaign.
   */
  verifyVatForCampaign: async (campaignId: string): Promise<VerifyVatSummary> => {
    const { data } = await apiClient.post<VerifyVatSummary>(
      `/suppliers/campaign/${campaignId}/verify-vat`,
    );
    return data;
  },
};

export interface VerifyVatResult {
  status: 'verified' | 'invalid' | 'no_vat_found' | 'api_unavailable' | 'no_website';
  vatCountry?: string;
  vatNumber?: string;
  registeredName?: string;
  registeredAddress?: string;
}

export interface VerifyVatSummary {
  total: number;
  verified: number;
  invalid: number;
  noVatFound: number;
  apiUnavailable: number;
  noWebsite: number;
}

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
