import apiClient from './api.client';
import type { OrganizationLocation } from '../types/campaign.types';

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
};

export default organizationService;
