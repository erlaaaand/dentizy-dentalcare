import { toast } from 'sonner';
import { createMutationHook } from '../../service/base/use-query-factory';
import { patientsService } from '../../service/api/patients/patient.api';
import type {
  CreatePatientDto,
  UpdatePatientDto,
} from '../../types/patients/patient.types';
import { PatientsCacheManager } from '../../service/api/patients/cache/cache.manager';

const cacheManager = new PatientsCacheManager();

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