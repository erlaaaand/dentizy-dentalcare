import { toast } from 'sonner';
import { createMutationHook } from '../../service/base/use-query-factory';
import { treatmentCategoriesService } from '../../service/api/treatment-categories/treatment-categories.api';
import { TreatmentCategoriesCacheManager } from '../../service/api/treatment-categories/cache/cache.manager';
import type {
  CreateTreatmentCategoryDto,
  UpdateTreatmentCategoryDto,
} from '../../types/treatment-categories/treatment-categories.types';

const cacheManager = new TreatmentCategoriesCacheManager();

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