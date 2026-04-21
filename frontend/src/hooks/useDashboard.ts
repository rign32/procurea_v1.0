import { useQuery } from '@tanstack/react-query';
import dashboardService from '../services/dashboard.service';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useDashboardActivity(limit: number = 20) {
  return useQuery({
    queryKey: ['dashboard', 'activity', limit],
    queryFn: () => dashboardService.getActivity(limit),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
