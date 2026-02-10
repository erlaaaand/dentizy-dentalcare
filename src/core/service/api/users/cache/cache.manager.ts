import { BaseService } from '../../../base/base.service';
import type { QueryClient } from '@tanstack/react-query';
import {
  getUsersControllerFindAllQueryKey,
  getUsersControllerFindOneQueryKey,
  getUsersControllerGetStatisticsQueryKey,
  getUsersControllerGetRecentUsersQueryKey,
  getUsersControllerCheckUsernameQueryKey
} from '../../../../api/generated/users/users';

import type {
  UserQueryParams,
  RecentUsersParams,
  User,
} from '../../../../types/users/user.types';

import { usersService } from '../users.api';

/**
 * Users Cache Manager
 * Manages React Query cache for users
 * Extends BaseService for common cache operations
 */
export class UsersCacheManager extends BaseService {
  /**
   * Get list query key
   */
  getListQueryKey(params?: UserQueryParams) {
    return getUsersControllerFindAllQueryKey(params);
  }

  /**
   * Get detail query key
   */
  getDetailQueryKey(id: string) {
    return getUsersControllerFindOneQueryKey(id);
  }

  /**
   * Get statistics query key
   */
  getStatisticsQueryKey() {
    return getUsersControllerGetStatisticsQueryKey();
  }

  /**
   * Get recent users query key
   */
  getRecentUsersQueryKey(params?: RecentUsersParams) {
    return getUsersControllerGetRecentUsersQueryKey(params);
  }

  /**
   * Get check username query key
   */
  getCheckUsernameQueryKey(username: string) {
    return getUsersControllerCheckUsernameQueryKey(username);
  }

  /**
   * Invalidate list
   */
  invalidateList(queryClient: QueryClient, params?: UserQueryParams): Promise<void> {
    return this.invalidateQueries(queryClient, this.getListQueryKey(params));
  }

  /**
   * Invalidate detail
   */
  invalidateDetail(queryClient: QueryClient, id: string): Promise<void> {
    return this.invalidateQueries(queryClient, this.getDetailQueryKey(id));
  }

  /**
   * Invalidate statistics
   */
  invalidateStatistics(queryClient: QueryClient): Promise<void> {
    return this.invalidateQueries(queryClient, this.getStatisticsQueryKey());
  }

  /**
   * Invalidate recent users
   */
  invalidateRecentUsers(queryClient: QueryClient, params?: RecentUsersParams): Promise<void> {
    return this.invalidateQueries(queryClient, this.getRecentUsersQueryKey(params));
  }

  /**
   * Invalidate all
   */
  invalidateAll(queryClient: QueryClient): Promise<void> {
    return this.invalidateQueries(queryClient, ['/users'] as const);
  }

  /**
   * Prefetch list
   */
  async prefetchList(queryClient: QueryClient, params?: UserQueryParams): Promise<void> {
    await this.prefetchQuery(
      queryClient,
      this.getListQueryKey(params),
      () => usersService.findAll(params)
    );
  }

  /**
   * Prefetch detail
   */
  async prefetchDetail(queryClient: QueryClient, id: string): Promise<void> {
    await this.prefetchQuery(
      queryClient,
      this.getDetailQueryKey(id),
      () => usersService.findOne(id)
    );
  }

  /**
   * Prefetch statistics
   */
  async prefetchStatistics(queryClient: QueryClient): Promise<void> {
    await this.prefetchQuery(
      queryClient,
      this.getStatisticsQueryKey(),
      () => usersService.getStatistics()
    );
  }

  /**
   * Optimistic update
   */
  optimisticUpdate(
    queryClient: QueryClient,
    id: string,
    updater: (old: User) => User
  ): User | undefined {
    const queryKey = this.getDetailQueryKey(id);
    const previousData = this.getQueryData<User>(queryClient, queryKey);
    
    if (previousData) {
      this.setQueryData(queryClient, queryKey, updater(previousData));
    }
    
    return previousData;
  }
}

export const usersCacheManager = new UsersCacheManager();