// Supplier Types - zgodne z Prisma models z backendu

import type { Campaign, Offer } from './campaign.types';

export interface Supplier {
  id: string;
  campaignId: string;
  registryId?: string;

  // Basic Info
  url: string;
  name?: string;
  country?: string;
  city?: string;
  website?: string;

  // Contact Info
  contactEmails?: string; // comma-separated
  contacts?: Contact[];

  // Company Details
  specialization?: string;
  certificates?: string;
  employeeCount?: string;

  // AI Agent Results (JSON)
  explorerResult?: any;
  analystResult?: any;
  enrichmentResult?: any;
  auditorResult?: any;

  // Scoring
  analysisScore?: number; // 0-10
  analysisReason?: string;

  // Company Classification
  companyType?: 'PRODUCENT' | 'HANDLOWIEC' | 'NIEJASNY';
  companyTypeConfidence?: number;
  needsManualClassification?: boolean;
  sourceType?: 'SEARCH' | 'PORTAL_MINE' | 'LEADER_DIRECT' | 'LEADER_SEARCH' | 'EXPANSION';

  // Metadata
  originLanguage?: string;
  originCountry?: string;
  sourceAgent?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations
  campaign?: Campaign;
  registry?: CompanyRegistry;
  offers?: Offer[];
}

export interface Contact {
  id: string;
  supplierId: string;
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  isDecisionMaker: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyRegistry {
  id: string;
  domain: string; // unique

  // Basic Info
  name?: string;
  country?: string;
  city?: string;

  // Company Details
  specialization?: string;
  certificates?: string;
  employeeCount?: string;

  // Contact Info
  contactEmails?: string;
  primaryEmail?: string;

  // AI Agent Results (JSON)
  explorerResult?: any;
  analystResult?: any;
  enrichmentResult?: any;
  auditorResult?: any;

  // Quality Metrics
  lastAnalysisScore?: number;
  dataQualityScore?: number;

  // Usage Stats
  usageCount: number;
  campaignsCount: number;
  rfqsSent: number;
  rfqsResponded: number;

  // Engagement Metrics
  lastContactedAt?: string;
  lastResponseAt?: string;
  responseRate?: number;
  avgResponseTime?: number; // in hours

  // Status
  isActive: boolean;
  isVerified: boolean;
  isBlacklisted: boolean;

  // Vector Store
  vectorId?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;

  // Relations
  suppliers?: Supplier[];
}

// DTOs for API calls

export interface UpdateSupplierDto {
  name?: string;
  country?: string;
  city?: string;
  website?: string;
  contactEmails?: string;
  specialization?: string;
  certificates?: string;
  employeeCount?: string;
  analysisScore?: number;
  analysisReason?: string;
}

export interface CreateContactDto {
  supplierId: string;
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  isDecisionMaker?: boolean;
}

export interface UpdateRegistryDto {
  name?: string;
  country?: string;
  city?: string;
  specialization?: string;
  certificates?: string;
  employeeCount?: string;
  contactEmails?: string;
  primaryEmail?: string;
  isVerified?: boolean;
  isBlacklisted?: boolean;
}

// Filter & Search Types

export interface SupplierFilters {
  country?: string;
  minScore?: number;
  hasEmail?: boolean;
  certificates?: string[];
  search?: string;
  campaignId?: string;
  companyType?: string;
  page?: number;
  pageSize?: number;
}

export interface RegistryFilters {
  country?: string;
  minQualityScore?: number;
  isVerified?: boolean;
  isBlacklisted?: boolean;
  minUsageCount?: number;
  search?: string;
}

// Helper Types

export interface ScoringBreakdown {
  capabilityMatch: number; // 0-100
  trustScore: number; // 0-100
  dataQuality: number; // 0-100
  overall: number; // 0-100
  recommendation: 'HIGHLY_SUITABLE' | 'SUITABLE' | 'MARGINAL' | 'NOT_SUITABLE';
  reasoning: string;
}

export interface SupplierStats {
  totalSuppliers: number;
  withEmails: number;
  verified: number;
  blacklisted: number;
  averageQuality: number;
}

export interface MarketBreakdown {
  country: string;
  flag: string;
  count: number;
  percentage: number;
}
