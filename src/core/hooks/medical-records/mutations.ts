import { toast } from 'sonner';
import { createMutationHook } from '../../service/base/use-query-factory';
import { medicalRecordsService } from '../../service/api/medical-records/medical-record.api';
import type {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
} from '../../types/medical-records/medical-record.types';
import { MedicalRecordsCacheManager } from '../../service/api/medical-records/cache/cache.manager';

const cacheManager = new MedicalRecordsCacheManager();

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