import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api.client';

export type ReportFrequency = 'daily' | 'weekly' | 'monthly';
export type ReportType = 'campaign_summary' | 'analytics' | 'supplier_performance';

export interface ScheduledReport {
  id: string;
  name: string;
  frequency: ReportFrequency;
  reportType: ReportType;
  recipients: string[];
  filters?: Record<string, unknown>;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduledReportDto {
  name: string;
  frequency: ReportFrequency;
  reportType: ReportType;
  recipients: string[];
  filters?: Record<string, unknown>;
}

const scheduledReportsService = {
  getAll: async (): Promise<ScheduledReport[]> => {
    const { data } = await apiClient.get<ScheduledReport[]>('/scheduled-reports');
    return data;
  },

  create: async (dto: CreateScheduledReportDto): Promise<ScheduledReport> => {
    const { data } = await apiClient.post<ScheduledReport>('/scheduled-reports', dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/scheduled-reports/${id}`);
  },

  runNow: async (id: string): Promise<void> => {
    await apiClient.post(`/scheduled-reports/${id}/run`);
  },
};

export function useScheduledReports() {
  return useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: () => scheduledReportsService.getAll(),
    staleTime: 20000,
  });
}

export function useCreateScheduledReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateScheduledReportDto) => scheduledReportsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
  });
}

export function useDeleteScheduledReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduledReportsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
  });
}

export function useRunScheduledReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduledReportsService.runNow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
  });
}
