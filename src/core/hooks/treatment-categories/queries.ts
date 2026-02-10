import { keepPreviousData } from '@tanstack/react-query';
import { createQueryHook } from '../../service/base/use-query-factory';
import { treatmentCategoriesService } from '../../service/api/treatment-categories/treatment-categories.api';
import { TreatmentCategoriesCacheManager } from '../../service/api/treatment-categories/cache/cache.manager';
import type { TreatmentCategoriesControllerFindAllParams } from '../../types/treatment-categories/treatment-categories.types';

const cacheManager = new TreatmentCategoriesCacheManager();

export const useTreatmentCategories = createQueryHook({
  queryKey: (params?: TreatmentCategoriesControllerFindAllParams) =>
    cacheManager.getListQueryKey(params),
  queryFn: (params) => treatmentCategoriesService.findAll(params),
  options: {
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  },
});

export const useTreatmentCategory = createQueryHook({
  queryKey: (id?: number) => cacheManager.getDetailQueryKey(id!),
  queryFn: (id) => treatmentCategoriesService.findOne(id!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
    retry: 1,
  },
});