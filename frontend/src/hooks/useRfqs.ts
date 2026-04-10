import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import rfqsService, { offersService } from '../services/rfqs.service';
import type { CreateRfqDto, UpdateRfqDto, RfqRequest } from '../types/campaign.types';

/**
 * React Query hook - Pobierz wszystkie RFQ
 */
export function useRfqs(status?: RfqRequest['status']) {
  return useQuery({
    queryKey: ['rfqs', status],
    queryFn: () => rfqsService.getAll(status),
    staleTime: 20000, // 20 seconds
  });
}

/**
 * React Query hook - Pobierz szczegóły RFQ
 */
export function useRfq(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['rfqs', id],
    queryFn: () => rfqsService.getById(id),
    enabled: enabled && !!id,
    staleTime: 10000, // 10 seconds
  });
}

/**
 * React Query hook - Utwórz RFQ
 */
export function useCreateRfq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateRfqDto) => rfqsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
    },
  });
}

/**
 * React Query hook - Aktualizuj RFQ
 */
export function useUpdateRfq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRfqDto }) =>
      rfqsService.update(id, dto),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs', variables.id] });
    },
  });
}

/**
 * React Query hook - Usuń RFQ
 */
export function useDeleteRfq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rfqsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
    },
  });
}

/**
 * React Query hook - Wyślij RFQ do wszystkich dostawców
 */
export function useSendRfqToAll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rfqId, campaignId }: { rfqId: string; campaignId: string }) =>
      rfqsService.sendToAllSuppliers(rfqId, campaignId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs', variables.rfqId] });
    },
  });
}

/**
 * React Query hook - Wyślij RFQ do konkretnych dostawców
 */
export function useSendRfqToSuppliers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rfqId, supplierIds }: { rfqId: string; supplierIds: string[] }) =>
      rfqsService.sendToSuppliers(rfqId, supplierIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs', variables.rfqId] });
    },
  });
}

/**
 * React Query hook - Eksportuj RFQ do PDF
 */
export function useExportRfq() {
  return useMutation({
    mutationFn: (id: string) => rfqsService.exportPDF(id),
    onSuccess: (blob, id) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rfq-${id}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}

// Offers Hooks

/**
 * React Query hook - Pobierz oferty dla RFQ
 */
export function useOffers(rfqId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['rfqs', rfqId, 'offers'],
    queryFn: () => offersService.getByRfq(rfqId),
    enabled: enabled && !!rfqId,
    staleTime: 10000,
  });
}

/**
 * React Query hook - Pobierz szczegóły oferty
 */
export function useOffer(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['offers', id],
    queryFn: () => offersService.getById(id),
    enabled: enabled && !!id,
    staleTime: 10000,
  });
}

/**
 * React Query hook - Akceptuj ofertę
 */
export function useAcceptOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => offersService.accept(id),
    onSuccess: (data) => {
      // Invalidate RFQ (status changed to CLOSED)
      queryClient.invalidateQueries({ queryKey: ['rfqs', data.rfqRequestId] });
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

/**
 * React Query hook - Odrzuć ofertę
 */
export function useRejectOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      offersService.reject(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs', data.rfqRequestId] });
      queryClient.invalidateQueries({ queryKey: ['offers', data.id] });
    },
  });
}

/**
 * React Query hook - Dodaj ofertę do shortlisty
 */
export function useShortlistOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => offersService.shortlist(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs', data.rfqRequestId] });
      queryClient.invalidateQueries({ queryKey: ['offers', data.id] });
    },
  });
}

/**
 * React Query hook - Kontrpropozycja do oferty
 */
export function useCounterOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, terms }: { id: string; terms: { price?: number; moq?: number; leadTime?: number; comments?: string } }) =>
      offersService.counterOffer(id, terms),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs', data.rfqRequestId] });
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['offers', data.id] });
    },
  });
}

/**
 * React Query hook - Porównaj oferty
 */
export function useCompareOffers() {
  return useMutation({
    mutationFn: (offerIds: string[]) => offersService.compare(offerIds),
  });
}
