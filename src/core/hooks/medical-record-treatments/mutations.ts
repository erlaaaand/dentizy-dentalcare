import { toast } from 'sonner';
import { createMutationHook } from '../../service/base/use-query-factory';
import { medicalRecordTreatmentsService } from '../../service/api/medical-record-treatments/medical-record-treatments.api';
import type {
  CreateMedicalRecordTreatmentDto,
  UpdateMedicalRecordTreatmentDto,
} from '../../types/medical-record-treatments/medical-record-treatments.types';
import { MedicalRecordTreatmentsCacheManager } from '../../service/api/medical-record-treatments/cache/cache.manager';

const cacheManager = new MedicalRecordTreatmentsCacheManager();

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