import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createQueryHook, createMutationHook } from '../../service/base/use-query-factory';
import { treatmentsService } from '../../service/api/treatments/treatment.api';
import type {
  TreatmentQueryParams,
  CreateTreatmentDto,
  UpdateTreatmentDto,
} from '../../types/treatments/treatment.types';

// ==================== QUERY HOOKS ====================

export const useTreatments = createQueryHook({
  queryKey: (params?: TreatmentQueryParams) => 
    treatmentsService.getListQueryKey(params),
  queryFn: (params) => treatmentsService.findAll(params),
  options: {
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  },
});

export const useTreatment = createQueryHook({
  queryKey: (id?: number) => treatmentsService.getDetailQueryKey(id!),
  queryFn: (id) => treatmentsService.findOne(id!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
  },
});

export const useTreatmentByKode = createQueryHook({
  queryKey: (kode?: string) => treatmentsService.getByKodeQueryKey(kode!),
  queryFn: (kode) => treatmentsService.findByKode(kode!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
  },
});

// ==================== MUTATION HOOKS ====================

export const useCreateTreatment = createMutationHook({
  mutationFn: (data: CreateTreatmentDto) => treatmentsService.create(data),
  onSuccess: (_, __, queryClient) => {
    toast.success('Treatment berhasil dibuat');
    treatmentsService.invalidateAll(queryClient);
  },
  onError: () => {
    toast.error('Gagal membuat treatment');
  }
});

export const useUpdateTreatment = createMutationHook({
  mutationFn: ({ id, data }: { id: number; data: UpdateTreatmentDto }) =>
    treatmentsService.update(id, data),
  onSuccess: (_, { id }, queryClient) => {
    toast.success('Treatment berhasil diperbarui');
    treatmentsService.invalidateDetail(queryClient, id);
    treatmentsService.invalidateList(queryClient);
  },
  onError: () => {
    toast.error('Gagal memperbarui treatment');
  }
});

export const useRemoveTreatment = createMutationHook({
  mutationFn: (id: number) => treatmentsService.remove(id),
  onSuccess: (_, __, queryClient) => {
    toast.success('Treatment berhasil dihapus');
    treatmentsService.invalidateAll(queryClient);
  },
  onError: () => {
    toast.error('Gagal menghapus treatment');
  }
});

export const useRestoreTreatment = createMutationHook({
  mutationFn: (id: number) => treatmentsService.restore(id),
  onSuccess: (_, __, queryClient) => {
    toast.success('Treatment berhasil dipulihkan');
    treatmentsService.invalidateAll(queryClient);
  },
  onError: () => {
    toast.error('Gagal memulihkan treatment');
  }
});

export const useActivateTreatment = createMutationHook({
  mutationFn: (id: number) => treatmentsService.activate(id),
  onSuccess: (data, id, queryClient) => {
    toast.success('Treatment berhasil diaktifkan');
    treatmentsService.optimisticUpdate(queryClient, id, (old) => ({
      ...old,
      isActive: true,
    }));
    treatmentsService.invalidateList(queryClient);
  },
  onError: () => {
    toast.error('Gagal mengaktifkan treatment');
  }
});

export const useDeactivateTreatment = createMutationHook({
  mutationFn: (id: number) => treatmentsService.deactivate(id),
  onSuccess: (data, id, queryClient) => {
    toast.success('Treatment berhasil dinonaktifkan');
    treatmentsService.optimisticUpdate(queryClient, id, (old) => ({
      ...old,
      isActive: false,
    }));
    treatmentsService.invalidateList(queryClient);
  },
  onError: () => {
    toast.error('Gagal menonaktifkan treatment');
  }
});

// ==================== COMBINED MUTATIONS HOOK ====================

export function useTreatmentMutations() {
  const create = useCreateTreatment();
  const update = useUpdateTreatment();
  const remove = useRemoveTreatment();
  const restore = useRestoreTreatment();
  const activate = useActivateTreatment();
  const deactivate = useDeactivateTreatment();

  return {
    create: create.mutate,
    createAsync: create.mutateAsync,
    update: update.mutate,
    updateAsync: update.mutateAsync,
    remove: remove.mutate,
    removeAsync: remove.mutateAsync,
    restore: restore.mutate,
    restoreAsync: restore.mutateAsync,
    activate: activate.mutate,
    activateAsync: activate.mutateAsync,
    deactivate: deactivate.mutate,
    deactivateAsync: deactivate.mutateAsync,

    isCreating: create.isPending,
    isUpdating: update.isPending,
    isRemoving: remove.isPending,
    isRestoring: restore.isPending,
    isActivating: activate.isPending,
    isDeactivating: deactivate.isPending,
    
    isMutating: 
      create.isPending || 
      update.isPending || 
      remove.isPending || 
      restore.isPending || 
      activate.isPending || 
      deactivate.isPending,

    createError: create.error,
    updateError: update.error,
    removeError: remove.error,
    restoreError: restore.error,
    activateError: activate.error,
    deactivateError: deactivate.error,
    
    resetCreate: create.reset,
    resetUpdate: update.reset,
    resetRemove: remove.reset,
    resetRestore: restore.reset,
    resetActivate: activate.reset,
    resetDeactivate: deactivate.reset,
  };
}

// ==================== STATUS TOGGLE HOOK ====================

export function useTreatmentStatusToggle(onSuccess?: () => void) {
  const activate = useActivateTreatment();
  const deactivate = useDeactivateTreatment();

  const toggleStatus = async (id: number, isActive: boolean) => {
    try {
      if (isActive) {
        await activate.mutateAsync(id);
      } else {
        await deactivate.mutateAsync(id);
      }
      onSuccess?.();
    } catch (error) {
      // Error sudah di-handle di mutation hook
      throw error;
    }
  };

  return {
    toggleStatus,
    isToggling: activate.isPending || deactivate.isPending,
  };
}

// ==================== UTILITY HOOKS ====================

export function usePrefetchTreatment() {
  const queryClient = useQueryClient();
  
  return {
    prefetchList: (params?: TreatmentQueryParams) =>
      treatmentsService.prefetchList(queryClient, params),
    prefetchDetail: (id: number) =>
      treatmentsService.prefetchDetail(queryClient, id),
  };
}

export function useInvalidateTreatments() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => treatmentsService.invalidateAll(queryClient),
    invalidateList: (params?: TreatmentQueryParams) => 
      treatmentsService.invalidateList(queryClient, params),
    invalidateDetail: (id: number) => 
      treatmentsService.invalidateDetail(queryClient, id),
    invalidateByKode: (kode: string) =>
      treatmentsService.invalidateByKode(queryClient, kode),
  };
}