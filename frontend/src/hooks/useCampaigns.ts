import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import campaignsService from '../services/campaigns.service';
import useCampaignsStore from '../stores/campaigns.store';
import type { CreateCampaignDto, UpdateCampaignDto, Campaign } from '../types/campaign.types';

/**
 * React Query hook - Pobierz wszystkie kampanie
 */
export function useCampaigns() {
  const { setCampaigns } = useCampaignsStore();

  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const campaigns = await campaignsService.getAll();
      setCampaigns(campaigns);
      return campaigns;
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * React Query hook - Pobierz szczegóły kampanii
 */
export function useCampaign(id: string, enabled: boolean = true) {
  const { setActiveCampaign, setSuppliers } = useCampaignsStore();

  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: async () => {
      const campaign = await campaignsService.getById(id);
      setActiveCampaign(campaign);

      // Set suppliers if available
      if (campaign.suppliers) {
        setSuppliers(campaign.suppliers);
      }

      return campaign;
    },
    enabled: enabled && !!id,
    staleTime: 10000, // 10 seconds
  });
}

/**
 * React Query hook - Utwórz kampanię
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { addCampaign } = useCampaignsStore();

  return useMutation({
    mutationFn: (dto: CreateCampaignDto) => campaignsService.create(dto),
    onSuccess: (data) => {
      // Invalidate campaigns list
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });

      // Optimistically add to store (will be updated by real-time)
      addCampaign({
        id: data.id,
        name: '',
        status: 'RUNNING',
        stage: 'STRATEGY',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
  });
}

/**
 * React Query hook - Aktualizuj kampanię
 */
export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const { updateCampaign } = useCampaignsStore();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCampaignDto }) =>
      campaignsService.update(id, dto),
    onSuccess: (data, variables) => {
      // Update store
      updateCampaign(variables.id, data);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.id] });
    },
  });
}

/**
 * React Query hook - Usuń kampanię
 */
export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const { removeCampaign } = useCampaignsStore();

  return useMutation({
    mutationFn: (id: string) => campaignsService.delete(id),
    onSuccess: (_, id) => {
      // Remove from store
      removeCampaign(id);

      // Invalidate campaigns list
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

/**
 * React Query hook - Pobierz logi kampanii (polling fallback)
 */
export function useCampaignLogs(id: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ['campaigns', id, 'logs'],
    queryFn: () => campaignsService.getLogs(id),
    enabled: enabled && !!id,
    refetchInterval: 5000, // Poll every 5 seconds (fallback)
    staleTime: 1000,
  });
}

/**
 * React Query hook - Eksportuj kampanię do CSV
 */
export function useExportCampaign() {
  return useMutation({
    mutationFn: (id: string) => campaignsService.exportCSV(id),
    onSuccess: (blob, id) => {
      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaign-${id}-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}
