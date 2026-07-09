import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import queueService from '../services/queue.service.js';

export function useQueue(deptId) {
  return useQuery({
    queryKey: ['queue', deptId],
    queryFn: () => queueService.getQueue(deptId),
    enabled: !!deptId,
  });
}

export function useQueueStats(deptId) {
  return useQuery({
    queryKey: ['queue', deptId, 'stats'],
    queryFn: () => queueService.getStats(deptId),
    enabled: !!deptId,
  });
}

function useRefreshQueue() {
  const queryClient = useQueryClient();

  return function refreshQueue(deptId) {
    queryClient.invalidateQueries({ queryKey: ['queue', deptId] });
    queryClient.invalidateQueries({ queryKey: ['queue', deptId, 'stats'] });
  };
}

export function useAddPatient(deptId) {
  const refreshQueue = useRefreshQueue();

  return useMutation({
    mutationFn: (patientData) => queueService.addPatient(patientData),
    onSuccess: () => {
      refreshQueue(deptId);
    },
  });
}

export function useMarkDone(deptId) {
  const refreshQueue = useRefreshQueue();

  return useMutation({
    mutationFn: (entryId) => queueService.markDone(entryId),
    onSuccess: () => {
      refreshQueue(deptId);
    },
  });
}

export function useMarkNoShow(deptId) {
  const refreshQueue = useRefreshQueue();

  return useMutation({
    mutationFn: (entryId) => queueService.markNoShow(entryId),
    onSuccess: () => {
      refreshQueue(deptId);
    },
  });
}

export function useMarkInProgress(deptId) {
  const refreshQueue = useRefreshQueue();

  return useMutation({
    mutationFn: (entryId) => queueService.markInProgress(entryId),
    onSuccess: () => {
      refreshQueue(deptId);
    },
  });
}

export function useSkipPatient(deptId) {
  const refreshQueue = useRefreshQueue();

  return useMutation({
    mutationFn: (entryId) => queueService.skipPatient(entryId),
    onSuccess: () => {
      refreshQueue(deptId);
    },
  });
}

export function useRemovePatient(deptId) {
  const refreshQueue = useRefreshQueue();

  return useMutation({
    mutationFn: (entryId) => queueService.removePatient(entryId),
    onSuccess: () => {
      refreshQueue(deptId);
    },
  });
}

export default useQueue;
