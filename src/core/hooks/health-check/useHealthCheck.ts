import { useQueryClient } from '@tanstack/react-query';
import { createQueryHook } from '../../service/base/use-query-factory';
import { healthCheckService } from '../../service/api/health-check/health-check.api';
import { HealthCacheManager } from '../../service/api/health-check/cache/cache.manager';
import { HealthHelper } from '../../service/api/health-check/helpers/health.helper';

const cacheManager = new HealthCacheManager();
const healthHelper = new HealthHelper();

// ==================== QUERY HOOKS ====================

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

// ==================== MONITORING HOOK ====================

export function useHealthMonitoring(options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) {
  const { enabled = true, refetchInterval = 30000 } = options || {};

  const healthQuery = useHealthCheck(undefined, {
    enabled,
    refetchInterval,
    refetchIntervalInBackground: true
  });

  const healthData = healthQuery.data;

  return {
    ...healthQuery,
    healthData,
    status: healthData?.status,
    isHealthy: healthData ? healthHelper.isHealthy(healthData.status) : false,
    isDegraded: healthData ? healthHelper.isDegraded(healthData.status) : false,
    isUnhealthy: healthData ? healthHelper.isUnhealthy(healthData.status) : false,
    statusColor: healthData 
      ? healthHelper.getStatusColor(healthData.status)
      : 'gray',
    statusLabel: healthData
      ? healthHelper.getStatusLabel(healthData.status)
      : 'Unknown',
    statusIcon: healthData
      ? healthHelper.getStatusIcon(healthData.status)
      : '?'
  };
}

// ==================== UTILITY HOOKS ====================

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

// Export helpers
export { healthHelper };