import { BaseService } from '../../../base/base.service';
import type { QueryClient } from '@tanstack/react-query';
import {
  getTreatmentCategoriesControllerFindAllQueryKey,
  getTreatmentCategoriesControllerFindOneQueryKey
} from '../../../../api/generated/treatment-categories/treatment-categories';

import type { TreatmentCategoriesControllerFindAllParams } from '../../../../types/treatment-categories/treatment-categories.types';
import { treatmentCategoriesService } from '../treatment-categories.api';

/**
 * Treatment Categories Cache Manager
 * Manages React Query cache for treatment categories
 * Extends BaseService for common cache operations
 */
export class TreatmentCategoriesCacheManager extends BaseService {
  /**
   * Get list query key
   */
  getListQueryKey(params?: TreatmentCategoriesControllerFindAllParams) {
    return getTreatmentCategoriesControllerFindAllQueryKey(params);
  }

  /**
   * Get detail query key
   */
  getDetailQueryKey(id: number) {
    return getTreatmentCategoriesControllerFindOneQueryKey(id);
  }

  /**
   * Invalidate list
   */
  invalidateList(
    queryClient: QueryClient,
    params?: TreatmentCategoriesControllerFindAllParams
  ): Promise<void> {
    return this.invalidateQueries(queryClient, this.getListQueryKey(params));
  }

  /**
   * Invalidate detail
   */
  invalidateDetail(queryClient: QueryClient, id: number): Promise<void> {
    return this.invalidateQueries(queryClient, this.getDetailQueryKey(id));
  }

  /**
   * Invalidate all category queries
   */
  invalidateAll(queryClient: QueryClient): Promise<void> {
    return queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return (
          Array.isArray(queryKey) &&
          queryKey.length > 0 &&
          typeof queryKey[0] === 'string' &&
          queryKey[0].startsWith('/treatment-categories')
        );
      }
    });
  }

  /**
   * Prefetch category list
   */
  async prefetchList(
    queryClient: QueryClient,
    params?: TreatmentCategoriesControllerFindAllParams
  ): Promise<void> {
    await this.prefetchQuery(
      queryClient,
      this.getListQueryKey(params),
      () => treatmentCategoriesService.findAll(params)
    );
  }

  /**
   * Prefetch single category
   */
  async prefetchDetail(queryClient: QueryClient, id: number): Promise<void> {
    await this.prefetchQuery(
      queryClient,
      this.getDetailQueryKey(id),
      () => treatmentCategoriesService.findOne(id)
    );
  }
}

export const treatmentCategoriesCacheManager = new TreatmentCategoriesCacheManager();