import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import queueApi from '../services/queueApi.js';

export function useQueue(deptId) {
  return useQuery({
    queryKey: ['queue', deptId],
    queryFn: () => queueApi.getQueue(deptId),
    enabled: !!deptId,
  });
}

export function useQueueStats(deptId) {
  return useQuery({
    queryKey: ['queue', deptId, 'stats'],
    queryFn: () => queueApi.getStats(deptId),
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
    mutationFn: (patientData) => queueApi.addPatient(patientData),
    onSuccess: () => {
      refreshQueue(deptId);
    },
  });
}

export function useMarkDone(deptId) {
  const refreshQueue = useRefreshQueue();

  return useMutation({
    mutationFn: (entryId) => queueApi.markDone(entryId),
    onSuccess: () => {
      refreshQueue(deptId);
    },
  });
}

export function useMarkNoShow(deptId) {
  const refreshQueue = useRefreshQueue();

  return useMutation({
    mutationFn: (entryId) => queueApi.markNoShow(entryId),
    onSuccess: () => {
      refreshQueue(deptId);
    },
  });
}

export function useMarkInProgress(deptId) {
  const refreshQueue = useRefreshQueue();

  return useMutation({
    mutationFn: (entryId) => queueApi.markInProgress(entryId),
    onSuccess: () => {
      refreshQueue(deptId);
    },
  });
}

export function useSkipPatient(deptId) {
  const refreshQueue = useRefreshQueue();

  return useMutation({
    mutationFn: (entryId) => queueApi.skipPatient(entryId),
    onSuccess: () => {
      refreshQueue(deptId);
    },
  });
}

export function useRemovePatient(deptId) {
  const refreshQueue = useRefreshQueue();

  return useMutation({
    mutationFn: (entryId) => queueApi.removePatient(entryId),
    onSuccess: () => {
      refreshQueue(deptId);
    },
  });
}

export default useQueue;
