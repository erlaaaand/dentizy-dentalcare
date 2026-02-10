import { useQueryClient } from '@tanstack/react-query';
import { HealthCacheManager } from '../../service/api/health-check/cache/cache.manager';

const cacheManager = new HealthCacheManager();

export function usePrefetchHealthCheck() {
  const queryClient = useQueryClient();
  
  return {
    prefetchBasic: () => cacheManager.prefetchHealthCheck(queryClient),
    prefetchDetailed: () => cacheManager.prefetchDetailedHealth(queryClient),
  };
}

export function useInvalidateHealthCheck() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => cacheManager.invalidateAll(queryClient),
    invalidateBasic: () => cacheManager.invalidateBasicHealth(queryClient),
    invalidateDetailed: () => cacheManager.invalidateDetailedHealth(queryClient),
    invalidateLiveness: () => cacheManager.invalidateLiveness(queryClient),
    invalidateReadiness: () => cacheManager.invalidateReadiness(queryClient),
  };
}