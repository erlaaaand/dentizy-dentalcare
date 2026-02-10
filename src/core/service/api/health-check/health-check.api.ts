import { BaseService } from '../../base/base.service';
import {
  healthControllerLiveness,
  healthControllerReadiness,
} from '../../../api/generated/health-check/health-check';

import type { HealthStatus } from '../../../types/health-check/health-check.types';

export class HealthCheckService extends BaseService {

  async checkLiveness(): Promise<{ status: HealthStatus }> {
    const response = await healthControllerLiveness();
    return { status: response.status === 200 ? 'healthy' : 'unhealthy' };
  }

  async checkReadiness(): Promise<{ status: HealthStatus; ready: boolean }> {
    try {
      const response = await healthControllerReadiness();
      const isReady = response.status === 200;
      return { 
        status: isReady ? 'healthy' : 'unhealthy', 
        ready: isReady 
      };
    } catch {
      return { status: 'unhealthy', ready: false };
    }
  }
}

export const healthCheckService = new HealthCheckService();