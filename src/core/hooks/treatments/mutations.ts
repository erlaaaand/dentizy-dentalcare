import { toast } from 'sonner';
import { createMutationHook } from '../../service/base/use-query-factory';
import { treatmentsService } from '../../service/api/treatments/treatment.api';
import type {
  CreateTreatmentDto,
  UpdateTreatmentDto,
} from '../../types/treatments/treatment.types';
import { TreatmentsCacheManager } from '../../service/api/treatments';

const cacheManager = new TreatmentsCacheManager();

export const useCreateTreatment = createMutationHook({
  mutationFn: (data: CreateTreatmentDto) => treatmentsService.create(data),
  onSuccess: (_, __, queryClient) => {
    toast.success('Treatment berhasil dibuat');
    cacheManager.invalidateAll(queryClient);
  },
  onError: () => {
    toast.error('Gagal membuat treatment');
  }
});

export const useUpdateTreatment = createMutationHook({
  mutationFn: ({ id, data }: { id: string; data: UpdateTreatmentDto }) =>
    treatmentsService.update(id, data),
  onSuccess: (_, { id }, queryClient) => {
    toast.success('Treatment berhasil diperbarui');
    cacheManager.invalidateDetail(queryClient, id);
    cacheManager.invalidateList(queryClient);
  },
  onError: () => {
    toast.error('Gagal memperbarui treatment');
  }
});

export const useRemoveTreatment = createMutationHook({
  mutationFn: (id: string) => treatmentsService.remove(id),
  onSuccess: (_, __, queryClient) => {
    toast.success('Treatment berhasil dihapus');
    cacheManager.invalidateAll(queryClient);
  },
  onError: () => {
    toast.error('Gagal menghapus treatment');
  }
});

export const useRestoreTreatment = createMutationHook({
  mutationFn: (id: string) => treatmentsService.restore(id),
  onSuccess: (_, __, queryClient) => {
    toast.success('Treatment berhasil dipulihkan');
    cacheManager.invalidateAll(queryClient);
  },
  onError: () => {
    toast.error('Gagal memulihkan treatment');
  }
});

export const useActivateTreatment = createMutationHook({
  mutationFn: (id: string) => treatmentsService.activate(id),
  onSuccess: (_data, id, queryClient) => {
    toast.success('Treatment berhasil diaktifkan');
    cacheManager.optimisticUpdate(queryClient, id, (old) => ({
      ...old,
      isActive: true,
    }));
    cacheManager.invalidateList(queryClient);
  },
  onError: () => {
    toast.error('Gagal mengaktifkan treatment');
  }
});

export const useDeactivateTreatment = createMutationHook({
  mutationFn: (id: string) => treatmentsService.deactivate(id),
  onSuccess: (_data, id, queryClient) => {
    toast.success('Treatment berhasil dinonaktifkan');
    cacheManager.optimisticUpdate(queryClient, id, (old) => ({
      ...old,
      isActive: false,
    }));
    cacheManager.invalidateList(queryClient);
  },
  onError: () => {
    toast.error('Gagal menonaktifkan treatment');
  }
});