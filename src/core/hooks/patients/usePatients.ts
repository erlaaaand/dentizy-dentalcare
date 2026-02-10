import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createQueryHook, createMutationHook } from '../../service/base/use-query-factory';
import { patientsService } from '../../service/api/patients/patient.api';
import type {
  PatientQueryParams,
  PatientSearchParams,
  PatientByDoctorParams,
  CreatePatientDto,
  UpdatePatientDto,
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

export const useCreatePatient = createMutationHook({
  mutationFn: (data: CreatePatientDto) => patientsService.create(data),
  onSuccess: (_, __, queryClient) => {
    toast.success('Pasien berhasil didaftarkan');
    cacheManager.invalidateAll(queryClient);
    cacheManager.invalidateStatistics(queryClient);
  },
  onError: () => {
    toast.error('Gagal mendaftarkan pasien');
  }
});

export const useUpdatePatient = createMutationHook({
  mutationFn: ({ id, data }: { id: string; data: UpdatePatientDto }) =>
    patientsService.update(id, data),
  onSuccess: (_, { id }, queryClient) => {
    toast.success('Data pasien berhasil diperbarui');
    cacheManager.invalidateDetail(queryClient, id);
    cacheManager.invalidateList(queryClient);
  },
  onError: () => {
    toast.error('Gagal memperbarui data pasien');
  }
});

export const useRemovePatient = createMutationHook({
  mutationFn: (id: string) => patientsService.remove(id),
  onSuccess: (_, __, queryClient) => {
    toast.success('Pasien berhasil dihapus');
    cacheManager.invalidateAll(queryClient);
    cacheManager.invalidateStatistics(queryClient);
  },
  onError: () => {
    toast.error('Gagal menghapus pasien');
  }
});

export const useActivatePatient = createMutationHook({
  mutationFn: (id: string) => patientsService.activate(id),
  onSuccess: (_, id, queryClient) => {
    toast.success('Pasien berhasil diaktifkan');
    cacheManager.invalidateDetail(queryClient, id);
    cacheManager.invalidateList(queryClient);
    cacheManager.invalidateStatistics(queryClient);
  },
  onError: () => {
    toast.error('Gagal mengaktifkan pasien');
  }
});

export const useRestorePatient = createMutationHook({
  mutationFn: (id: string) => patientsService.restore(id),
  onSuccess: (_, __, queryClient) => {
    toast.success('Pasien berhasil dipulihkan');
    cacheManager.invalidateAll(queryClient);
    cacheManager.invalidateStatistics(queryClient);
  },
  onError: () => {
    toast.error('Gagal memulihkan pasien');
  }
});

export function usePatientMutations() {
  const create = useCreatePatient();
  const update = useUpdatePatient();
  const remove = useRemovePatient();
  const activate = useActivatePatient();
  const restore = useRestorePatient();

  return {
    create: create.mutate,
    createAsync: create.mutateAsync,
    update: update.mutate,
    updateAsync: update.mutateAsync,
    remove: remove.mutate,
    removeAsync: remove.mutateAsync,
    activate: activate.mutate,
    activateAsync: activate.mutateAsync,
    restore: restore.mutate,
    restoreAsync: restore.mutateAsync,

    isCreating: create.isPending,
    isUpdating: update.isPending,
    isRemoving: remove.isPending,
    isActivating: activate.isPending,
    isRestoring: restore.isPending,
    
    isMutating: 
      create.isPending || 
      update.isPending || 
      remove.isPending || 
      activate.isPending || 
      restore.isPending,

    createError: create.error,
    updateError: update.error,
    removeError: remove.error,
    activateError: activate.error,
    restoreError: restore.error,
    
    resetCreate: create.reset,
    resetUpdate: update.reset,
    resetRemove: remove.reset,
    resetActivate: activate.reset,
    resetRestore: restore.reset,
  };
}

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