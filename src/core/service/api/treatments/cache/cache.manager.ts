import { BaseService } from '../../../base/base.service';
import type { QueryClient } from '@tanstack/react-query';
import {
  getTreatmentsControllerFindAllQueryKey,
  getTreatmentsControllerFindOneQueryKey,
  getTreatmentsControllerFindByKodeQueryKey
} from '../../../../api/generated/treatments/treatments';

import type {
  TreatmentQueryParams,
  Treatment,
} from '../../../../types/treatments/treatment.types';

import { treatmentsService } from '../treatment.api';

/**
 * Treatments Cache Manager
 * Manages React Query cache for treatments
 * Extends BaseService for common cache operations
 */
export class TreatmentsCacheManager extends BaseService {
  /**
   * Get list query key
   */
  getListQueryKey(params?: TreatmentQueryParams) {
    return getTreatmentsControllerFindAllQueryKey(params);
  }

  /**
   * Get detail query key
   */
  getDetailQueryKey(id: string) {
    return getTreatmentsControllerFindOneQueryKey(id);
  }

  /**
   * Get by kode query key
   */
  getByKodeQueryKey(kode: string) {
    return getTreatmentsControllerFindByKodeQueryKey(kode);
  }

  /**
   * Invalidate list
   */
  invalidateList(queryClient: QueryClient, params?: TreatmentQueryParams): Promise<void> {
    return this.invalidateQueries(queryClient, this.getListQueryKey(params));
  }

  /**
   * Invalidate detail
   */
  invalidateDetail(queryClient: QueryClient, id: string): Promise<void> {
    return this.invalidateQueries(queryClient, this.getDetailQueryKey(id));
  }

  /**
   * Invalidate by kode
   */
  invalidateByKode(queryClient: QueryClient, kode: string): Promise<void> {
    return this.invalidateQueries(queryClient, this.getByKodeQueryKey(kode));
  }

  /**
   * Invalidate all
   */
  invalidateAll(queryClient: QueryClient): Promise<void> {
    return this.invalidateQueries(queryClient, ['/treatments'] as const);
  }

  /**
   * Prefetch list
   */
  async prefetchList(queryClient: QueryClient, params?: TreatmentQueryParams): Promise<void> {
    await this.prefetchQuery(
      queryClient,
      this.getListQueryKey(params),
      () => treatmentsService.findAll(params)
    );
  }

  /**
   * Prefetch detail
   */
  async prefetchDetail(queryClient: QueryClient, id: string): Promise<void> {
    await this.prefetchQuery(
      queryClient,
      this.getDetailQueryKey(id),
      () => treatmentsService.findOne(id)
    );
  }

  /**
   * Prefetch by kode
   */
  async prefetchByKode(queryClient: QueryClient, kode: string): Promise<void> {
    await this.prefetchQuery(
      queryClient,
      this.getByKodeQueryKey(kode),
      () => treatmentsService.findByKode(kode)
    );
  }

  /**
   * Optimistic update
   */
  optimisticUpdate(
    queryClient: QueryClient,
    id: string,
    updater: (old: Treatment) => Treatment
  ): Treatment | undefined {
    const queryKey = this.getDetailQueryKey(id);
    const previousData = this.getQueryData<Treatment>(queryClient, queryKey);
    
    if (previousData) {
      this.setQueryData(queryClient, queryKey, updater(previousData));
    }
    
    return previousData;
  }
}

export const treatmentsCacheManager = new TreatmentsCacheManager();