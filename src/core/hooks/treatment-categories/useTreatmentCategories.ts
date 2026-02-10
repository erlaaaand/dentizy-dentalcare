import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createQueryHook, createMutationHook } from '../../service/base/use-query-factory';
import { treatmentCategoriesService } from '../../service/api/treatment-categories/treatment-categories.api';
import { treatmentCategoriesHelpers } from '../../service/api/treatment-categories/helpers/treatment-categories.helpers';
import { treatmentCategoriesValidators } from '../../service/api/treatment-categories/validators/treatment-categories.validators';
import { TreatmentCategoriesCacheManager } from '../../service/api/treatment-categories/cache/cache.manager';
import type {
  CreateTreatmentCategoryDto,
  UpdateTreatmentCategoryDto,
  TreatmentCategoriesControllerFindAllParams,
  TreatmentCategoryValidation,
  CreateTreatmentCategoryFormData,
  UpdateTreatmentCategoryFormData,
} from '../../types/treatment-categories/treatment-categories.types';


const cacheManager = new TreatmentCategoriesCacheManager();

export const useTreatmentCategories = createQueryHook({
  queryKey: (params?: TreatmentCategoriesControllerFindAllParams) =>
    cacheManager.getListQueryKey(params),
  queryFn: (params) => treatmentCategoriesService.findAll(params),
  options: {
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  },
});

export const useTreatmentCategory = createQueryHook({
  queryKey: (id?: number) => cacheManager.getDetailQueryKey(id!),
  queryFn: (id) => treatmentCategoriesService.findOne(id!),
  options: {
    enabled: false,
    staleTime: 60 * 1000,
    retry: 1,
  },
});

export const useCreateTreatmentCategory = createMutationHook({
  mutationFn: (data: CreateTreatmentCategoryDto) => treatmentCategoriesService.create(data),
  onSuccess: (_, __, queryClient) => {
    toast.success('Kategori perawatan berhasil ditambahkan');
    cacheManager.invalidateAll(queryClient);
  },
  onError: () => {
    toast.error('Gagal menambahkan kategori perawatan');
  },
});

export const useUpdateTreatmentCategory = createMutationHook({
  mutationFn: ({ id, data }: { id: number; data: UpdateTreatmentCategoryDto }) =>
    treatmentCategoriesService.update(id, data),
  onSuccess: (_, { id }, queryClient) => {
    toast.success('Kategori perawatan berhasil diperbarui');
    cacheManager.invalidateDetail(queryClient, id);
    cacheManager.invalidateList(queryClient);
  },
  onError: () => {
    toast.error('Gagal memperbarui kategori perawatan');
  },
});

export const useRemoveTreatmentCategory = createMutationHook({
  mutationFn: (id: number) => treatmentCategoriesService.remove(id),
  onSuccess: (_, __, queryClient) => {
    toast.success('Kategori perawatan berhasil dihapus');
    cacheManager.invalidateAll(queryClient);
  },
  onError: () => {
    toast.error('Gagal menghapus kategori perawatan');
  },
});

export const useRestoreTreatmentCategory = createMutationHook({
  mutationFn: (id: number) => treatmentCategoriesService.restore(id),
  onSuccess: (_, __, queryClient) => {
    toast.success('Kategori perawatan berhasil dipulihkan');
    cacheManager.invalidateAll(queryClient);
  },
  onError: () => {
    toast.error('Gagal memulihkan kategori perawatan');
  },
});

export function useTreatmentCategoryValidation() {
  return {
    validateCreate: (data: CreateTreatmentCategoryFormData): TreatmentCategoryValidation =>
      treatmentCategoriesValidators.validateCreate(data),
    validateUpdate: (data: UpdateTreatmentCategoryFormData): TreatmentCategoryValidation =>
      treatmentCategoriesValidators.validateUpdate(data),
  };
}

export function useTreatmentCategoryMutations() {
  const create = useCreateTreatmentCategory();
  const update = useUpdateTreatmentCategory();
  const remove = useRemoveTreatmentCategory();
  const restore = useRestoreTreatmentCategory();

  return {
    create: create.mutate,
    createAsync: create.mutateAsync,
    update: update.mutate,
    updateAsync: update.mutateAsync,
    remove: remove.mutate,
    removeAsync: remove.mutateAsync,
    restore: restore.mutate,
    restoreAsync: restore.mutateAsync,

    isCreating: create.isPending,
    isUpdating: update.isPending,
    isRemoving: remove.isPending,
    isRestoring: restore.isPending,

    isMutating:
      create.isPending ||
      update.isPending ||
      remove.isPending ||
      restore.isPending,

    createError: create.error,
    updateError: update.error,
    removeError: remove.error,
    restoreError: restore.error,

    resetCreate: create.reset,
    resetUpdate: update.reset,
    resetRemove: remove.reset,
    resetRestore: restore.reset,
  };
}

export function usePrefetchTreatmentCategories() {
  const queryClient = useQueryClient();

  return {
    prefetchList: (params?: TreatmentCategoriesControllerFindAllParams) =>
      cacheManager.prefetchList(queryClient, params),
    prefetchDetail: (id: number) =>
      cacheManager.prefetchDetail(queryClient, id),
  };
}

export function useInvalidateTreatmentCategories() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => cacheManager.invalidateAll(queryClient),
    invalidateList: (params?: TreatmentCategoriesControllerFindAllParams) =>
      cacheManager.invalidateList(queryClient, params),
    invalidateDetail: (id: number) =>
      cacheManager.invalidateDetail(queryClient, id),
  };
}

// Export helpers & types
export { treatmentCategoriesHelpers };
export type {
  CreateTreatmentCategoryDto,
  UpdateTreatmentCategoryDto,
  TreatmentCategoryValidation,
  CreateTreatmentCategoryFormData,
  UpdateTreatmentCategoryFormData,
};