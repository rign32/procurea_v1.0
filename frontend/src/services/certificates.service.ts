import apiClient from './api.client';

export const CERTIFICATE_TYPES = [
  'ISO_9001',
  'ISO_14001',
  'ISO_45001',
  'ISO_13485',
  'ISO_22000',
  'IATF_16949',
  'AS_9100',
  'CE',
  'MDR',
  'ROHS',
  'REACH',
  'HACCP',
  'BRCGS',
  'IFS_FOOD',
  'FSC',
  'BSCI',
  'ORGANIC_EU',
  'MSC',
  'KOSHER',
  'HALAL',
  'FAIR_TRADE',
  'OTHER',
] as const;

export type CertificateType = (typeof CERTIFICATE_TYPES)[number];

export const CERTIFICATE_LABELS: Record<CertificateType, string> = {
  ISO_9001: 'ISO 9001',
  ISO_14001: 'ISO 14001',
  ISO_45001: 'ISO 45001',
  ISO_13485: 'ISO 13485',
  ISO_22000: 'ISO 22000',
  IATF_16949: 'IATF 16949',
  AS_9100: 'AS 9100',
  CE: 'CE marking',
  MDR: 'MDR (EU 2017/745)',
  ROHS: 'RoHS',
  REACH: 'REACH',
  HACCP: 'HACCP',
  BRCGS: 'BRCGS',
  IFS_FOOD: 'IFS Food',
  FSC: 'FSC',
  BSCI: 'BSCI',
  ORGANIC_EU: 'Organic EU',
  MSC: 'MSC / ASC',
  KOSHER: 'Kosher',
  HALAL: 'Halal',
  FAIR_TRADE: 'Fair Trade',
  OTHER: 'Other',
};

export type CertificateStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
export type CertificateSource = 'MANUAL' | 'PORTAL';
export type CertificateReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SupplierCertificate {
  id: string;
  supplierId: string;
  type: CertificateType;
  code: string;
  issuer: string | null;
  certNumber: string | null;
  issuedAt: string | null;
  validUntil: string;
  status: CertificateStatus;
  source: CertificateSource;
  reviewStatus: CertificateReviewStatus;
  reviewedAt: string | null;
  reviewedById: string | null;
  reviewNotes: string | null;
  documentId: string | null;
  document: {
    id: string;
    originalName: string;
    url: string;
    mimeType: string;
  } | null;
  lastAlertedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateSummary {
  ACTIVE: number;
  EXPIRING_SOON: number;
  EXPIRED: number;
}

export interface CreateCertificateInput {
  type: CertificateType;
  code: string;
  issuer?: string;
  certNumber?: string;
  issuedAt?: string;
  validUntil: string;
  documentId?: string;
}

export const certificatesService = {
  list: async (
    supplierId: string,
  ): Promise<{ items: SupplierCertificate[]; summary: CertificateSummary }> => {
    const { data } = await apiClient.get(
      `/suppliers/${supplierId}/certificates`,
    );
    return data;
  },

  create: async (
    supplierId: string,
    payload: CreateCertificateInput,
  ): Promise<SupplierCertificate> => {
    const { data } = await apiClient.post(
      `/suppliers/${supplierId}/certificates`,
      payload,
    );
    return data;
  },

  update: async (
    supplierId: string,
    certificateId: string,
    payload: Partial<CreateCertificateInput>,
  ): Promise<SupplierCertificate> => {
    const { data } = await apiClient.patch(
      `/suppliers/${supplierId}/certificates/${certificateId}`,
      payload,
    );
    return data;
  },

  remove: async (supplierId: string, certificateId: string): Promise<void> => {
    await apiClient.delete(
      `/suppliers/${supplierId}/certificates/${certificateId}`,
    );
  },

  approve: async (
    supplierId: string,
    certificateId: string,
  ): Promise<SupplierCertificate> => {
    const { data } = await apiClient.post(
      `/suppliers/${supplierId}/certificates/${certificateId}/approve`,
    );
    return data;
  },

  reject: async (
    supplierId: string,
    certificateId: string,
    notes?: string,
  ): Promise<SupplierCertificate> => {
    const { data } = await apiClient.post(
      `/suppliers/${supplierId}/certificates/${certificateId}/reject`,
      { notes },
    );
    return data;
  },
};
