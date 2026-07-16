import { useQuery } from '@tanstack/react-query';
import analyticsApi from '../services/analyticsApi.js';

export function useBusyOverview(enabled = true) {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsApi.getOverview,
    enabled,
  });
}

export function useRedirectSuggestion(deptId) {
  return useQuery({
    queryKey: ['analytics', 'redirect', deptId],
    queryFn: () => analyticsApi.getRedirectSuggestion(deptId),
    enabled: !!deptId,
    refetchInterval: 15000,
  });
}

export function useSmsLogs(enabled = true) {
  return useQuery({
    queryKey: ['analytics', 'sms'],
    queryFn: analyticsApi.getSmsLogs,
    enabled,
  });
}
