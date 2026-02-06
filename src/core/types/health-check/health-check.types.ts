// Health Check Types
// Types untuk monitoring kesehatan sistem dan API endpoints

// Health check status
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

// Individual service health
export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  message?: string;
  responseTime?: number;
  lastChecked: string;
}

// Overall health check response
export interface HealthCheckResponse {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  services: {
    database: ServiceHealth;
    api: ServiceHealth;
    cache?: ServiceHealth;
    storage?: ServiceHealth;
  };
  version: string;
  environment: string;
}

// Database health details
export interface DatabaseHealth extends ServiceHealth {
  details?: {
    connectionPool: {
      active: number;
      idle: number;
      total: number;
    };
    queries: {
      slow: number;
      failed: number;
    };
  };
}

// API health details
export interface ApiHealth extends ServiceHealth {
  details?: {
    endpoints: {
      total: number;
      healthy: number;
      degraded: number;
      unhealthy: number;
    };
    requests: {
      total: number;
      successful: number;
      failed: number;
    };
    averageResponseTime: number;
  };
}

// System metrics
export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
}

// Detailed health check response
export interface DetailedHealthCheckResponse extends HealthCheckResponse {
  metrics?: SystemMetrics;
  errors?: {
    service: string;
    error: string;
    timestamp: string;
  }[];
}

// Health check configuration
export interface HealthCheckConfig {
  enabled: boolean;
  interval: number; // in seconds
  timeout: number; // in seconds
  retries: number;
}

// Monitoring alert
export interface HealthAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  service: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

// Health check history
export interface HealthCheckHistory {
  timestamp: string;
  status: HealthStatus;
  services: Record<string, HealthStatus>;
  responseTime: number;
}

// Health check summary
export interface HealthCheckSummary {
  period: {
    start: string;
    end: string;
  };
  uptime_percentage: number;
  total_checks: number;
  successful_checks: number;
  failed_checks: number;
  average_response_time: number;
  incidents: {
    total: number;
    critical: number;
    resolved: number;
  };
}