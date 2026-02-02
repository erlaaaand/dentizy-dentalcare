import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  useMedicalRecordsControllerCreate,
  useMedicalRecordsControllerFindAll,
  useMedicalRecordsControllerSearch,
  useMedicalRecordsControllerFindByAppointmentId,
  useMedicalRecordsControllerGetDoctorStats,
  useMedicalRecordsControllerFindOne,
  useMedicalRecordsControllerUpdate,
  useMedicalRecordsControllerRemove,
  useMedicalRecordsControllerRestore,
  useMedicalRecordsControllerHardDelete,
  getMedicalRecordsControllerFindAllQueryKey,
  getMedicalRecordsControllerSearchQueryKey,
  getMedicalRecordsControllerGetDoctorStatsQueryKey
} from '../../api/generated/medical-records/medical-records';

import type {
  MedicalRecordQueryParams,
  MedicalRecordSearchParams,
  DoctorStatsParams
} from '../../types/medical-records/medical-record.types';

/**
 * Hook untuk mendapatkan daftar rekam medis dengan pagination
 */
export const useMedicalRecords = (params?: MedicalRecordQueryParams) => {
  return useMedicalRecordsControllerFindAll(params, {
    query: {
      placeholderData: keepPreviousData,
      staleTime: 30 * 1000, // 30 detik
      retry: 1
    }
  });
};

/**
 * Hook untuk mendapatkan detail rekam medis berdasarkan ID
 */
export const useMedicalRecord = (id: string) => {
  return useMedicalRecordsControllerFindOne(id, {
    query: {
      enabled: !!id,
      staleTime: 60 * 1000, // 1 menit
      retry: 1
    }
  });
};

/**
 * Hook untuk pencarian rekam medis
 */
export const useMedicalRecordSearch = (params?: MedicalRecordSearchParams) => {
  return useMedicalRecordsControllerSearch(params, {
    query: {
      enabled: !!params && Object.keys(params).length > 0,
      placeholderData: keepPreviousData,
      staleTime: 30 * 1000
    }
  });
};

/**
 * Hook untuk mendapatkan rekam medis berdasarkan appointment ID
 */
export const useMedicalRecordByAppointment = (appointmentId: string) => {
  return useMedicalRecordsControllerFindByAppointmentId(appointmentId, {
    query: {
      enabled: !!appointmentId,
      staleTime: 60 * 1000,
      retry: 1
    }
  });
};

/**
 * Hook untuk mendapatkan statistik dokter
 */
export const useDoctorStats = (params?: DoctorStatsParams) => {
  return useMedicalRecordsControllerGetDoctorStats(params, {
    query: {
      staleTime: 5 * 60 * 1000, // 5 menit
      placeholderData: keepPreviousData
    }
  });
};

/**
 * Hook untuk membuat rekam medis baru
 */
export const useCreateMedicalRecord = () => {
  const queryClient = useQueryClient();

  return useMedicalRecordsControllerCreate({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 201) {
          toast.success('Rekam medis berhasil dibuat');
          
          // Invalidate related queries
          queryClient.invalidateQueries({
            queryKey: getMedicalRecordsControllerFindAllQueryKey()
          });
          queryClient.invalidateQueries({
            queryKey: ['/appointments']
          });
        }
      },
      onError: (error) => {
        toast.error('Gagal membuat rekam medis');
        console.error('Create medical record error:', error);
      }
    }
  });
};

/**
 * Hook untuk update rekam medis
 */
export const useUpdateMedicalRecord = () => {
  const queryClient = useQueryClient();

  return useMedicalRecordsControllerUpdate({
    mutation: {
      onSuccess: (response, { id }) => {
        if (response.status === 200) {
          toast.success('Rekam medis berhasil diperbarui');
          
          // Invalidate specific record and list
          queryClient.invalidateQueries({
            queryKey: ['/medical-records', id]
          });
          queryClient.invalidateQueries({
            queryKey: getMedicalRecordsControllerFindAllQueryKey()
          });
        }
      },
      onError: (error) => {
        toast.error('Gagal memperbarui rekam medis');
        console.error('Update medical record error:', error);
      }
    }
  });
};

/**
 * Hook untuk soft delete rekam medis
 */
export const useRemoveMedicalRecord = () => {
  const queryClient = useQueryClient();

  return useMedicalRecordsControllerRemove({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 200) {
          toast.success('Rekam medis berhasil dihapus');
          
          queryClient.invalidateQueries({
            queryKey: ['/medical-records']
          });
        }
      },
      onError: (error) => {
        toast.error('Gagal menghapus rekam medis. Anda mungkin tidak memiliki izin.');
        console.error('Remove medical record error:', error);
      }
    }
  });
};

/**
 * Hook untuk restore rekam medis yang di-soft delete
 */
export const useRestoreMedicalRecord = () => {
  const queryClient = useQueryClient();

  return useMedicalRecordsControllerRestore({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 200) {
          toast.success('Rekam medis berhasil dipulihkan');
          
          queryClient.invalidateQueries({
            queryKey: ['/medical-records']
          });
        }
      },
      onError: (error) => {
        toast.error('Gagal memulihkan rekam medis. Anda mungkin tidak memiliki izin.');
        console.error('Restore medical record error:', error);
      }
    }
  });
};

/**
 * Hook untuk hard delete rekam medis (permanent)
 * PERHATIAN: Aksi ini tidak dapat dibatalkan!
 */
export const useHardDeleteMedicalRecord = () => {
  const queryClient = useQueryClient();

  return useMedicalRecordsControllerHardDelete({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 204) {
          toast.success('Rekam medis berhasil dihapus permanen');
          
          queryClient.invalidateQueries({
            queryKey: ['/medical-records']
          });
        }
      },
      onError: (error) => {
        toast.error('Gagal menghapus permanen rekam medis. Anda mungkin tidak memiliki izin.');
        console.error('Hard delete medical record error:', error);
      }
    }
  });
};

/**
 * Hook gabungan untuk semua mutations medical record
 */
export const useMedicalRecordMutations = () => {
  const create = useCreateMedicalRecord();
  const update = useUpdateMedicalRecord();
  const remove = useRemoveMedicalRecord();
  const restore = useRestoreMedicalRecord();
  const hardDelete = useHardDeleteMedicalRecord();

  return {
    // Mutation functions
    createMedicalRecord: create.mutate,
    createMedicalRecordAsync: create.mutateAsync,
    updateMedicalRecord: update.mutate,
    updateMedicalRecordAsync: update.mutateAsync,
    removeMedicalRecord: remove.mutate,
    removeMedicalRecordAsync: remove.mutateAsync,
    restoreMedicalRecord: restore.mutate,
    restoreMedicalRecordAsync: restore.mutateAsync,
    hardDeleteMedicalRecord: hardDelete.mutate,
    hardDeleteMedicalRecordAsync: hardDelete.mutateAsync,

    // Loading states
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isRemoving: remove.isPending,
    isRestoring: restore.isPending,
    isHardDeleting: hardDelete.isPending,
    
    // Any mutation in progress
    isMutating: create.isPending || update.isPending || remove.isPending || 
                restore.isPending || hardDelete.isPending,

    // Error states
    createError: create.error,
    updateError: update.error,
    removeError: remove.error,
    restoreError: restore.error,
    hardDeleteError: hardDelete.error
  };
};

/**
 * Hook untuk invalidate semua queries medical record
 */
export const useInvalidateMedicalRecords = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({
        queryKey: ['/medical-records']
      });
    },
    invalidateList: (params?: MedicalRecordQueryParams) => {
      queryClient.invalidateQueries({
        queryKey: getMedicalRecordsControllerFindAllQueryKey(params)
      });
    },
    invalidateSearch: (params?: MedicalRecordSearchParams) => {
      queryClient.invalidateQueries({
        queryKey: getMedicalRecordsControllerSearchQueryKey(params)
      });
    },
    invalidateStats: (params?: DoctorStatsParams) => {
      queryClient.invalidateQueries({
        queryKey: getMedicalRecordsControllerGetDoctorStatsQueryKey(params)
      });
    },
    invalidateOne: (id: string) => {
      queryClient.invalidateQueries({
        queryKey: ['/medical-records', id]
      });
    }
  };
};