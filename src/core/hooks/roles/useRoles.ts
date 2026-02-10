import { useQueryClient } from '@tanstack/react-query';
import { createQueryHook } from '../../service/base/use-query-factory';
import { rolesService } from '../../service/api/roles/roles.api';
import { RolesCacheManager } from '../../service/api/roles';

const cacheManager = new RolesCacheManager();

// ==================== QUERY HOOKS ====================

export const useRoles = createQueryHook({
  queryKey: () => cacheManager.getListQueryKey(),
  queryFn: () => rolesService.findAll(),
  options: {
    staleTime: 10 * 60 * 1000, // 10 minutes - roles rarely change
  },
});

export const useRole = createQueryHook({
  queryKey: (id?: string) => cacheManager.getDetailQueryKey(id!),
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
    prefetchList: () => cacheManager.prefetchList(queryClient),
    prefetchDetail: (id: string) => cacheManager.prefetchDetail(queryClient, id),
  };
}

export function useInvalidateRoles() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => cacheManager.invalidateAll(queryClient),
    invalidateList: () => cacheManager.invalidateList(queryClient),
    invalidateDetail: (id: string) => cacheManager.invalidateDetail(queryClient, id),
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