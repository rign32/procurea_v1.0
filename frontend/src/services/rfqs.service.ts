import apiClient from './api.client';
import type { RfqRequest, Offer, CreateRfqDto, UpdateRfqDto } from '../types/campaign.types';
import type { GetRfqsResponse, GetRfqDetailResponse } from '../types/api.types';

/**
 * RFQs Service - API calls dla Request for Quotation
 */
export const rfqsService = {
  /**
   * Pobierz wszystkie RFQ użytkownika
   */
  getAll: async (status?: RfqRequest['status']): Promise<{ rfqs: RfqRequest[]; total: number }> => {
    const params = status ? { status } : {};
    const { data } = await apiClient.get<GetRfqsResponse>('/requests', { params });
    return {
      rfqs: data.rfqs as RfqRequest[],
      total: data.total,
    };
  },

  /**
   * Pobierz szczegóły RFQ (z ofertami)
   */
  getById: async (id: string): Promise<RfqRequest> => {
    const { data } = await apiClient.get<GetRfqDetailResponse>(`/requests/${id}`);
    return data as RfqRequest;
  },

  /**
   * Utwórz nowe RFQ
   */
  create: async (dto: CreateRfqDto): Promise<RfqRequest> => {
    const { data } = await apiClient.post<RfqRequest>('/requests', dto);
    return data;
  },

  /**
   * Aktualizuj RFQ
   */
  update: async (id: string, dto: UpdateRfqDto): Promise<RfqRequest> => {
    const { data } = await apiClient.patch<RfqRequest>(`/requests/${id}`, dto);
    return data;
  },

  /**
   * Usuń RFQ
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/requests/${id}`);
  },

  /**
   * Eksportuj RFQ do PDF
   */
  exportPDF: async (id: string): Promise<Blob> => {
    const { data } = await apiClient.get(`/requests/${id}/export`, {
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Wyślij RFQ do wszystkich dostawców z kampanii
   */
  sendToAllSuppliers: async (
    id: string,
    campaignId: string
  ): Promise<{ sent: number; failed: number }> => {
    const { data } = await apiClient.post(`/requests/${id}/send-to-campaign`, {
      campaignId,
    });
    return data;
  },

  /**
   * Wyślij RFQ do konkretnych dostawców
   */
  sendToSuppliers: async (
    id: string,
    supplierIds: string[]
  ): Promise<{ sent: number; failed: number }> => {
    const { data } = await apiClient.post(`/requests/${id}/send`, {
      supplierIds,
    });
    return data;
  },
};

/**
 * Offers Service - API calls dla ofert od dostawców
 */
export const offersService = {
  /**
   * Pobierz wszystkie oferty dla RFQ
   */
  getByRfq: async (rfqId: string): Promise<Offer[]> => {
    const { data } = await apiClient.get<Offer[]>(`/requests/${rfqId}/offers`);
    return data;
  },

  /**
   * Pobierz szczegóły oferty
   */
  getById: async (id: string): Promise<Offer> => {
    const { data } = await apiClient.get<Offer>(`/requests/offers/${id}`);
    return data;
  },

  /**
   * Utwórz ofertę (supplier submit)
   */
  create: async (offer: {
    rfqRequestId: string;
    supplierId: string;
    price?: number;
    currency?: string;
    moq?: number;
    leadTime?: string;
    validityDate?: string;
  }): Promise<Offer> => {
    const { data } = await apiClient.post<Offer>('/requests/offers', offer);
    return data;
  },

  /**
   * Aktualizuj status oferty
   */
  updateStatus: async (id: string, status: Offer['status']): Promise<Offer> => {
    const { data } = await apiClient.patch<Offer>(`/requests/offers/${id}`, {
      status,
    });
    return data;
  },

  /**
   * Akceptuj ofertę (transakcja - odrzuca pozostałe, zamyka RFQ)
   */
  accept: async (id: string): Promise<Offer> => {
    const { data } = await apiClient.post<Offer>(`/requests/offers/${id}/accept`);
    return data;
  },

  /**
   * Odrzuć ofertę
   */
  reject: async (id: string, reason?: string): Promise<Offer> => {
    const { data } = await apiClient.post<Offer>(`/requests/offers/${id}/reject`, {
      reason,
    });
    return data;
  },

  /**
   * Dodaj ofertę do shortlisty
   */
  shortlist: async (id: string): Promise<Offer> => {
    const { data } = await apiClient.post<Offer>(`/requests/offers/${id}/shortlist`);
    return data;
  },

  /**
   * Porównaj oferty
   */
  compare: async (offerIds: string[]): Promise<{
    offers: Offer[];
    comparison: {
      lowestPrice: Offer;
      fastestDelivery: Offer;
      bestValue: Offer;
    };
  }> => {
    const { data } = await apiClient.post('/requests/offers/compare', {
      offerIds,
    });
    return data;
  },

  /**
   * Pobierz link do portalu dostawcy dla oferty
   */
  getPortalLink: async (offerId: string): Promise<{ portalUrl: string; expiresAt: string }> => {
    const { data } = await apiClient.get(`/requests/offers/${offerId}/portal-link`);
    return data;
  },

  /**
   * Wyślij ponownie email z linkiem do RFQ
   */
  resendEmail: async (offerId: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.post(`/requests/offers/${offerId}/resend-email`);
    return data;
  },

  /**
   * Złóż kontrpropozycję do oferty
   */
  counterOffer: async (offerId: string, terms: { price?: number; moq?: number; leadTime?: number; comments?: string }) => {
    const { data } = await apiClient.post(`/requests/offers/${offerId}/counter`, terms);
    return data;
  },
};

export default rfqsService;
