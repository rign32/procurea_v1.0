import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import approvalsService from '../services/approvals.service';
import type { ApprovalStatus } from '../services/approvals.service';

export function useApprovals(status?: ApprovalStatus) {
  return useQuery({
    queryKey: ['approvals', status],
    queryFn: () => approvalsService.getAll(status),
    staleTime: 15000,
  });
}

export function usePendingApprovalsCount() {
  return useQuery({
    queryKey: ['approvals', 'PENDING'],
    queryFn: () => approvalsService.getAll('PENDING'),
    staleTime: 30000,
    select: (data) => data.length,
  });
}

export function useApproveApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      approvalsService.approve(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

export function useRejectApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      approvalsService.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}
