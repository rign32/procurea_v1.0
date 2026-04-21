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
    // Multi-SKU / BOQ line items (Sprint #4 + Faza 2B)
    lineItems?: Array<{
      id: string;
      sortOrder: number;
      sku: string | null;
      name: string;
      description: string | null;
      material: string | null;
      quantity: number;
      unit: string;
      targetPrice: number | null;
      requiredCerts: string[] | null;
      quote: {
        unitPrice: number | null;
        currency: string | null;
        moq: number | null;
        leadTime: number | null;
        altDescription: string | null;
        altMaterial: string | null;
        notes: string | null;
      } | null;
    }>;
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
    logoUrl: string | null;
    primaryColor: string | null;
    accentColor: string | null;
    portalWelcomeText: string | null;
  } | null;
  supplier: {
    name: string | null;
    country: string | null;
  };
  portalLanguage: string;
}

export interface OfferAttachment {
  filename: string;
  originalName: string;
  url: string;
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
  attachments?: OfferAttachment[];
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

  uploadFile: async (accessToken: string, file: File): Promise<{ id: string; filename: string; storedFilename: string; url: string; size: number; mimeType: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post(`/portal/offers/${accessToken}/upload`, formData, {
      headers: { 'Content-Type': undefined },
    });
    return data;
  },

  getTranslations: async (langCode: string): Promise<any> => {
    const { data } = await apiClient.get(`/portal/translations/${langCode}`);
    return data;
  },

  uploadCertificate: async (
    accessToken: string,
    file: File,
    meta: {
      type: string;
      code: string;
      validUntil: string; // ISO date (yyyy-mm-dd)
      issuer?: string;
      certNumber?: string;
      issuedAt?: string;
    },
  ): Promise<{
    certificate: {
      id: string;
      type: string;
      code: string;
      validUntil: string;
      status: string;
      document: { id: string; originalName: string; url: string } | null;
    };
    document: { id: string; originalName: string; url: string };
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', meta.type);
    formData.append('code', meta.code);
    formData.append('validUntil', meta.validUntil);
    if (meta.issuer) formData.append('issuer', meta.issuer);
    if (meta.certNumber) formData.append('certNumber', meta.certNumber);
    if (meta.issuedAt) formData.append('issuedAt', meta.issuedAt);
    const { data } = await apiClient.post(
      `/portal/offers/${accessToken}/certificate`,
      formData,
      { headers: { 'Content-Type': undefined } },
    );
    return data;
  },

  // Supplier-side per-line quote save (Faza 2B follow-up)
  saveLineItems: async (
    accessToken: string,
    items: Array<{
      rfqLineItemId: string;
      unitPrice?: number;
      currency?: string;
      moq?: number;
      leadTime?: number;
      altDescription?: string;
      altMaterial?: string;
      notes?: string;
    }>,
  ): Promise<{ saved: number }> => {
    const { data } = await apiClient.post(
      `/portal/offers/${accessToken}/line-items`,
      { items },
    );
    return data;
  },
};

export default portalService;
