import { keepPreviousData } from '@tanstack/react-query';
import { createQueryHook } from '../../service/base/use-query-factory';
import { medicalRecordsService } from '../../service/api/medical-records/medical-record.api';
import type {
  MedicalRecordQueryParams,
  MedicalRecordSearchParams,
  DoctorStatsParams,
} from '../../types/medical-records/medical-record.types';
import { MedicalRecordsCacheManager } from '../../service/api/medical-records/cache/cache.manager';

const cacheManager = new MedicalRecordsCacheManager();

export const useMedicalRecords = createQueryHook({
  queryKey: (params?: MedicalRecordQueryParams) => 
    cacheManager.getListQueryKey(params),
  queryFn: (params) => medicalRecordsService.findAll(params),
  options: {
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    retry: 1
  },
});

export const useMedicalRecord = createQueryHook({
  queryKey: (id?: string) => cacheManager.getDetailQueryKey(id!),
  queryFn: (id) => medicalRecordsService.findOne(id!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
    retry: 1
  },
});

export const useMedicalRecordSearch = createQueryHook({
  queryKey: (params?: MedicalRecordSearchParams) => 
    cacheManager.getSearchQueryKey(params),
  queryFn: (params) => medicalRecordsService.search(params!),
  options: {
    enabled: false,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000
  },
});

export const useMedicalRecordByAppointment = createQueryHook({
  queryKey: (appointmentId?: string) => 
    ['/medical-records/by-appointment', appointmentId],
  queryFn: (appointmentId) => medicalRecordsService.findByAppointmentId(appointmentId!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
    retry: 1
  },
});

export const useDoctorStats = createQueryHook({
  queryKey: (params?: DoctorStatsParams) => 
    cacheManager.getDoctorStatsQueryKey(params),
  queryFn: (params) => medicalRecordsService.getDoctorStats(params),
  options: {
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData
  },
});