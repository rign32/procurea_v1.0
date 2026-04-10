import apiClient from './api.client';
import type { OrganizationLocation, TeamMember } from '../types/campaign.types';

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  baseCurrency?: string;
  footerText?: string;
  footerEnabled: boolean;
  footerFirstName?: string;
  footerLastName?: string;
  footerCompany?: string;
  footerPosition?: string;
  footerEmail?: string;
  footerPhone?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  portalWelcomeText?: string;
  locations: OrganizationLocation[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  baseCurrency?: string;
  footerText?: string;
  footerEnabled?: boolean;
  footerFirstName?: string;
  footerLastName?: string;
  footerCompany?: string;
  footerPosition?: string;
  footerEmail?: string;
  footerPhone?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  portalWelcomeText?: string;
}

export interface OrgMember {
  id: string;
  email: string;
  name?: string;
  role: string;
  campaignAccess: string; // "all" | "own" | "readonly"
  jobTitle?: string;
  isEmailVerified?: boolean;
  createdAt: string;
}

export type { TeamMember };

export const organizationService = {
  // Team members
  getMembers: async (orgId: string): Promise<OrgMember[]> => {
    const { data } = await apiClient.get<OrgMember[]>(`/organization/${orgId}/users`);
    return data;
  },

  inviteMember: async (orgId: string, invite: { email: string; role?: string; campaignAccess?: string }): Promise<OrgMember> => {
    const { data } = await apiClient.post<OrgMember>(`/organization/${orgId}/users`, invite);
    return data;
  },

  updateUserAccess: async (orgId: string, userId: string, update: { role?: string; campaignAccess?: string }): Promise<OrgMember> => {
    const { data } = await apiClient.patch<OrgMember>(`/organization/${orgId}/users/${userId}`, update);
    return data;
  },

  removeMember: async (orgId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/organization/${orgId}/users/${userId}`);
  },

  get: async (id: string): Promise<Organization> => {
    const { data } = await apiClient.get<Organization>(`/organization/${id}`);
    return data;
  },

  update: async (id: string, dto: UpdateOrganizationDto): Promise<Organization> => {
    const { data } = await apiClient.patch<Organization>(`/organization/${id}`, dto);
    return data;
  },

  getLocations: async (orgId: string): Promise<OrganizationLocation[]> => {
    const org = await organizationService.get(orgId);
    return org.locations;
  },

  addLocation: async (orgId: string, location: {
    name: string;
    address: string;
    isDefault?: boolean;
  }): Promise<OrganizationLocation> => {
    const { data } = await apiClient.post<OrganizationLocation>(`/organization/${orgId}/locations`, location);
    return data;
  },

  updateLocation: async (orgId: string, locId: string, update: {
    name?: string;
    address?: string;
    isDefault?: boolean;
  }): Promise<OrganizationLocation> => {
    const { data } = await apiClient.patch<OrganizationLocation>(`/organization/${orgId}/locations/${locId}`, update);
    return data;
  },

  removeLocation: async (orgId: string, locId: string): Promise<void> => {
    await apiClient.delete(`/organization/${orgId}/locations/${locId}`);
  },

  // --- Democratic Sharing ---

  getSharingPreferences: async (orgId: string): Promise<TeamMember[]> => {
    const { data } = await apiClient.get<TeamMember[]>(`/organization/${orgId}/sharing`);
    return data;
  },

  updateSharing: async (orgId: string, targetUserId: string, enabled: boolean): Promise<void> => {
    await apiClient.patch(`/organization/${orgId}/sharing/${targetUserId}`, { enabled });
  },

  leaveOrganization: async (orgId: string): Promise<void> => {
    await apiClient.post(`/organization/${orgId}/leave`);
  },

  // --- Audit Logs ---

  getAuditLogs: async (params: {
    entityType?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }): Promise<AuditLogResponse> => {
    const query = new URLSearchParams();
    if (params.entityType) query.set('entityType', params.entityType);
    if (params.userId) query.set('userId', params.userId);
    if (params.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params.dateTo) query.set('dateTo', params.dateTo);
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    const { data } = await apiClient.get<AuditLogResponse>(`/organization/audit-logs/list?${query.toString()}`);
    return data;
  },
};

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogResponse {
  data: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default organizationService;
