import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiKeysService from '../services/api-keys.service';
import type { CreateApiKeyDto } from '../services/api-keys.service';

export function useApiKeys() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiKeysService.getAll(),
    staleTime: 30000,
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateApiKeyDto) => apiKeysService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiKeysService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}
