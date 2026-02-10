import { keepPreviousData } from '@tanstack/react-query';
import { createQueryHook } from '../../service/base/use-query-factory';
import { patientsService } from '../../service/api/patients/patient.api';
import type {
  PatientQueryParams,
  PatientSearchParams,
  PatientByDoctorParams,
} from '../../types/patients/patient.types';
import { PatientsCacheManager } from '../../service/api/patients/cache/cache.manager';

const cacheManager = new PatientsCacheManager();

export const usePatients = createQueryHook({
  queryKey: (params?: PatientQueryParams) => 
    cacheManager.getListQueryKey(params),
  queryFn: (params) => patientsService.findAll(params),
  options: {
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    retry: 1
  },
});

export const usePatient = createQueryHook({
  queryKey: (id?: string) => cacheManager.getDetailQueryKey(id!),
  queryFn: (id) => patientsService.findOne(id!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
    retry: 1
  },
});

export const usePatientSearch = createQueryHook({
  queryKey: (params?: PatientSearchParams) => 
    cacheManager.getSearchQueryKey(params),
  queryFn: (params) => patientsService.search(params),
  options: {
    enabled: false,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000
  },
});

export const usePatientStatistics = createQueryHook({
  queryKey: () => cacheManager.getStatisticsQueryKey(),
  queryFn: () => patientsService.getStatistics(),
  options: {
    staleTime: 5 * 60 * 1000,
  },
});

export const usePatientByMedicalRecordNumber = createQueryHook({
  queryKey: (number?: string) => 
    cacheManager.getByMedicalRecordNumberQueryKey(number!),
  queryFn: (number) => patientsService.findByMedicalRecordNumber(number!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
    retry: 1
  },
});

export const usePatientByNik = createQueryHook({
  queryKey: (nik?: string) => 
    cacheManager.getByNikQueryKey(nik!),
  queryFn: (nik) => patientsService.findByNik(nik!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
    retry: 1
  },
});

export const usePatientsByDoctor = createQueryHook({
  queryKey: (params?: { doctorId?: string } & PatientByDoctorParams) => {
    if (!params?.doctorId) {
      return [];
    }
    return cacheManager.getByDoctorQueryKey(params.doctorId, params);
  },
  queryFn: (params?: { doctorId?: string } & PatientByDoctorParams) => {
    if (!params?.doctorId) {
      throw new Error("doctorId wajib ada untuk memanggil queryFn");
    }
    return patientsService.findByDoctor(params.doctorId, params);
  },
  options: {
    enabled: false,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  },
});