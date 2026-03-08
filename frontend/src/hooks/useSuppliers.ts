import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import suppliersService, { registryService } from '../services/suppliers.service';
import type { SupplierFilters, UpdateSupplierDto, RegistryFilters } from '../types/supplier.types';

/**
 * React Query hook - Pobierz wszystkich dostawców
 */
export function useSuppliers(filters?: SupplierFilters) {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: () => suppliersService.getAll(filters),
    staleTime: 20000, // 20 seconds
  });
}

/**
 * React Query hook - Pobierz szczegóły dostawcy
 */
export function useSupplier(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => suppliersService.getById(id),
    enabled: enabled && !!id,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * React Query hook - Aktualizuj dostawcę
 */
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSupplierDto }) =>
      suppliersService.update(id, dto),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', variables.id] });
    },
  });
}

/**
 * React Query hook - Oznacz dostawcę jako zweryfikowany
 */
export function useVerifySupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suppliersService.markVerified(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', data.id] });
    },
  });
}

/**
 * React Query hook - Dodaj dostawcę do czarnej listy
 */
export function useBlacklistSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      suppliersService.blacklist(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', data.id] });
    },
  });
}

/**
 * React Query hook - Eksportuj dostawców do CSV
 */
export function useExportSuppliers() {
  return useMutation({
    mutationFn: (filters?: SupplierFilters) => suppliersService.exportCSV(filters),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suppliers-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}

// Registry Hooks

/**
 * React Query hook - Pobierz firmy z rejestru
 */
export function useRegistry(filters?: RegistryFilters) {
  return useQuery({
    queryKey: ['registry', filters],
    queryFn: () => registryService.getAll(filters),
    staleTime: 60000, // 60 seconds (registry changes slowly)
  });
}

/**
 * React Query hook - Pobierz firmę z rejestru po ID
 */
export function useRegistryCompany(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['registry', id],
    queryFn: () => registryService.getById(id),
    enabled: enabled && !!id,
    staleTime: 60000,
  });
}

/**
 * React Query hook - Weryfikacja grupowa firm
 */
export function useBulkVerifyRegistry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => registryService.bulkVerify(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registry'] });
    },
  });
}

/**
 * React Query hook - Eksportuj rejestr do CSV
 */
export function useExportRegistry() {
  return useMutation({
    mutationFn: (filters?: RegistryFilters) => registryService.exportCSV(filters),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registry-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}
