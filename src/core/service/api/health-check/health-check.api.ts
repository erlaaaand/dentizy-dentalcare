import { BaseService } from '../../base/base.service';
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

// Re-export hooks
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

// Re-export functions
export {
  healthControllerCheck,
  healthControllerCheckDetails,
  healthControllerLiveness,
  healthControllerReadiness
};

class HealthCheckService extends BaseService {
  // ==================== QUERIES ====================
  
  async checkBasicHealth(): Promise<HealthCheckResponse> {
    const response = await healthControllerCheck();
    return response.data as HealthCheckResponse;
  }

  async checkDetailedHealth(): Promise<DetailedHealthCheckResponse> {
    const response = await healthControllerCheckDetails();
    
    const typedResponse = response as unknown as { 
      data: DetailedHealthCheckResponse 
    } | DetailedHealthCheckResponse;

    if ("data" in typedResponse) {
      return typedResponse.data;
    }

    return typedResponse;
  }

  async checkLiveness(): Promise<{ status: HealthStatus }> {
    await healthControllerLiveness();
    return { status: 'healthy' };
  }

  async checkReadiness(): Promise<{ status: HealthStatus; ready: boolean }> {
    try {
      await healthControllerReadiness();
      return { status: 'healthy', ready: true };
    } catch {
      return { status: 'unhealthy', ready: false };
    }
  }

  // ==================== QUERY KEYS ====================
  
  getBasicHealthQueryKey() {
    return getHealthControllerCheckQueryKey();
  }

  getDetailedHealthQueryKey() {
    return getHealthControllerCheckDetailsQueryKey();
  }

  getLivenessQueryKey() {
    return getHealthControllerLivenessQueryKey();
  }

  getReadinessQueryKey() {
    return getHealthControllerReadinessQueryKey();
  }

  // ==================== CACHE UTILITIES ====================
  
  invalidateBasicHealth(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, this.getBasicHealthQueryKey());
  }

  invalidateDetailedHealth(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, this.getDetailedHealthQueryKey());
  }

  invalidateLiveness(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, this.getLivenessQueryKey());
  }

  invalidateReadiness(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, this.getReadinessQueryKey());
  }

  invalidateAll(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, ['/health'] as const);
  }

  async prefetchHealthCheck(queryClient: QueryClient) {
    return this.prefetchQuery(
      queryClient,
      this.getBasicHealthQueryKey(),
      () => this.checkBasicHealth()
    );
  }

  async prefetchDetailedHealth(queryClient: QueryClient) {
    return this.prefetchQuery(
      queryClient,
      this.getDetailedHealthQueryKey(),
      () => this.checkDetailedHealth()
    );
  }
}

export const healthCheckService = new HealthCheckService();

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
  },

  /**
   * Get status icon
   */
  getStatusIcon(status: HealthStatus): string {
    const icons: Record<HealthStatus, string> = {
      healthy: '✓',
      degraded: '⚠',
      unhealthy: '✗'
    };
    return icons[status];
  },

  /**
   * Format uptime for display
   */
  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    
    return parts.length > 0 ? parts.join(' ') : '<1m';
  },

  /**
   * Format response time
   */
  formatResponseTime(ms: number): string {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  },

  /**
   * Check if service needs attention
   */
  needsAttention(service: ServiceHealth): boolean {
    return service.status !== 'healthy';
  },

  /**
   * Get critical services
   */
  getCriticalServices(services: Record<string, ServiceHealth>): ServiceHealth[] {
    return Object.values(services).filter(s => s.status === 'unhealthy');
  },

  /**
   * Get degraded services
   */
  getDegradedServices(services: Record<string, ServiceHealth>): ServiceHealth[] {
    return Object.values(services).filter(s => s.status === 'degraded');
  }
};