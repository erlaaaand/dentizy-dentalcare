import { keepPreviousData } from '@tanstack/react-query';
import { createQueryHook } from '../../service/base/use-query-factory';
import { usersService } from '../../service/api/users/users.api';
import type {
  UserQueryParams,
  RecentUsersParams,
} from '../../types/users/user.types';
import { UsersCacheManager } from '../../service/api/users/cache/cache.manager';

const cacheManager = new UsersCacheManager();

export const useUsers = createQueryHook({
  queryKey: (params?: UserQueryParams) => 
    cacheManager.getListQueryKey(params),
  queryFn: (params) => usersService.findAll(params),
  options: {
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  },
});

export const useUser = createQueryHook({
  queryKey: (id?: string) => cacheManager.getDetailQueryKey(id!),
  queryFn: (id) => usersService.findOne(id!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
  },
});

export const useUserStatistics = createQueryHook({
  queryKey: () => cacheManager.getStatisticsQueryKey(),
  queryFn: () => usersService.getStatistics(),
  options: {
    staleTime: 5 * 60 * 1000,
  },
});

export const useRecentUsers = createQueryHook({
  queryKey: (params?: RecentUsersParams) => 
    cacheManager.getRecentUsersQueryKey(params),
  queryFn: (params) => usersService.getRecentUsers(params),
  options: {
    staleTime: 60 * 1000,
  },
});

export const useCheckUsername = createQueryHook({
  queryKey: (username?: string) => 
    cacheManager.getCheckUsernameQueryKey(username!),
  queryFn: (username) => usersService.checkUsername(username!),
  options: {
    enabled: false,
    staleTime: 1000, // Cache for 1 second to avoid too many requests
  },
});