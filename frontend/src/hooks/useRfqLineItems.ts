import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  rfqLineItemsService,
  offerLineItemsService,
  type LineItemInput,
  type OfferLineInput,
} from '@/services/rfq-line-items.service';

export function useRfqLineItems(rfqId: string | undefined) {
  return useQuery({
    queryKey: ['rfq-line-items', rfqId],
    queryFn: () => rfqLineItemsService.list(rfqId!),
    enabled: !!rfqId,
    staleTime: 30_000,
  });
}

export function useAddLineItem(rfqId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: LineItemInput) => rfqLineItemsService.add(rfqId, item),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rfq-line-items', rfqId] }),
  });
}

export function useDeleteLineItem(rfqId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lineItemId: string) => rfqLineItemsService.remove(rfqId, lineItemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rfq-line-items', rfqId] }),
  });
}

export function useBulkReplaceLineItems(rfqId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: LineItemInput[]) =>
      rfqLineItemsService.bulkReplace(rfqId, items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rfq-line-items', rfqId] }),
  });
}

// --- Faza 2B: per-line offer quotes ---

export function useOfferLineItems(offerId: string | undefined) {
  return useQuery({
    queryKey: ['offer-line-items', offerId],
    queryFn: () => offerLineItemsService.list(offerId!),
    enabled: !!offerId,
    staleTime: 30_000,
  });
}

export function useSaveOfferLineItems(offerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: OfferLineInput[]) =>
      offerLineItemsService.saveAll(offerId, items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offer-line-items', offerId] }),
  });
}
