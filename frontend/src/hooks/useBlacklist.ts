import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api.client';

export interface BlacklistedCompany {
    id: string;
    domain: string;
    name: string | null;
    country: string | null;
    city: string | null;
    isBlacklisted: boolean;
    blacklistReason: string | null;
    lastProcessedAt: string;
}

export function useBlacklist() {
    const queryClient = useQueryClient();

    const blacklistQuery = useQuery({
        queryKey: ['blacklist'],
        queryFn: async () => {
            const res = await apiClient.get<BlacklistedCompany[]>('/suppliers/blacklist/all');
            return res.data;
        },
    });

    const removeMutation = useMutation({
        mutationFn: async (registryId: string) => {
            const res = await apiClient.post(`/suppliers/blacklist/${registryId}/remove`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blacklist'] });
        },
    });

    const updateReasonMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
            const res = await apiClient.patch(`/suppliers/blacklist/${id}/reason`, { reason });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blacklist'] });
        },
    });

    const importMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const res = await apiClient.post<{
                imported: number;
                skipped: number;
                errors: string[];
            }>('/suppliers/blacklist/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blacklist'] });
        },
    });

    return {
        blacklist: blacklistQuery.data ?? [],
        isLoading: blacklistQuery.isLoading,
        error: blacklistQuery.error,
        removeFromBlacklist: removeMutation.mutate,
        isRemoving: removeMutation.isPending,
        updateReason: updateReasonMutation.mutate,
        isUpdatingReason: updateReasonMutation.isPending,
        importBlacklist: importMutation.mutateAsync,
        isImporting: importMutation.isPending,
    };
}

export async function downloadBlacklistTemplate() {
    const res = await apiClient.get('/suppliers/blacklist/template', {
        responseType: 'blob',
    });
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blacklist-template.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
