import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createQueryHook, createMutationHook } from '../../service/base/use-query-factory';
import { medicalRecordTreatmentsService } from '../../service/api/medical-record-treatments/medical-record-treatments.api';
import type {
  MedicalRecordTreatmentQueryParams,
  TopTreatmentsParams,
  CreateMedicalRecordTreatmentDto,
  UpdateMedicalRecordTreatmentDto,
} from '../../types/medical-record-treatments/medical-record-treatments.types';
import { MedicalRecordTreatmentsCacheManager } from '../../service/api/medical-record-treatments/cache/cache.manager';

const cacheManager = new MedicalRecordTreatmentsCacheManager();

// ==================== QUERY HOOKS ====================

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

// ==================== MUTATION HOOKS ====================

export const useCreateMedicalRecordTreatment = createMutationHook({
  mutationFn: (data: CreateMedicalRecordTreatmentDto) => 
    medicalRecordTreatmentsService.create(data),
  onSuccess: (data, __, queryClient) => {
    toast.success('Treatment berhasil ditambahkan');
    cacheManager.invalidateAll(queryClient);
    
    if (data.medicalRecordId) {
      cacheManager.invalidateByMedicalRecordId(queryClient, data.medicalRecordId);
      cacheManager.invalidateTotalByMedicalRecordId(queryClient, data.medicalRecordId);
    }
  },
  onError: () => {
    toast.error('Gagal menambahkan treatment');
  }
});

export const useUpdateMedicalRecordTreatment = createMutationHook({
  mutationFn: ({ id, data }: { id: string; data: UpdateMedicalRecordTreatmentDto }) =>
    medicalRecordTreatmentsService.update(id, data),
  onSuccess: (data, __, queryClient) => {
    toast.success('Treatment berhasil diperbarui');
    cacheManager.invalidateAll(queryClient);
    
    if (data.medicalRecordId) {
      cacheManager.invalidateByMedicalRecordId(queryClient, data.medicalRecordId);
      cacheManager.invalidateTotalByMedicalRecordId(queryClient, data.medicalRecordId);
    }
  },
  onError: () => {
    toast.error('Gagal memperbarui treatment');
  }
});

export const useRemoveMedicalRecordTreatment = createMutationHook({
  mutationFn: (id: string) => medicalRecordTreatmentsService.remove(id),
  onSuccess: (_, __, queryClient) => {
    toast.success('Treatment berhasil dihapus');
    cacheManager.invalidateAll(queryClient);
  },
  onError: () => {
    toast.error('Gagal menghapus treatment');
  }
});

// ==================== COMBINED MUTATIONS HOOK ====================

export function useMedicalRecordTreatmentMutations() {
  const create = useCreateMedicalRecordTreatment();
  const update = useUpdateMedicalRecordTreatment();
  const remove = useRemoveMedicalRecordTreatment();

  return {
    createTreatment: create.mutate,
    createTreatmentAsync: create.mutateAsync,
    updateTreatment: update.mutate,
    updateTreatmentAsync: update.mutateAsync,
    deleteTreatment: remove.mutate,
    deleteTreatmentAsync: remove.mutateAsync,

    isCreating: create.isPending,
    isUpdating: update.isPending,
    isDeleting: remove.isPending,
    
    isMutating: create.isPending || update.isPending || remove.isPending,

    createError: create.error,
    updateError: update.error,
    deleteError: remove.error,
    
    resetCreate: create.reset,
    resetUpdate: update.reset,
    resetDelete: remove.reset,
  };
}

// ==================== MEDICAL RECORD MANAGER HOOK ====================

export function useMedicalRecordTreatmentManager(medicalRecordId: string) {
  
  const treatments = useMedicalRecordTreatmentsByRecordId(medicalRecordId, {
    enabled: !!medicalRecordId
  });
  
  const total = useMedicalRecordTreatmentTotal(medicalRecordId, {
    enabled: !!medicalRecordId
  });
  
  const mutations = useMedicalRecordTreatmentMutations();

  const refetchAll = async () => {
    await Promise.all([
      treatments.refetch(),
      total.refetch()
    ]);
  };

  return {
    treatments: treatments.data || [],
    total: total.data?.data?.total || 0,
    isLoadingTreatments: treatments.isLoading,
    isLoadingTotal: total.isLoading,
    isLoading: treatments.isLoading || total.isLoading,
    refetchTreatments: treatments.refetch,
    refetchTotal: total.refetch,
    refetchAll,
    ...mutations
  };
}

// ==================== UTILITY HOOKS ====================

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