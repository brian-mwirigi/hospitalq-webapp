import { useQuery } from '@tanstack/react-query';
import departmentService from '../services/department.service.js';

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: departmentService.getAll,
  });
}

export function useDepartmentBySlug(slug) {
  return useQuery({
    queryKey: ['departments', slug],
    queryFn: () => departmentService.getBySlug(slug),
    enabled: !!slug,
  });
}

export default useDepartments;
