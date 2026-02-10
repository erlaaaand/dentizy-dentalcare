import { useQueryClient } from '@tanstack/react-query';
import type {
  UserQueryParams,
  RecentUsersParams,
} from '../../types/users/user.types';
import { UsersCacheManager } from '../../service/api/users/cache/cache.manager';

const cacheManager = new UsersCacheManager();

export function usePrefetchUser() {
  const queryClient = useQueryClient();
  
  return {
    prefetchList: (params?: UserQueryParams) =>
      cacheManager.prefetchList(queryClient, params),
    prefetchDetail: (id: string) =>
      cacheManager.prefetchDetail(queryClient, id),
  };
}

export function useInvalidateUsers() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => cacheManager.invalidateAll(queryClient),
    invalidateList: (params?: UserQueryParams) => 
      cacheManager.invalidateList(queryClient, params),
    invalidateDetail: (id: string) => 
      cacheManager.invalidateDetail(queryClient, id),
    invalidateStatistics: () =>
      cacheManager.invalidateStatistics(queryClient),
    invalidateRecentUsers: (params?: RecentUsersParams) =>
      cacheManager.invalidateRecentUsers(queryClient, params),
  };
}