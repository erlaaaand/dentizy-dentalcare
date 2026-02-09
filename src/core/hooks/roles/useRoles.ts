import { useQueryClient } from '@tanstack/react-query';
import { createQueryHook } from '../../service/base/use-query-factory';
import { rolesService } from '../../service/api/roles/roles.api';

// ==================== QUERY HOOKS ====================

export const useRoles = createQueryHook({
  queryKey: () => rolesService.getListQueryKey(),
  queryFn: () => rolesService.findAll(),
  options: {
    staleTime: 10 * 60 * 1000, // 10 minutes - roles rarely change
  },
});

export const useRole = createQueryHook({
  queryKey: (id?: string) => rolesService.getDetailQueryKey(id!),
  queryFn: (id) => rolesService.findOne(id!),
  options: {
    enabled: false,
    staleTime: 10 * 60 * 1000,
  },
});

// ==================== UTILITY HOOKS ====================

export function usePrefetchRole() {
  const queryClient = useQueryClient();
  
  return {
    prefetchList: () => rolesService.prefetchList(queryClient),
    prefetchDetail: (id: string) => rolesService.prefetchDetail(queryClient, id),
  };
}

export function useInvalidateRoles() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => rolesService.invalidateAll(queryClient),
    invalidateList: () => rolesService.invalidateList(queryClient),
    invalidateDetail: (id: string) => rolesService.invalidateDetail(queryClient, id),
  };
}

// ==================== ROLE OPTIONS HOOK ====================

export function useRoleOptions() {
  const { data: roles, isLoading } = useRoles();

  const options = (roles || []).map(role => ({
    value: role.id,
    label: role.name,
    description: role.description || ''
  }));

  return {
    options,
    isLoading,
    roles: roles || []
  };
}