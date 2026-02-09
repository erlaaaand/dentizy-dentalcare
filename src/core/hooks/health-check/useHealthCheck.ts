import { useQueryClient } from '@tanstack/react-query';
import { createQueryHook } from '../../service/base/use-query-factory';
import { healthCheckService, healthCheckHelpers } from '../../service/api/health-check/health-check.api';

// ==================== QUERY HOOKS ====================

export const useHealthCheck = createQueryHook({
  queryKey: () => healthCheckService.getBasicHealthQueryKey(),
  queryFn: () => healthCheckService.checkBasicHealth(),
  options: {
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  },
});

export const useDetailedHealthCheck = createQueryHook({
  queryKey: () => healthCheckService.getDetailedHealthQueryKey(),
  queryFn: () => healthCheckService.checkDetailedHealth(),
  options: {
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  },
});

export const useLivenessCheck = createQueryHook({
  queryKey: () => healthCheckService.getLivenessQueryKey(),
  queryFn: () => healthCheckService.checkLiveness(),
  options: {
    staleTime: 30 * 1000,
    retry: 3,
  },
});

export const useReadinessCheck = createQueryHook({
  queryKey: () => healthCheckService.getReadinessQueryKey(),
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
    isHealthy: healthData ? healthCheckHelpers.isHealthy(healthData.status) : false,
    isDegraded: healthData ? healthCheckHelpers.isDegraded(healthData.status) : false,
    isUnhealthy: healthData ? healthCheckHelpers.isUnhealthy(healthData.status) : false,
    statusColor: healthData 
      ? healthCheckHelpers.getStatusColor(healthData.status)
      : 'gray',
    statusLabel: healthData
      ? healthCheckHelpers.getStatusLabel(healthData.status)
      : 'Unknown',
    statusIcon: healthData
      ? healthCheckHelpers.getStatusIcon(healthData.status)
      : '?'
  };
}

// ==================== UTILITY HOOKS ====================

export function usePrefetchHealthCheck() {
  const queryClient = useQueryClient();
  
  return {
    prefetchBasic: () => healthCheckService.prefetchHealthCheck(queryClient),
    prefetchDetailed: () => healthCheckService.prefetchDetailedHealth(queryClient),
  };
}

export function useInvalidateHealthCheck() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => healthCheckService.invalidateAll(queryClient),
    invalidateBasic: () => healthCheckService.invalidateBasicHealth(queryClient),
    invalidateDetailed: () => healthCheckService.invalidateDetailedHealth(queryClient),
    invalidateLiveness: () => healthCheckService.invalidateLiveness(queryClient),
    invalidateReadiness: () => healthCheckService.invalidateReadiness(queryClient),
  };
}

// Export helpers
export { healthCheckHelpers };