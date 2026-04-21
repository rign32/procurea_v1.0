import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  certificatesService,
  type CreateCertificateInput,
} from '@/services/certificates.service';

export function useSupplierCertificates(supplierId: string | undefined) {
  return useQuery({
    queryKey: ['supplier-certificates', supplierId],
    queryFn: () => certificatesService.list(supplierId!),
    enabled: !!supplierId,
    staleTime: 30_000,
  });
}

export function useCreateCertificate(supplierId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCertificateInput) =>
      certificatesService.create(supplierId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplier-certificates', supplierId] });
    },
  });
}

export function useUpdateCertificate(supplierId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      certificateId,
      payload,
    }: {
      certificateId: string;
      payload: Partial<CreateCertificateInput>;
    }) => certificatesService.update(supplierId, certificateId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplier-certificates', supplierId] });
    },
  });
}

export function useDeleteCertificate(supplierId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (certificateId: string) =>
      certificatesService.remove(supplierId, certificateId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplier-certificates', supplierId] });
    },
  });
}

export function useApproveCertificate(supplierId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (certificateId: string) =>
      certificatesService.approve(supplierId, certificateId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplier-certificates', supplierId] });
    },
  });
}

export function useRejectCertificate(supplierId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      certificateId,
      notes,
    }: {
      certificateId: string;
      notes?: string;
    }) => certificatesService.reject(supplierId, certificateId, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplier-certificates', supplierId] });
    },
  });
}
