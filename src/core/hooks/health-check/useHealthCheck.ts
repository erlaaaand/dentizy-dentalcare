import { useCallback } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import {
  useHealthControllerCheck,
  useHealthControllerCheckDetails,
  useHealthControllerLiveness,
  useHealthControllerReadiness,
  healthCheckApi,
  healthCheckHelpers,
  getHealthControllerCheckQueryKey,
  getHealthControllerCheckDetailsQueryKey,
  getHealthControllerLivenessQueryKey,
  getHealthControllerReadinessQueryKey
} from '../../service/api/health-check/health-check.api';

import type {
  HealthCheckResponse,
  DetailedHealthCheckResponse,
  HealthStatus
} from '../../types/health-check/health-check.types';

/**
 * Hook untuk basic health check
 */
export const useHealthCheck = () => {
  const query = useHealthControllerCheck();

  const healthData = query.data?.data as HealthCheckResponse | undefined;

  return {
    ...query,
    healthData,
    isHealthy: healthData ? healthCheckHelpers.isHealthy(healthData.status) : false,
    isDegraded: healthData ? healthCheckHelpers.isDegraded(healthData.status) : false,
    isUnhealthy: healthData ? healthCheckHelpers.isUnhealthy(healthData.status) : false,
    statusColor: healthData
      ? healthCheckHelpers.getStatusColor(healthData.status)
      : 'gray',
    statusLabel: healthData
      ? healthCheckHelpers.getStatusLabel(healthData.status)
      : 'Unknown'
  };
};

/**
 * Hook untuk detailed health check (DB & Memory)
 */
export const useDetailedHealthCheck = () => {
  const query = useHealthControllerCheckDetails();

  const detailedHealthData = query.data?.data as DetailedHealthCheckResponse | undefined;

  return {
    ...query,
    detailedHealthData,
    isHealthy: detailedHealthData
      ? healthCheckHelpers.isHealthy(detailedHealthData.status)
      : false
  };
};

/**
 * Hook untuk liveness probe (Kubernetes)
 */
export const useLivenessCheck = () => {
  const query = useHealthControllerLiveness();

  return {
    ...query,
    isAlive: query.isSuccess
  };
};

/**
 * Hook untuk readiness probe (Kubernetes)
 */
export const useReadinessCheck = () => {
  const query = useHealthControllerReadiness();

  return {
    ...query,
    isReady: query.isSuccess
  };
};

/**
 * Hook untuk health check actions
 */
export const useHealthCheckActions = (queryClient: QueryClient) => {
  const invalidateAll = useCallback(async () => {
    await healthCheckApi.invalidateAll(queryClient);
  }, [queryClient]);

  const prefetchHealthCheck = useCallback(async () => {
    await healthCheckApi.prefetchHealthCheck(queryClient);
  }, [queryClient]);

  const checkBasicHealth = useCallback(async () => {
    return await healthCheckApi.checkBasicHealth();
  }, []);

  const checkDetailedHealth = useCallback(async () => {
    return await healthCheckApi.checkDetailedHealth();
  }, []);

  const checkLiveness = useCallback(async () => {
    return await healthCheckApi.checkLiveness();
  }, []);

  const checkReadiness = useCallback(async () => {
    return await healthCheckApi.checkReadiness();
  }, []);

  return {
    invalidateAll,
    prefetchHealthCheck,
    checkBasicHealth,
    checkDetailedHealth,
    checkLiveness,
    checkReadiness
  };
};

/**
 * Hook untuk monitoring health status dengan polling
 */
export const useHealthMonitoring = (options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) => {
  const { enabled = true, refetchInterval = 30000 } = options || {};

  const healthQuery = useHealthControllerCheck({
    query: {
      enabled,
      refetchInterval,
      refetchIntervalInBackground: true
    }
  });

  const healthData = healthQuery.data?.data as HealthCheckResponse | undefined;

  return {
    ...healthQuery,
    healthData,
    status: healthData?.status,
    isHealthy: healthData ? healthCheckHelpers.isHealthy(healthData.status) : false,
    isDegraded: healthData ? healthCheckHelpers.isDegraded(healthData.status) : false,
    isUnhealthy: healthData ? healthCheckHelpers.isUnhealthy(healthData.status) : false
  };
};

/**
 * Hook untuk mendapatkan query keys
 */
export const useHealthCheckQueryKeys = () => {
  return {
    healthCheck: getHealthControllerCheckQueryKey(),
    detailedHealth: getHealthControllerCheckDetailsQueryKey(),
    liveness: getHealthControllerLivenessQueryKey(),
    readiness: getHealthControllerReadinessQueryKey()
  };
};

// Export helpers untuk digunakan di luar hooks
export { healthCheckHelpers };

// Export types
export type { HealthCheckResponse, DetailedHealthCheckResponse, HealthStatus };