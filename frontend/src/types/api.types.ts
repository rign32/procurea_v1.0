// API Types - Response wrappers, Error types, Pagination

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Auth Types

export interface LoginRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    jobTitle?: string;
    companyName?: string;
    organizationId?: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Campaign API Types

export interface GetCampaignsResponse {
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    stage: string;
    suppliersFound: number;
    suppliersQualified: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface GetCampaignDetailResponse {
  id: string;
  name: string;
  status: string;
  stage: string;
  category?: string;
  targetRegion?: string;
  createdAt: string;
  updatedAt: string;
  rfqRequest?: any;
  suppliers: any[];
  stats: {
    suppliersFound: number;
    suppliersQualified: number;
    suppliersRejected: number;
    averageScore: number;
  };
}

export interface GetCampaignLogsResponse {
  logs: Array<{
    id: string;
    message: string;
    level: string;
    timestamp: string;
  }>;
  status: string;
  stage: string;
  suppliersFound: number;
}

export interface CreateCampaignResponse {
  id: string;
  status: string;
  message: string;
}

// Supplier API Types

export interface GetSuppliersResponse {
  suppliers: any[];
  total: number;
}

export interface GetSupplierDetailResponse {
  id: string;
  name?: string;
  country?: string;
  city?: string;
  website?: string;
  contactEmails?: string;
  contacts: any[];
  specialization?: string;
  certificates?: string;
  employeeCount?: string;
  analysisScore?: number;
  analysisReason?: string;
  explorerResult?: any;
  analystResult?: any;
  enrichmentResult?: any;
  auditorResult?: any;
  campaign?: any;
  registry?: any;
  offers?: any[];
}

// RFQ API Types

export interface GetRfqsResponse {
  rfqs: any[];
  total: number;
}

export interface GetRfqDetailResponse {
  id: string;
  productName: string;
  category?: string;
  description?: string;
  status: string;
  quantity?: number;
  targetPrice?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
  campaign?: any;
  offers: any[];
  owner?: any;
}

// Registry API Types

export interface GetRegistryResponse {
  companies: any[];
  total: number;
  stats: {
    totalCompanies: number;
    withEmails: number;
    verified: number;
    blacklisted: number;
    averageQuality: number;
  };
}

// Health Check Types

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    responseTime?: number;
  };
  redis?: {
    status: 'connected' | 'disconnected';
  };
  gemini?: {
    status: 'available' | 'unavailable';
  };
}

// Generic Query Types

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}
