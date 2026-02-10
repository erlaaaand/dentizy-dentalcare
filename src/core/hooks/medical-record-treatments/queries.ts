import { keepPreviousData } from '@tanstack/react-query';
import { createQueryHook } from '../../service/base/use-query-factory';
import { medicalRecordTreatmentsService } from '../../service/api/medical-record-treatments/medical-record-treatments.api';
import type {
  MedicalRecordTreatmentQueryParams,
  TopTreatmentsParams,
} from '../../types/medical-record-treatments/medical-record-treatments.types';
import { MedicalRecordTreatmentsCacheManager } from '../../service/api/medical-record-treatments/cache/cache.manager';

const cacheManager = new MedicalRecordTreatmentsCacheManager();

export const useMedicalRecordTreatments = createQueryHook({
  queryKey: (params?: MedicalRecordTreatmentQueryParams) => 
    cacheManager.getListQueryKey(params),
  queryFn: (params) => medicalRecordTreatmentsService.findAll(params),
  options: {
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  },
});

export const useMedicalRecordTreatment = createQueryHook({
  queryKey: (id?: string) => cacheManager.getDetailQueryKey(id!),
  queryFn: (id) => medicalRecordTreatmentsService.findOne(id!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
  },
});

export const useMedicalRecordTreatmentsByRecordId = createQueryHook({
  queryKey: (medicalRecordId?: string) => 
    cacheManager.getByMedicalRecordIdQueryKey(medicalRecordId!),
  queryFn: (medicalRecordId) => 
    medicalRecordTreatmentsService.findByMedicalRecordId(medicalRecordId!),
  options: {
    enabled: false,
    staleTime: 30 * 1000,
  },
});

export const useMedicalRecordTreatmentTotal = createQueryHook({
  queryKey: (medicalRecordId?: string) => 
    cacheManager.getTotalByMedicalRecordIdQueryKey(medicalRecordId!),
  queryFn: (medicalRecordId) => 
    medicalRecordTreatmentsService.getTotalByMedicalRecordId(medicalRecordId!),
  options: {
    enabled: false,
    staleTime: 30 * 1000,
  },
});

export const useTopTreatments = createQueryHook({
  queryKey: (params?: TopTreatmentsParams) => 
    cacheManager.getTopTreatmentsQueryKey(params),
  queryFn: (params) => medicalRecordTreatmentsService.getTopTreatments(params),
  options: {
    staleTime: 5 * 60 * 1000,
  },
});