import { useQuery, useMutation } from '@tanstack/react-query';
import portalService from '../services/portal.service';
import type { SubmitOfferDto } from '../services/portal.service';

export function usePortalOffer(accessToken: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['portal', 'offer', accessToken],
    queryFn: () => portalService.getOffer(accessToken),
    enabled: enabled && !!accessToken,
    staleTime: 60000,
    retry: 1,
  });
}

export function useSubmitPortalOffer() {
  return useMutation({
    mutationFn: ({ accessToken, dto }: { accessToken: string; dto: SubmitOfferDto }) =>
      portalService.submitOffer(accessToken, dto),
  });
}

export function usePortalTranslations(langCode: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['portal', 'translations', langCode],
    queryFn: () => portalService.getTranslations(langCode),
    enabled: enabled && !!langCode,
    staleTime: Infinity, // Translations never stale
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    retry: 1,
  });
}
