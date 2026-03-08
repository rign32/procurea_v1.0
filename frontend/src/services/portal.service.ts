import apiClient from './api.client';

export interface PriceTier {
  id?: string;
  minQty: number;
  maxQty?: number | null;
  unitPrice: number;
}

export interface AlternativeOffer {
  id: string;
  altDescription: string | null;
  altMaterial: string | null;
  price: number | null;
  currency: string | null;
  moq: number | null;
  leadTime: number | null;
  validityDate: string | null;
  comments: string | null;
  priceTiers: PriceTier[];
}

export interface PortalOfferView {
  offer: {
    id: string;
    status: string;
    price: number | null;
    currency: string | null;
    moq: number | null;
    leadTime: number | null;
    validityDate: string | null;
    comments: string | null;
    specsConfirmed: boolean;
    incotermsConfirmed: boolean;
    viewedAt: string | null;
    submittedAt: string | null;
    priceTiers: PriceTier[];
    alternatives: AlternativeOffer[];
  };
  rfq: {
    productName: string;
    partNumber: string | null;
    category: string | null;
    material: string | null;
    description: string | null;
    quantity: number;
    eau: number | null;
    unit: string;
    currency: string;
    incoterms: string | null;
    desiredDeliveryDate: string | null;
    attachments: Array<{
      id: string;
      filename: string;
      storedFilename: string;
      url: string;
      size: number;
      mimeType: string;
    }>;
    deliveryLocation: {
      name: string;
      address: string;
    } | null;
  };
  organization: {
    name: string;
    footerEnabled: boolean;
    footerFirstName: string | null;
    footerLastName: string | null;
    footerCompany: string | null;
    footerPosition: string | null;
    footerEmail: string | null;
    footerPhone: string | null;
  } | null;
  supplier: {
    name: string | null;
    country: string | null;
  };
  portalLanguage: string;
}

export interface SubmitOfferDto {
  currency: string;
  moq?: number;
  leadTime?: number;
  validityDate?: string;
  comments?: string;
  specsConfirmed?: boolean;
  incotermsConfirmed?: boolean;
  priceTiers: Array<{
    minQty: number;
    maxQty?: number;
    unitPrice: number;
  }>;
  alternative?: {
    altDescription: string;
    altMaterial?: string;
    moq?: number;
    leadTime?: number;
    validityDate?: string;
    comments?: string;
    priceTiers: Array<{
      minQty: number;
      maxQty?: number;
      unitPrice: number;
    }>;
  };
  submissionLanguage?: string;
}

export const portalService = {
  getOffer: async (accessToken: string): Promise<PortalOfferView> => {
    const { data } = await apiClient.get<PortalOfferView>(`/portal/offers/${accessToken}`);
    return data;
  },

  submitOffer: async (accessToken: string, dto: SubmitOfferDto): Promise<{ success: boolean; offerId: string; status: string }> => {
    const { data } = await apiClient.post(`/portal/offers/${accessToken}/submit`, dto);
    return data;
  },

  getTranslations: async (langCode: string): Promise<any> => {
    const { data } = await apiClient.get(`/portal/translations/${langCode}`);
    return data;
  },
};

export default portalService;
