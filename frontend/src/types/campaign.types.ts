// Campaign Types - zgodne z Prisma models z backendu

import type { Supplier } from './supplier.types';

// Re-export Supplier for convenience
export type { Supplier } from './supplier.types';

export type CampaignStatus = 'RUNNING' | 'COMPLETED' | 'STOPPED' | 'ERROR' | 'PAUSED' | 'SENDING' | 'ACCEPTED' | 'DONE';

export type CampaignStage =
  | 'STRATEGY'
  | 'SCANNING'
  | 'ANALYSIS'
  | 'ENRICHMENT'
  | 'AUDIT'
  | 'COMPLETED';

export type Region = 'PL' | 'US' | 'GB' | 'CA' | 'AU' | 'CN' | 'EU' | 'GLOBAL' | 'GLOBAL_NO_CN' | 'CUSTOM';

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  stage: CampaignStage;
  category?: string;
  targetRegion?: Region;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  // Email Sequence
  sequenceTemplateId?: string;

  // Relations
  rfqRequest?: RfqRequest;
  suppliers?: Supplier[];
  logs?: CampaignLog[];

  // Apollo.io enrichment
  apolloEnrichmentStatus?: string | null; // null | "pending" | "running" | "completed" | "failed"

  // Stats (computed)
  suppliersFound?: number;
  suppliersQualified?: number;
  pendingOffers?: number;
}

export interface CampaignLog {
  id: string;
  campaignId: string;
  message: string;
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface RfqRequest {
  id: string;
  campaignId?: string;
  ownerId: string;

  // Product Info
  productName: string;
  partNumber?: string;
  category?: string;
  material?: string;
  description?: string;

  // Pricing
  targetPrice?: number;
  currency?: string;

  // Quantity
  quantity?: number;
  eau?: number; // Estimated Annual Usage
  unit?: string;

  // Logistics
  incoterms?: string;
  paymentTerms?: string;
  desiredDeliveryDate?: string;
  offerDeadline?: string;
  deliveryLocationId?: string;

  // Status
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

  // Public-facing identifier used in supplier emails and portal links (e.g. "RFQ-2026-001").
  publicId?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations
  campaign?: Campaign;
  offers?: Offer[];
  owner?: User;
  deliveryLocation?: OrganizationLocation;
}

export interface OfferPriceTier {
  id: string;
  minQty: number;
  maxQty?: number | null;
  unitPrice: number;
}

export interface Offer {
  id: string;
  rfqRequestId: string;
  supplierId: string;

  // Offer Details
  price?: number;
  currency?: string;
  moq?: number; // Minimum Order Quantity
  leadTime?: string;
  validityDate?: string;

  // Notes
  comments?: string;

  // Confirmations
  incotermsConfirmed?: boolean;
  specsConfirmed?: boolean;

  // Status
  status: 'PENDING' | 'VIEWED' | 'SUBMITTED' | 'REJECTED' | 'SHORTLISTED' | 'ACCEPTED' | 'COUNTER_OFFERED';

  // Counter-offer terms (set by buyer)
  counterPrice?: number;
  counterMoq?: number;
  counterLeadTime?: number;
  counterComments?: string;
  counterOfferedAt?: string;

  // Access
  accessToken?: string;

  // Timestamps
  viewedAt?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;

  // Price Tiers
  priceTiers?: OfferPriceTier[];

  // Alternative offer
  parentOfferId?: string;
  alternatives?: Offer[];
  altDescription?: string;
  altMaterial?: string;

  // Relations
  rfqRequest?: RfqRequest;
  supplier?: Supplier;
}

export interface OrganizationLocation {
  id: string;
  organizationId: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  jobTitle?: string;
  companyName?: string;
  organizationId?: string;
  role?: string;
  campaignAccess?: string; // "all" | "own" | "readonly"
  onboardingCompleted?: boolean;
  isPhoneVerified?: boolean;
  plan?: 'research' | 'full' | 'pay_as_you_go' | 'unlimited';
  searchCredits?: number;
  trialCreditsUsed?: boolean;
  isDemo?: boolean;
  // RBAC permissions
  permissions?: string[];
  rbacRole?: {
    id: string;
    name: string;
    displayName: string;
  } | null;
  // Org-level credits (new)
  personalCredits?: number;
  orgCredits?: number;
  orgPlan?: string;
  orgTrialCreditsUsed?: boolean;
  organizationName?: string | null;
  trialEndedAcknowledgedAt?: string | null;
  hasOrganization?: boolean;
  organization?: {
    id: string;
    name: string;
    domain?: string;
    locations?: OrganizationLocation[];
  };
}

export interface TeamMember {
  id: string;
  email: string;
  name?: string;
  jobTitle?: string;
  iShareWithThem: boolean;
  theyShareWithMe: boolean;
}

// DTOs for API calls

export interface CreateCampaignDto {
  name: string;
  sequenceTemplateId?: string;

  // RFQ Data
  productName: string;
  category?: string;
  material?: string;
  description?: string;
  partNumber?: string;

  // Quantity
  quantity?: number;
  eau?: number;
  unit?: string;

  // Pricing
  targetPrice?: number;
  currency?: string;

  // Logistics
  incoterms?: string;
  paymentTerms?: string;
  desiredDeliveryDate?: string;
  offerDeadline?: string;
  deliveryLocationId?: string;

  // Search Parameters
  targetRegion?: Region;
  targetCountries?: string[];
  excludedCountries?: string[];
  requiredCertificates?: string[];
  additionalKeywords?: string[];
  supplierTypes?: string[];
}

export interface UpdateCampaignDto {
  name?: string;
  status?: CampaignStatus;
  stage?: CampaignStage;
}

export interface CreateRfqDto {
  productName: string;
  partNumber?: string;
  category?: string;
  material?: string;
  description?: string;
  targetPrice?: number;
  currency?: string;
  quantity?: number;
  eau?: number;
  unit?: string;
  incoterms?: string;
  paymentTerms?: string;
  desiredDeliveryDate?: string;
  offerDeadline?: string;
  deliveryLocationId?: string;
}

export interface UpdateRfqDto {
  status?: RfqRequest['status'];
  productName?: string;
  targetPrice?: number;
  quantity?: number;
  desiredDeliveryDate?: string;
}

// WebSocket Events

export interface CampaignLogEvent {
  campaignId: string;
  message: string;
  level?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  timestamp: string;
}

export interface CampaignProgressEvent {
  campaignId: string;
  stage: CampaignStage;
  progress: number; // 0-100
  message?: string;
}

export interface SupplierUpdateEvent {
  campaignId: string;
  status: 'FOUND' | 'EXPLORING' | 'ANALYZING' | 'ENRICHING' | 'AUDITING' | 'QUALIFIED' | 'REJECTED';
  data?: Partial<Supplier>;
}

// Helper Types

export interface StageProgress {
  stage: CampaignStage;
  label: string;
  progress: number; // 0-100
  color: 'blue' | 'yellow' | 'purple' | 'green' | 'red' | 'gray';
  isComplete: boolean;
}

export interface CampaignStats {
  suppliersFound: number;
  suppliersQualified: number;
  suppliersRejected: number;
  averageScore: number;
  marketBreakdown: Record<string, number>; // country -> count
  pendingOffers?: number;
}
