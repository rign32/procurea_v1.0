import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import purchaseOrdersService from '../services/purchase-orders.service';
import type { POStatus } from '../services/purchase-orders.service';

export function usePurchaseOrders(status?: POStatus) {
  return useQuery({
    queryKey: ['purchase-orders', status],
    queryFn: () => purchaseOrdersService.getAll(status),
    staleTime: 20000,
  });
}

export function useGeneratePO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contractId: string) => purchaseOrdersService.generate(contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}

export function useUpdatePOStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: POStatus }) =>
      purchaseOrdersService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}
