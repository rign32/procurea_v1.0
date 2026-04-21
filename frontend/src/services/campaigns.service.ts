/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from './api.client';
import { isEN } from '@/i18n';
import type {
  Campaign,
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignLog,
} from '../types/campaign.types';

/**
 * Infer log level from message content (backend doesn't send levels in WS/logs)
 */
export function inferLogLevel(message: string): 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' {
  if (!message) return 'INFO';
  if (message.includes('Error') || message.includes('FAILED') || message.includes('REJECTED') || message.includes('❌')) return 'ERROR';
  if (message.includes('QUALIFIED') || message.includes('✅') || message.includes('COMPLETED') || message.includes('SUCCESS')) return 'SUCCESS';
  if (message.includes('Skipped') || message.includes('NO EMAIL') || message.includes('DUPLICATE') || message.includes('⚠')) return 'WARNING';
  return 'INFO';
}

/**
 * Campaigns Service - API calls dla kampanii sourcingowych
 */
export const campaignsService = {
  /**
   * Pobierz wszystkie kampanie użytkownika
   * Backend zwraca plain array z stats object
   */
  getAll: async (): Promise<Campaign[]> => {
    const { data } = await apiClient.get<any>('/campaigns');
    // Support both paginated { data, total } and legacy plain array responses
    const items = Array.isArray(data) ? data : (data?.data || []);
    return items.map((c: any) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      stage: c.stage,
      createdAt: c.createdAt,
      updatedAt: c.createdAt,
      rfqRequest: c.rfqRequest,
      suppliersFound: c.stats?.suppliersFound || 0,
      suppliersQualified: c.stats?.suppliersContacted || 0,
      pendingOffers: c.stats?.pendingOffers || 0,
    })) as Campaign[];
  },

  /**
   * Pobierz szczegóły kampanii (z dostawcami)
   * Backend zwraca: { ...campaign, suppliers: [...], logs: ["string", ...], results: [...] }
   */
  getById: async (id: string): Promise<Campaign> => {
    const { data } = await apiClient.get<any>(`/campaigns/${id}`);
    return {
      id: data.id,
      name: data.name,
      status: data.status,
      stage: data.stage,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt || data.createdAt,
      apolloEnrichmentStatus: data.apolloEnrichmentStatus || null,
      rfqRequest: data.rfqRequest,
      suppliers: (data.suppliers || []).map((s: any) => ({
        ...s,
        analysisScore: s.analysisScore || s.analysis?.suitabilityScore || 0,
        analysisReason: s.analysisReason || s.analysis?.reasoning || '',
      })),
      suppliersFound: data.suppliers?.length || 0,
      logs: (data.logs || []).map((msg: any, idx: number) => ({
        id: String(idx),
        campaignId: data.id,
        message: typeof msg === 'string' ? msg : msg.message,
        level: inferLogLevel(typeof msg === 'string' ? msg : msg.message),
        timestamp: data.createdAt,
      })),
    } as Campaign;
  },

  /**
   * Pobierz logi kampanii (real-time fallback via polling)
   * Backend zwraca: { logs: [{ message, timestamp }], status, stage, suppliersFound }
   */
  getLogs: async (
    id: string,
    since?: string
  ): Promise<{
    logs: CampaignLog[];
    status: string;
    stage: string;
    suppliersFound: number;
    suppliers: any[];
  }> => {
    const params = since ? { since } : {};
    const { data } = await apiClient.get<any>(`/campaigns/${id}/logs`, { params });

    return {
      logs: (data.logs || []).map((log: any, idx: number) => ({
        id: `${log.timestamp || idx}-${idx}`,
        campaignId: id,
        message: typeof log === 'string' ? log : log.message,
        level: inferLogLevel(typeof log === 'string' ? log : log.message),
        timestamp: log.timestamp || new Date().toISOString(),
      })),
      status: data.status,
      stage: data.stage,
      suppliersFound: data.suppliersFound,
      suppliers: (data.suppliers || []).map((s: any) => ({
        ...s,
        analysisScore: s.analysisScore || 0,
        analysisReason: s.analysisReason || '',
      })),
    };
  },

  /**
   * Utwórz nową kampanię (uruchamia AI pipeline)
   * Transformuje flat frontend DTO na nested backend format: { name, searchCriteria: {...} }
   */
  create: async (dto: CreateCampaignDto): Promise<{ id: string; status: string }> => {
    const backendDto = {
      name: dto.name,
      language: isEN ? 'en' : 'pl',
      sequenceTemplateId: dto.sequenceTemplateId,
      searchCriteria: {
        region: dto.targetRegion || 'EU',
        targetCountries: dto.targetCountries,
        excludedCountries: dto.excludedCountries,
        material: dto.material,
        eau: dto.eau,
        quantity: dto.quantity,
        keywords: [dto.productName?.replace(/^Kampania:\s*/i, '').trim()].filter(Boolean),
        description: dto.description || dto.productName,
        deliveryLocationId: dto.deliveryLocationId,
        incoterms: dto.incoterms,
        desiredDeliveryDate: dto.desiredDeliveryDate,
        supplierTypes: dto.supplierTypes || ['PRODUCENT'],
        requiredCertificates: dto.requiredCertificates || [],
      },
    };
    const { data } = await apiClient.post<any>('/campaigns', backendDto);
    return { id: data.id, status: data.status };
  },

  /**
   * Aktualizuj status kampanii
   */
  updateStatus: async (id: string, status: Campaign['status']): Promise<Campaign> => {
    const { data } = await apiClient.patch<Campaign>(`/campaigns/${id}/status`, { status });
    return data;
  },

  update: async (id: string, dto: UpdateCampaignDto): Promise<Campaign> => {
    const { data } = await apiClient.patch<Campaign>(`/campaigns/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/campaigns/${id}`);
  },

  /** Backend returns an xlsx blob despite the historic `exportCSV` name. */
  exportCSV: async (id: string): Promise<Blob> => {
    const { data } = await apiClient.get(`/campaigns/${id}/export`, { responseType: 'blob' });
    return data;
  },

  downloadPdf: async (id: string): Promise<Blob> => {
    const { data } = await apiClient.get(`/reports/campaign/${id}/pdf`, { responseType: 'blob' });
    return data;
  },

  downloadPptx: async (id: string): Promise<Blob> => {
    const { data } = await apiClient.get(`/reports/campaign/${id}/pptx`, { responseType: 'blob' });
    return data;
  },

  // --- Apollo.io Enrichment (DEV ONLY) ---

  startApolloEnrichment: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.post<{ success: boolean; message: string }>(`/campaigns/${id}/apollo-enrich`);
    return data;
  },

  getCampaignContacts: async (id: string): Promise<any[]> => {
    const { data } = await apiClient.get<any[]>(`/campaigns/${id}/contacts`);
    return data;
  },

  getAllContacts: async (params?: { campaignId?: string; emailStatus?: string; search?: string }): Promise<any[]> => {
    const { data } = await apiClient.get<any[]>('/contacts', { params });
    return data;
  },

  createContact: async (dto: {
    supplierId: string;
    name: string;
    role?: string;
    email?: string;
    phone?: string;
  }): Promise<any> => {
    const { data } = await apiClient.post('/contacts', dto);
    return data;
  },

  updateContact: async (id: string, dto: {
    name?: string;
    role?: string;
    email?: string;
    phone?: string;
  }): Promise<any> => {
    const { data } = await apiClient.patch(`/contacts/${id}`, dto);
    return data;
  },

  deleteContact: async (id: string): Promise<void> => {
    await apiClient.delete(`/contacts/${id}`);
  },

  // --- Campaign Cloning ---

  clone: async (id: string): Promise<{ id: string; status: string }> => {
    const { data } = await apiClient.post<any>(`/campaigns/${id}/clone`);
    return { id: data.id, status: data.status };
  },
};

export default campaignsService;
