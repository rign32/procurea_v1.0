import type { Supplier } from '@/types/supplier.types';

export interface VatMetadata {
  vatVerified: boolean;
  vatCountry: string;
  vatNumber: string;
  registeredName?: string;
  registeredAddress?: string;
  checkedAt: string;
}

export interface ApolloMetadata {
  name?: string;
  domain?: string;
  industry?: string;
  estimatedEmployees?: number;
  foundedYear?: number;
  linkedinUrl?: string;
  annualRevenue?: number;
  publicCompany?: boolean;
  city?: string;
  country?: string;
  employeeMismatch?: boolean;
  enrichedAt?: string;
}

export interface SupplierMetadata {
  vat?: VatMetadata;
  apollo?: ApolloMetadata;
}

export function parseSupplierMetadata(supplier: Pick<Supplier, 'metadata'>): SupplierMetadata {
  if (!supplier.metadata) return {};
  try {
    const parsed = JSON.parse(supplier.metadata);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch {
    return {};
  }
}

export function getVatMetadata(supplier: Pick<Supplier, 'metadata'>): VatMetadata | undefined {
  return parseSupplierMetadata(supplier).vat;
}

export function getApolloMetadata(supplier: Pick<Supplier, 'metadata'>): ApolloMetadata | undefined {
  return parseSupplierMetadata(supplier).apollo;
}
