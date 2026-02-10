import { HealthHelper } from '../../service/api/health-check/helpers/health.helper';
import { useHealthCheck } from './queries';

const healthHelper = new HealthHelper();

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