import { useQueryClient } from '@tanstack/react-query';
import type {
  MedicalRecordQueryParams,
  MedicalRecordSearchParams,
  DoctorStatsParams,
} from '../../types/medical-records/medical-record.types';
import { MedicalRecordsCacheManager } from '../../service/api/medical-records/cache/cache.manager';

const cacheManager = new MedicalRecordsCacheManager();

export function usePrefetchMedicalRecord() {
  const queryClient = useQueryClient();
  
  return {
    prefetchList: (params?: MedicalRecordQueryParams) =>
      cacheManager.prefetchList(queryClient, params),
    prefetchDetail: (id: string) =>
      cacheManager.prefetchDetail(queryClient, id),
  };
}

export function useInvalidateMedicalRecords() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => cacheManager.invalidateAll(queryClient),
    invalidateList: (params?: MedicalRecordQueryParams) => 
      cacheManager.invalidateList(queryClient, params),
    invalidateDetail: (id: string) => 
      cacheManager.invalidateDetail(queryClient, id),
    invalidateSearch: (params?: MedicalRecordSearchParams) =>
      cacheManager.invalidateSearch(queryClient, params),
    invalidateStats: (params?: DoctorStatsParams) =>
      cacheManager.invalidateStats(queryClient, params),
  };
}