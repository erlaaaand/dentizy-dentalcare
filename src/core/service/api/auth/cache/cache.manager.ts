import { BaseService } from '../../../base/base.service';
import type { QueryClient } from '@tanstack/react-query';
import { getAuthControllerGetProfileQueryKey } from '../../../../api/generated/auth/auth';
import type { UserResponseDto } from '../../../../types/auth/auth.types';
import { authService } from '../auth.api';

/**
 * Auth Cache Manager
 * Manages React Query cache for authentication
 * Extends BaseService for common cache operations
 */
export class AuthCacheManager extends BaseService {
  /**
   * Get profile query key
   */
  getProfileQueryKey() {
    return getAuthControllerGetProfileQueryKey();
  }

  /**
   * Invalidate profile
   */
  invalidateProfile(queryClient: QueryClient): Promise<void> {
    return this.invalidateQueries(queryClient, this.getProfileQueryKey());
  }

  /**
   * Invalidate all auth queries
   */
  invalidateAll(queryClient: QueryClient): Promise<void> {
    return this.invalidateQueries(queryClient, ['/auth'] as const);
  }

  /**
   * Prefetch profile
   */
  async prefetchProfile(queryClient: QueryClient): Promise<void> {
    await this.prefetchQuery(
      queryClient,
      this.getProfileQueryKey(),
      () => authService.getProfile()
    );
  }

  /**
   * Optimistic update for profile
   */
  optimisticUpdateProfile(
    queryClient: QueryClient,
    updater: (old: UserResponseDto) => UserResponseDto
  ): UserResponseDto | undefined {
    const queryKey = this.getProfileQueryKey();
    const previousData = this.getQueryData<UserResponseDto>(queryClient, queryKey);
    
    if (previousData) {
      this.setQueryData(queryClient, queryKey, updater(previousData));
    }
    
    return previousData;
  }
}

export const authCacheManager = new AuthCacheManager();