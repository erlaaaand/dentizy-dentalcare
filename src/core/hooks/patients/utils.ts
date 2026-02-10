import { useQueryClient } from '@tanstack/react-query';
import type {
  PatientQueryParams,
  PatientSearchParams,
} from '../../types/patients/patient.types';
import { PatientsCacheManager } from '../../service/api/patients/cache/cache.manager';

const cacheManager = new PatientsCacheManager();

export function usePrefetchPatient() {
  const queryClient = useQueryClient();
  
  return {
    prefetchList: (params?: PatientQueryParams) =>
      cacheManager.prefetchList(queryClient, params),
    prefetchDetail: (id: string) =>
      cacheManager.prefetchDetail(queryClient, id),
  };
}

export function useInvalidatePatients() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => cacheManager.invalidateAll(queryClient),
    invalidateList: (params?: PatientQueryParams) => 
      cacheManager.invalidateList(queryClient, params),
    invalidateDetail: (id: string) => 
      cacheManager.invalidateDetail(queryClient, id),
    invalidateSearch: (params?: PatientSearchParams) =>
      cacheManager.invalidateSearch(queryClient, params),
    invalidateStatistics: () =>
      cacheManager.invalidateStatistics(queryClient),
  };
}