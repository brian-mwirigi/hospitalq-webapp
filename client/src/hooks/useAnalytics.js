import { useQuery } from '@tanstack/react-query';
import analyticsService from '../services/analytics.service.js';

export function useBusyOverview(enabled = true) {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsService.getOverview,
    enabled,
  });
}

export function useRedirectSuggestion(deptId) {
  return useQuery({
    queryKey: ['analytics', 'redirect', deptId],
    queryFn: () => analyticsService.getRedirectSuggestion(deptId),
    enabled: !!deptId,
    refetchInterval: 15000,
  });
}

export function useSmsLogs(enabled = true) {
  return useQuery({
    queryKey: ['analytics', 'sms'],
    queryFn: analyticsService.getSmsLogs,
    enabled,
  });
}
