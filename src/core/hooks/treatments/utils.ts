import { useQueryClient } from '@tanstack/react-query';
import type { TreatmentQueryParams } from '../../types/treatments/treatment.types';
import { TreatmentsCacheManager } from '../../service/api/treatments';

const cacheManager = new TreatmentsCacheManager();

export function usePrefetchTreatment() {
  const queryClient = useQueryClient();
  
  return {
    prefetchList: (params?: TreatmentQueryParams) =>
      cacheManager.prefetchList(queryClient, params),
    prefetchDetail: (id: string) =>
      cacheManager.prefetchDetail(queryClient, id),
  };
}

export function useInvalidateTreatments() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => cacheManager.invalidateAll(queryClient),
    invalidateList: (params?: TreatmentQueryParams) => 
      cacheManager.invalidateList(queryClient, params),
    invalidateDetail: (id: string) => 
      cacheManager.invalidateDetail(queryClient, id),
    invalidateByKode: (kode: string) =>
      cacheManager.invalidateByKode(queryClient, kode),
  };
}