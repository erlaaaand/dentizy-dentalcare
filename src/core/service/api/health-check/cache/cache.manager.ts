import { BaseService } from '../../../base/base.service';
import type { QueryClient } from '@tanstack/react-query';
import { 
    getHealthControllerCheckQueryKey,
    getHealthControllerCheckDetailsQueryKey,
    getHealthControllerLivenessQueryKey, 
    getHealthControllerReadinessQueryKey,
    healthControllerCheck,
    healthControllerCheckDetails
} from '../../../../api/generated/health-check/health-check';

import type {
  HealthCheckResponse,
  DetailedHealthCheckResponse
} from '../../../../types/health-check/health-check.types';

export class HealthCacheManager extends BaseService {

    async checkBasicHealth(): Promise<HealthCheckResponse> {
        const response = await healthControllerCheck();
        // Menggunakan pengecekan status eksplisit agar lebih type-safe daripada 'as'
        if (response.status === 200) {
          return response.data as HealthCheckResponse;
        }
        throw new Error('Failed to fetch basic health');
    }

    async checkDetailedHealth(): Promise<DetailedHealthCheckResponse> {
        const response = await healthControllerCheckDetails();
        
        // Refactor: Menghilangkan casting unknown berlebih dengan validasi status
        if (response.status === 200) {
          return response.data as DetailedHealthCheckResponse;
        }
    
        throw new Error('Failed to fetch detailed health');
    }
    
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

    invalidateBasicHealth(queryClient: QueryClient) {
        // Aman karena BaseService sekarang menerima readonly key dari generator
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
        // Bisa langsung menggunakan array tanpa 'as const' karena BaseService sudah readonly
        return this.invalidateQueries(queryClient, ['/health']);
    }

    async prefetchHealthCheck(queryClient: QueryClient) {
        return this.prefetchQuery(
            queryClient,
            this.getBasicHealthQueryKey(),
            () => this.checkBasicHealth() // Memperbaiki referensi fungsi yang benar
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

export const healthCacheManager = new HealthCacheManager();