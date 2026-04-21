import apiClient from './api.client';
import type { RfqRequest, Offer, CreateRfqDto, UpdateRfqDto } from '../types/campaign.types';
import type { GetRfqsResponse, GetRfqDetailResponse } from '../types/api.types';

export interface RankingWeights {
  price: number;
  leadTime: number;
  moq: number;
  quality: number;
  compliance: number;
}

export interface RankingBreakdown {
  priceScore: number;
  leadTimeScore: number;
  moqScore: number;
  qualityScore: number;
  complianceScore: number;
  finalScore: number;
}

/** Offer as returned by the /offers/compare endpoint — base Offer + fields
 *  the backend adds at comparison time (price conversion, risk flags,
 *  weighted ranking breakdown). Kept as one type so the detail page can
 *  stop using `any` on every map/find. */
export interface ComparisonOffer extends Offer {
  /** Price converted to the comparison baseCurrency. Server-side currency
   *  conversion; may be null when the FX provider was unreachable. */
  convertedPrice?: number | null;
  conversionFailed?: boolean;
  /** Supplier.qualityScore denormalised onto the offer (0-100). */
  qualityScore?: number | null;
  riskFlags?: {
    isNewSupplier: boolean;
    leadTimeRisk: boolean;
    priceOutlier: boolean;
  };
  compliance?: {
    specsConfirmed: boolean;
    incotermsConfirmed: boolean;
  };
  weightedRanking?: RankingBreakdown | null;
}

export interface ComparisonResult {
  offers: ComparisonOffer[];
  baseCurrency: string;
  comparison: {
    lowestPrice: { offerId: string; supplierId: string } | null;
    fastestDelivery: { offerId: string; supplierId: string } | null;
    bestValue: { offerId: string; supplierId: string } | null;
    topRanked: { offerId: string; supplierId: string; score: number } | null;
  };
  ranking: {
    weights: RankingWeights;
    weightsSource: 'override' | 'rfq-configured' | 'default';
  };
  aiRecommendation?: {
    recommendedOfferId: string;
    reasoning: string;
    scores?: Array<{
      offerId: string;
      score: number;
      breakdown: { price: number; delivery: number; quality: number; compliance: number };
    }>;
  } | null;
}

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  price: 0.25,
  leadTime: 0.2,
  moq: 0.15,
  quality: 0.25,
  compliance: 0.15,
};

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
   * Porównaj oferty (z opcjonalnymi wagami rankingowymi)
   */
  compare: async (
    offerIds: string[],
    rankingWeights?: Partial<RankingWeights>,
  ): Promise<ComparisonResult> => {
    const { data } = await apiClient.post('/requests/offers/compare', {
      offerIds,
      rankingWeights,
    });
    return data;
  },

  /**
   * Pobierz wagi rankingowe dla RFQ (z fallback do defaults)
   */
  getRankingWeights: async (rfqId: string): Promise<RankingWeights> => {
    const { data } = await apiClient.get<{ weights: RankingWeights }>(
      `/requests/${rfqId}/ranking-weights`,
    );
    return data.weights;
  },

  /**
   * Zapisz wagi rankingowe na RFQ (persystencja dla kolejnych porównań)
   */
  setRankingWeights: async (
    rfqId: string,
    weights: Partial<RankingWeights>,
  ): Promise<RankingWeights> => {
    const { data } = await apiClient.post<{ weights: RankingWeights }>(
      `/requests/${rfqId}/ranking-weights`,
      { weights },
    );
    return data.weights;
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

  /**
   * Pobierz sugestię AI counter-offer dla oferty
   */
  suggestCounter: async (offerId: string): Promise<{
    suggestedTerms: { price?: number; leadTime?: number; moq?: number; comments?: string };
    reasoning: string;
    savingsEstimate?: { percentage: number; absoluteAmount: number; currency: string };
  }> => {
    const { data } = await apiClient.post(`/requests/offers/${offerId}/suggest-counter`);
    return data;
  },
};

export default rfqsService;
