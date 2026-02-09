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

// ==================== QUERY HOOKS ====================

export const useMedicalRecordTreatments = createQueryHook({
  queryKey: (params?: MedicalRecordTreatmentQueryParams) => 
    medicalRecordTreatmentsService.getListQueryKey(params),
  queryFn: (params) => medicalRecordTreatmentsService.findAll(params),
  options: {
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  },
});

export const useMedicalRecordTreatment = createQueryHook({
  queryKey: (id?: number) => medicalRecordTreatmentsService.getDetailQueryKey(id!),
  queryFn: (id) => medicalRecordTreatmentsService.findOne(id!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
  },
});

export const useMedicalRecordTreatmentsByRecordId = createQueryHook({
  queryKey: (medicalRecordId?: number) => 
    medicalRecordTreatmentsService.getByMedicalRecordIdQueryKey(medicalRecordId!),
  queryFn: (medicalRecordId) => 
    medicalRecordTreatmentsService.findByMedicalRecordId(medicalRecordId!),
  options: {
    enabled: false,
    staleTime: 30 * 1000,
  },
});

export const useMedicalRecordTreatmentTotal = createQueryHook({
  queryKey: (medicalRecordId?: number) => 
    medicalRecordTreatmentsService.getTotalByMedicalRecordIdQueryKey(medicalRecordId!),
  queryFn: (medicalRecordId) => 
    medicalRecordTreatmentsService.getTotalByMedicalRecordId(medicalRecordId!),
  options: {
    enabled: false,
    staleTime: 30 * 1000,
  },
});

export const useTopTreatments = createQueryHook({
  queryKey: (params?: TopTreatmentsParams) => 
    medicalRecordTreatmentsService.getTopTreatmentsQueryKey(params),
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
    medicalRecordTreatmentsService.invalidateAll(queryClient);
    
    if (data.medicalRecordId) {
      medicalRecordTreatmentsService.invalidateByMedicalRecordId(queryClient, data.medicalRecordId);
      medicalRecordTreatmentsService.invalidateTotalByMedicalRecordId(queryClient, data.medicalRecordId);
    }
  },
  onError: () => {
    toast.error('Gagal menambahkan treatment');
  }
});

export const useUpdateMedicalRecordTreatment = createMutationHook({
  mutationFn: ({ id, data }: { id: number; data: UpdateMedicalRecordTreatmentDto }) =>
    medicalRecordTreatmentsService.update(id, data),
  onSuccess: (data, __, queryClient) => {
    toast.success('Treatment berhasil diperbarui');
    medicalRecordTreatmentsService.invalidateAll(queryClient);
    
    if (data.medicalRecordId) {
      medicalRecordTreatmentsService.invalidateByMedicalRecordId(queryClient, data.medicalRecordId);
      medicalRecordTreatmentsService.invalidateTotalByMedicalRecordId(queryClient, data.medicalRecordId);
    }
  },
  onError: () => {
    toast.error('Gagal memperbarui treatment');
  }
});

export const useRemoveMedicalRecordTreatment = createMutationHook({
  mutationFn: (id: number) => medicalRecordTreatmentsService.remove(id),
  onSuccess: (_, __, queryClient) => {
    toast.success('Treatment berhasil dihapus');
    medicalRecordTreatmentsService.invalidateAll(queryClient);
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

export function useMedicalRecordTreatmentManager(medicalRecordId: number) {
  const queryClient = useQueryClient();
  
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
      medicalRecordTreatmentsService.prefetchList(queryClient, params),
    prefetchDetail: (id: number) =>
      medicalRecordTreatmentsService.prefetchDetail(queryClient, id),
    prefetchByMedicalRecordId: (medicalRecordId: number) =>
      medicalRecordTreatmentsService.prefetchByMedicalRecordId(queryClient, medicalRecordId),
  };
}

export function useInvalidateMedicalRecordTreatments() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => medicalRecordTreatmentsService.invalidateAll(queryClient),
    invalidateList: (params?: MedicalRecordTreatmentQueryParams) => 
      medicalRecordTreatmentsService.invalidateList(queryClient, params),
    invalidateDetail: (id: number) => 
      medicalRecordTreatmentsService.invalidateDetail(queryClient, id),
    invalidateByMedicalRecordId: (medicalRecordId: number) =>
      medicalRecordTreatmentsService.invalidateByMedicalRecordId(queryClient, medicalRecordId),
    invalidateTotalByMedicalRecordId: (medicalRecordId: number) =>
      medicalRecordTreatmentsService.invalidateTotalByMedicalRecordId(queryClient, medicalRecordId),
    invalidateTopTreatments: (params?: TopTreatmentsParams) =>
      medicalRecordTreatmentsService.invalidateTopTreatments(queryClient, params),
  };
}