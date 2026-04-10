import apiClient from './api.client';

export interface WorkspaceMember {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  members?: WorkspaceMember[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
}

export const workspacesService = {
  getAll: async (): Promise<Workspace[]> => {
    const { data } = await apiClient.get<Workspace[]>('/workspaces');
    return data;
  },

  create: async (dto: CreateWorkspaceDto): Promise<Workspace> => {
    const { data } = await apiClient.post<Workspace>('/workspaces', dto);
    return data;
  },

  update: async (id: string, dto: UpdateWorkspaceDto): Promise<Workspace> => {
    const { data } = await apiClient.patch<Workspace>(`/workspaces/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/workspaces/${id}`);
  },

  addMember: async (workspaceId: string, userId: string): Promise<void> => {
    await apiClient.post(`/workspaces/${workspaceId}/members`, { userId });
  },

  removeMember: async (workspaceId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`);
  },
};

export default workspacesService;
