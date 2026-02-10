import type {
  HealthStatus,
  ServiceHealth
} from '../../../../types/health-check/health-check.types';

export class HealthHelper {
  /**
   * Determine overall health status from services
   */
  getOverallStatus(services: Record<string, ServiceHealth>): HealthStatus {
    const statuses = Object.values(services).map((s) => s.status);
    
    if (statuses.includes('unhealthy')) {
      return 'unhealthy';
    }
    
    if (statuses.includes('degraded')) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  isHealthy(status: HealthStatus): boolean {
    return status === 'healthy';
  }

  isDegraded(status: HealthStatus): boolean {
    return status === 'degraded';
  }

  isUnhealthy(status: HealthStatus): boolean {
    return status === 'unhealthy';
  }

  getStatusColor(status: HealthStatus): string {
    const colors: Record<HealthStatus, string> = {
      healthy: 'green',
      degraded: 'yellow',
      unhealthy: 'red'
    };
    return colors[status] ?? 'gray';
  }

  getStatusLabel(status: HealthStatus): string {
    const labels: Record<HealthStatus, string> = {
      healthy: 'Sehat',
      degraded: 'Terdegradasi',
      unhealthy: 'Tidak Sehat'
    };
    return labels[status] ?? 'Unknown';
  }

  getStatusIcon(status: HealthStatus): string {
    const icons: Record<HealthStatus, string> = {
      healthy: '✓',
      degraded: '⚠',
      unhealthy: '✗'
    };
    return icons[status] ?? '?';
  }

  formatUptime(seconds: number): string {
    if (seconds < 60) return '<1m';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return [
      days > 0 && `${days}d`,
      hours > 0 && `${hours}h`,
      minutes > 0 && `${minutes}m`
    ].filter(Boolean).join(' ');
  }

  formatResponseTime(ms: number): string {
    return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;
  }

  needsAttention(service: ServiceHealth): boolean {
    return service.status !== 'healthy';
  }

  getCriticalServices(services: Record<string, ServiceHealth>): ServiceHealth[] {
    return Object.values(services).filter(s => s.status === 'unhealthy');
  }

  getDegradedServices(services: Record<string, ServiceHealth>): ServiceHealth[] {
    return Object.values(services).filter(s => s.status === 'degraded');
  }
}

export const healthHelper = new HealthHelper();