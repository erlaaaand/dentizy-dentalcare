import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createQueryHook, createMutationHook } from '../../service/base/use-query-factory';
import { medicalRecordsService } from '../../service/api/medical-records/medical-record.api';
import type {
  MedicalRecordQueryParams,
  MedicalRecordSearchParams,
  DoctorStatsParams,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
} from '../../types/medical-records/medical-record.types';

import { MedicalRecordsCacheManager } from '../../service/api/medical-records/cache/cache.manager';

const cacheManager = new MedicalRecordsCacheManager();

// ==================== QUERY HOOKS ====================

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

// ==================== MUTATION HOOKS ====================

export const useCreateMedicalRecord = createMutationHook({
  mutationFn: (data: CreateMedicalRecordDto) => 
    medicalRecordsService.create(data),
  onSuccess: (_, __, queryClient) => {
    toast.success('Rekam medis berhasil dibuat');
    cacheManager.invalidateAll(queryClient);
  },
  onError: () => {
    toast.error('Gagal membuat rekam medis');
  }
});

export const useUpdateMedicalRecord = createMutationHook({
  mutationFn: ({ id, data }: { id: string; data: UpdateMedicalRecordDto }) =>
    medicalRecordsService.update(id, data),
  onSuccess: (_, { id }, queryClient) => {
    toast.success('Rekam medis berhasil diperbarui');
    cacheManager.invalidateDetail(queryClient, id);
    cacheManager.invalidateList(queryClient);
  },
  onError: () => {
    toast.error('Gagal memperbarui rekam medis');
  }
});

export const useRemoveMedicalRecord = createMutationHook({
  mutationFn: (id: string) => medicalRecordsService.remove(id),
  onSuccess: (_, __, queryClient) => {
    toast.success('Rekam medis berhasil dihapus');
    cacheManager.invalidateAll(queryClient);
  },
  onError: () => {
    toast.error('Gagal menghapus rekam medis');
  }
});

export const useRestoreMedicalRecord = createMutationHook({
  mutationFn: (id: string) => medicalRecordsService.restore(id),
  onSuccess: (_, __, queryClient) => {
    toast.success('Rekam medis berhasil dipulihkan');
    cacheManager.invalidateAll(queryClient);
  },
  onError: () => {
    toast.error('Gagal memulihkan rekam medis');
  }
});

export const useHardDeleteMedicalRecord = createMutationHook({
  mutationFn: (id: string) => medicalRecordsService.hardDelete(id),
  onSuccess: (_, __, queryClient) => {
    toast.success('Rekam medis berhasil dihapus permanen');
    cacheManager.invalidateAll(queryClient);
  },
  onError: () => {
    toast.error('Gagal menghapus permanen rekam medis');
  }
});

// ==================== COMBINED MUTATIONS HOOK ====================

export function useMedicalRecordMutations() {
  const create = useCreateMedicalRecord();
  const update = useUpdateMedicalRecord();
  const remove = useRemoveMedicalRecord();
  const restore = useRestoreMedicalRecord();
  const hardDelete = useHardDeleteMedicalRecord();

  return {
    create: create.mutate,
    createAsync: create.mutateAsync,
    update: update.mutate,
    updateAsync: update.mutateAsync,
    remove: remove.mutate,
    removeAsync: remove.mutateAsync,
    restore: restore.mutate,
    restoreAsync: restore.mutateAsync,
    hardDelete: hardDelete.mutate,
    hardDeleteAsync: hardDelete.mutateAsync,
    
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isRemoving: remove.isPending,
    isRestoring: restore.isPending,
    isHardDeleting: hardDelete.isPending,
    
    isMutating: 
      create.isPending || 
      update.isPending || 
      remove.isPending || 
      restore.isPending || 
      hardDelete.isPending,
    
    createError: create.error,
    updateError: update.error,
    removeError: remove.error,
    restoreError: restore.error,
    hardDeleteError: hardDelete.error,
    
    resetCreate: create.reset,
    resetUpdate: update.reset,
    resetRemove: remove.reset,
    resetRestore: restore.reset,
    resetHardDelete: hardDelete.reset,
  };
}

// ==================== UTILITY HOOKS ====================

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