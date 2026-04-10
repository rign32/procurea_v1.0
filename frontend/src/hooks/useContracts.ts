import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import contractsService from '../services/contracts.service';
import type { ContractStatus, CreateContractDto, UpdateContractDto } from '../services/contracts.service';

export function useContracts(status?: ContractStatus) {
  return useQuery({
    queryKey: ['contracts', status],
    queryFn: () => contractsService.getAll(status),
    staleTime: 20000,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateContractDto) => contractsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateContractDto }) =>
      contractsService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}

export function useUpdateContractStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, comments }: { id: string; status: ContractStatus; comments?: string }) =>
      contractsService.updateStatus(id, status, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}
