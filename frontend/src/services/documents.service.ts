import apiClient from './api.client';

export interface DocumentRecord {
  id: string;
  uploadedById: string;
  organizationId?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  category?: string;
  tags?: string[];
  description?: string;
  entityType?: string;
  entityId?: string;
  version: number;
  parentId?: string;
  isLatest: boolean;
  createdAt: string;
  uploadedBy?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface DocumentListResponse {
  data: DocumentRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface UploadDocumentParams {
  file: File;
  category?: string;
  tags?: string[];
  description?: string;
  entityType?: string;
  entityId?: string;
}

export interface UpdateDocumentParams {
  category?: string;
  tags?: string[];
  description?: string;
  entityType?: string;
  entityId?: string;
}

export const documentsService = {
  /**
   * List documents with filters
   */
  list: async (params?: {
    entityType?: string;
    entityId?: string;
    category?: string;
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<DocumentListResponse> => {
    const { data } = await apiClient.get<DocumentListResponse>('/documents', {
      params,
    });
    return data;
  },

  /**
   * Upload a new document
   */
  upload: async (params: UploadDocumentParams): Promise<DocumentRecord> => {
    const formData = new FormData();
    formData.append('file', params.file);
    if (params.category) formData.append('category', params.category);
    if (params.tags && params.tags.length > 0)
      formData.append('tags', params.tags.join(','));
    if (params.description) formData.append('description', params.description);
    if (params.entityType) formData.append('entityType', params.entityType);
    if (params.entityId) formData.append('entityId', params.entityId);

    const { data } = await apiClient.post<DocumentRecord>('/documents', formData, {
      headers: { 'Content-Type': undefined as unknown as string },
    });
    return data;
  },

  /**
   * Upload a new version of an existing document
   */
  uploadNewVersion: async (
    documentId: string,
    file: File,
  ): Promise<DocumentRecord> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<DocumentRecord>(
      `/documents/${documentId}/new-version`,
      formData,
      { headers: { 'Content-Type': undefined as unknown as string } },
    );
    return data;
  },

  /**
   * Update document metadata
   */
  updateMetadata: async (
    documentId: string,
    params: UpdateDocumentParams,
  ): Promise<DocumentRecord> => {
    const { data } = await apiClient.patch<DocumentRecord>(
      `/documents/${documentId}`,
      params,
    );
    return data;
  },

  /**
   * Delete a document
   */
  delete: async (documentId: string): Promise<void> => {
    await apiClient.delete(`/documents/${documentId}`);
  },

  /**
   * Get version history
   */
  getVersions: async (documentId: string): Promise<DocumentRecord[]> => {
    const { data } = await apiClient.get<DocumentRecord[]>(
      `/documents/${documentId}/versions`,
    );
    return data;
  },

  /**
   * Get download URL — always construct from filename to avoid double /api prefix
   */
  getDownloadUrl: (doc: DocumentRecord): string => {
    // Extract the stored filename from the URL (last path segment)
    const filename = doc.filename || doc.url.split('/').pop() || '';
    return `/api/uploads/${filename}`;
  },
};

export default documentsService;
