import { useQuery } from '@tanstack/react-query';
import deptApi from '../services/deptApi.js';

export function useDepts() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: deptApi.getAll,
  });
}

export function useDeptBySlug(slug) {
  return useQuery({
    queryKey: ['departments', slug],
    queryFn: () => deptApi.getBySlug(slug),
    enabled: !!slug,
  });
}

export default useDepts;
