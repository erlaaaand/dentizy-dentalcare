import type { QueryClient } from '@tanstack/react-query';
import {
  healthControllerCheck,
  healthControllerCheckDetails,
  healthControllerLiveness,
  healthControllerReadiness,
  useHealthControllerCheck,
  useHealthControllerCheckDetails,
  useHealthControllerLiveness,
  useHealthControllerReadiness,
  getHealthControllerCheckQueryKey,
  getHealthControllerCheckDetailsQueryKey,
  getHealthControllerLivenessQueryKey,
  getHealthControllerReadinessQueryKey
} from '../../../api/generated/health-check/health-check';

import type {
  HealthCheckResponse,
  DetailedHealthCheckResponse,
  HealthStatus,
  ServiceHealth
} from '../../../types/health-check/health-check.types';

// Re-export generated hooks
export {
  useHealthControllerCheck,
  useHealthControllerCheckDetails,
  useHealthControllerLiveness,
  useHealthControllerReadiness
};

// Re-export query keys
export {
  getHealthControllerCheckQueryKey,
  getHealthControllerCheckDetailsQueryKey,
  getHealthControllerLivenessQueryKey,
  getHealthControllerReadinessQueryKey
};

// Re-export generated functions
export {
  healthControllerCheck,
  healthControllerCheckDetails,
  healthControllerLiveness,
  healthControllerReadiness
};

// Custom API calls with typed responses
export const healthCheckApi = {
  /**
   * Cek status dasar aplikasi
   */
  async checkBasicHealth(): Promise<HealthCheckResponse> {
    const response = await healthControllerCheck();
    return response.data as HealthCheckResponse;
  },

  /**
   * Cek kesehatan detail (DB & Memory)
   */
  async checkDetailedHealth(): Promise<DetailedHealthCheckResponse> {
  const response = await healthControllerCheckDetails();

  const typedResponse = response as unknown as { data: DetailedHealthCheckResponse } | DetailedHealthCheckResponse;

  if ("data" in typedResponse) {
    return typedResponse.data;
  }

  return typedResponse;
},

  /**
   * Liveness Probe untuk Kubernetes
   */
  async checkLiveness(): Promise<{ status: HealthStatus }> {
    await healthControllerLiveness();
    return { status: 'healthy' };
  },

  /**
   * Readiness Probe untuk Kubernetes
   */
  async checkReadiness(): Promise<{ status: HealthStatus; ready: boolean }> {
    try {
      await healthControllerReadiness();
      return { status: 'healthy', ready: true };
    } catch {
      return { status: 'unhealthy', ready: false };
    }
  },

  /**
   * Invalidate all health check queries
   */
  invalidateAll(queryClient: QueryClient): Promise<void> {
    return queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return (
          Array.isArray(queryKey) &&
          queryKey.length > 0 &&
          typeof queryKey[0] === 'string' &&
          queryKey[0].startsWith('/health')
        );
      }
    });
  },

  /**
   * Prefetch health check data
   */
  async prefetchHealthCheck(queryClient: QueryClient): Promise<void> {
    await queryClient.prefetchQuery({
      queryKey: getHealthControllerCheckQueryKey(),
      queryFn: () => healthControllerCheck()
    });
  }
};

// Helper functions
export const healthCheckHelpers = {
  /**
   * Determine overall health status from services
   */
  getOverallStatus(services: Record<string, ServiceHealth>): HealthStatus {
    const statuses = Object.values(services).map((s) => s.status);
    
    if (statuses.some((s) => s === 'unhealthy')) {
      return 'unhealthy';
    }
    
    if (statuses.some((s) => s === 'degraded')) {
      return 'degraded';
    }
    
    return 'healthy';
  },

  /**
   * Check if system is healthy
   */
  isHealthy(status: HealthStatus): boolean {
    return status === 'healthy';
  },

  /**
   * Check if system is degraded
   */
  isDegraded(status: HealthStatus): boolean {
    return status === 'degraded';
  },

  /**
   * Check if system is unhealthy
   */
  isUnhealthy(status: HealthStatus): boolean {
    return status === 'unhealthy';
  },

  /**
   * Get status color for UI
   */
  getStatusColor(status: HealthStatus): string {
    const colors: Record<HealthStatus, string> = {
      healthy: 'green',
      degraded: 'yellow',
      unhealthy: 'red'
    };
    return colors[status];
  },

  /**
   * Get status label for UI
   */
  getStatusLabel(status: HealthStatus): string {
    const labels: Record<HealthStatus, string> = {
      healthy: 'Sehat',
      degraded: 'Terdegradasi',
      unhealthy: 'Tidak Sehat'
    };
    return labels[status];
  }
};

export type { HealthCheckResponse, DetailedHealthCheckResponse, HealthStatus, ServiceHealth };