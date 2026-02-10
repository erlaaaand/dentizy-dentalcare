import { useQueryClient } from '@tanstack/react-query';
import { TreatmentCategoriesCacheManager } from '../../service/api/treatment-categories/cache/cache.manager';
import type { TreatmentCategoriesControllerFindAllParams } from '../../types/treatment-categories/treatment-categories.types';

const cacheManager = new TreatmentCategoriesCacheManager();

export function usePrefetchTreatmentCategories() {
  const queryClient = useQueryClient();

  return {
    prefetchList: (params?: TreatmentCategoriesControllerFindAllParams) =>
      cacheManager.prefetchList(queryClient, params),
    prefetchDetail: (id: number) =>
      cacheManager.prefetchDetail(queryClient, id),
  };
}

export function useInvalidateTreatmentCategories() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => cacheManager.invalidateAll(queryClient),
    invalidateList: (params?: TreatmentCategoriesControllerFindAllParams) =>
      cacheManager.invalidateList(queryClient, params),
    invalidateDetail: (id: number) =>
      cacheManager.invalidateDetail(queryClient, id),
  };
}