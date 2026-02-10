import type { QueryClient } from '@tanstack/react-query';

/**
 * Base Service Class
 * Provides common functionality for all API services
 * 
 * This class contains shared methods for:
 * - Query cache management
 * - Query data manipulation
 * - Common patterns used across services
 */
export abstract class BaseService {
  /**
   * Invalidate queries matching the given query key
   */
  protected invalidateQueries(
    queryClient: QueryClient,
    queryKey: readonly unknown[]
  ): Promise<void> {
    return queryClient.invalidateQueries({ queryKey });
  }

  /**
   * Prefetch a query
   */
  protected async prefetchQuery<T>(
    queryClient: QueryClient,
    queryKey: readonly unknown[],
    queryFn: () => Promise<T>
  ): Promise<void> {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn
    });
  }

  /**
   * Get query data from cache
   */
  protected getQueryData<T>(
    queryClient: QueryClient,
    queryKey: readonly unknown[]
  ): T | undefined {
    return queryClient.getQueryData<T>(queryKey);
  }

  /**
   * Set query data in cache
   */
  protected setQueryData<T>(
    queryClient: QueryClient,
    queryKey: readonly unknown[],
    data: T
  ): void {
    queryClient.setQueryData<T>(queryKey, data);
  }

  /**
   * Remove queries from cache
   */
  protected removeQueries(
    queryClient: QueryClient,
    queryKey: readonly unknown[]
  ): void {
    queryClient.removeQueries({ queryKey });
  }

  /**
   * Cancel queries
   */
  protected async cancelQueries(
    queryClient: QueryClient,
    queryKey: readonly unknown[]
  ): Promise<void> {
    await queryClient.cancelQueries({ queryKey });
  }

  /**
   * Reset queries
   */
  protected async resetQueries(
    queryClient: QueryClient,
    queryKey: readonly unknown[]
  ): Promise<void> {
    await queryClient.resetQueries({ queryKey });
  }

  /**
   * Refetch queries
   */
  protected async refetchQueries(
    queryClient: QueryClient,
    queryKey: readonly unknown[]
  ): Promise<void> {
    await queryClient.refetchQueries({ queryKey });
  }
}