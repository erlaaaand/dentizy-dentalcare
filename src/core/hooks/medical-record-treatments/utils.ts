import { useQueryClient } from '@tanstack/react-query';
import type {
  MedicalRecordTreatmentQueryParams,
  TopTreatmentsParams,
} from '../../types/medical-record-treatments/medical-record-treatments.types';
import { MedicalRecordTreatmentsCacheManager } from '../../service/api/medical-record-treatments/cache/cache.manager';

const cacheManager = new MedicalRecordTreatmentsCacheManager();

export function usePrefetchMedicalRecordTreatment() {
  const queryClient = useQueryClient();
  
  return {
    prefetchList: (params?: MedicalRecordTreatmentQueryParams) =>
      cacheManager.prefetchList(queryClient, params),
    prefetchDetail: (id: string) =>
      cacheManager.prefetchDetail(queryClient, id),
    prefetchByMedicalRecordId: (medicalRecordId: string) =>
      cacheManager.prefetchByMedicalRecordId(queryClient, medicalRecordId),
  };
}

export function useInvalidateMedicalRecordTreatments() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => cacheManager.invalidateAll(queryClient),
    invalidateList: (params?: MedicalRecordTreatmentQueryParams) => 
      cacheManager.invalidateList(queryClient, params),
    invalidateDetail: (id: string) => 
      cacheManager.invalidateDetail(queryClient, id),
    invalidateByMedicalRecordId: (medicalRecordId: string) =>
      cacheManager.invalidateByMedicalRecordId(queryClient, medicalRecordId),
    invalidateTotalByMedicalRecordId: (medicalRecordId: string) =>
      cacheManager.invalidateTotalByMedicalRecordId(queryClient, medicalRecordId),
    invalidateTopTreatments: (params?: TopTreatmentsParams) =>
      cacheManager.invalidateTopTreatments(queryClient, params),
  };
}