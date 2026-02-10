import { createQueryHook } from '../../service/base/use-query-factory';
import { healthCheckService } from '../../service/api/health-check/health-check.api';
import { HealthCacheManager } from '../../service/api/health-check/cache/cache.manager';

const cacheManager = new HealthCacheManager();

export const useHealthCheck = createQueryHook({
  queryKey: () => cacheManager.getBasicHealthQueryKey(),
  queryFn: () => cacheManager.checkBasicHealth(),
  options: {
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  },
});

export const useDetailedHealthCheck = createQueryHook({
  queryKey: () => cacheManager.getDetailedHealthQueryKey(),
  queryFn: () => cacheManager.checkDetailedHealth(),
  options: {
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  },
});

export const useLivenessCheck = createQueryHook({
  queryKey: () => cacheManager.getLivenessQueryKey(),
  queryFn: () => healthCheckService.checkLiveness(),
  options: {
    staleTime: 30 * 1000,
    retry: 3,
  },
});

export const useReadinessCheck = createQueryHook({
  queryKey: () => cacheManager.getReadinessQueryKey(),
  queryFn: () => healthCheckService.checkReadiness(),
  options: {
    staleTime: 30 * 1000,
    retry: 3,
  },
});