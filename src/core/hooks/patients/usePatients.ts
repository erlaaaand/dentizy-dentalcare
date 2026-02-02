import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  usePatientsControllerCreate,
  usePatientsControllerFindAll,
  usePatientsControllerSearch,
  usePatientsControllerGetStatistics,
  usePatientsControllerFindByMedicalRecordNumber,
  usePatientsControllerFindByNik,
  usePatientsControllerFindByDoctor,
  usePatientsControllerFindOne,
  usePatientsControllerUpdate,
  usePatientsControllerRemove,
  usePatientsControllerActivatePatient,
  usePatientsControllerRestore,
  getPatientsControllerFindAllQueryKey,
  getPatientsControllerSearchQueryKey,
  getPatientsControllerGetStatisticsQueryKey
} from '../../api/generated/patients/patients';

import type {
  PatientQueryParams,
  PatientSearchParams,
  PatientByDoctorParams
} from '../../types/patients/patient.types';

/**
 * Hook untuk mendapatkan daftar pasien dengan pagination
 */
export const usePatients = (params?: PatientQueryParams) => {
  return usePatientsControllerFindAll(params, {
    query: {
      placeholderData: keepPreviousData,
      staleTime: 30 * 1000, // 30 detik
      retry: 1
    }
  });
};

/**
 * Hook untuk mendapatkan detail pasien berdasarkan ID
 */
export const usePatient = (id: string) => {
  return usePatientsControllerFindOne(id, {
    query: {
      enabled: !!id,
      staleTime: 60 * 1000, // 1 menit
      retry: 1
    }
  });
};

/**
 * Hook untuk pencarian real-time pasien
 */
export const usePatientSearch = (params?: PatientSearchParams) => {
  return usePatientsControllerSearch(params, {
    query: {
      enabled: !!params?.search && params.search.length >= 2,
      placeholderData: keepPreviousData,
      staleTime: 30 * 1000
    }
  });
};

/**
 * Hook untuk mendapatkan statistik pasien
 */
export const usePatientStatistics = () => {
  return usePatientsControllerGetStatistics({
    query: {
      staleTime: 5 * 60 * 1000, // 5 menit
    }
  });
};

/**
 * Hook untuk mencari pasien berdasarkan nomor rekam medis
 */
export const usePatientByMedicalRecordNumber = (number: string) => {
  return usePatientsControllerFindByMedicalRecordNumber(number, {
    query: {
      enabled: !!number,
      staleTime: 60 * 1000,
      retry: 1
    }
  });
};

/**
 * Hook untuk mencari pasien berdasarkan NIK
 */
export const usePatientByNik = (nik: string) => {
  return usePatientsControllerFindByNik(nik, {
    query: {
      enabled: !!nik && nik.length === 16,
      staleTime: 60 * 1000,
      retry: 1
    }
  });
};

/**
 * Hook untuk mendapatkan pasien per dokter
 */
export const usePatientsByDoctor = (doctorId: string, params?: PatientByDoctorParams) => {
  return usePatientsControllerFindByDoctor(doctorId, params, {
    query: {
      enabled: !!doctorId,
      placeholderData: keepPreviousData,
      staleTime: 30 * 1000
    }
  });
};

/**
 * Hook untuk membuat pasien baru
 */
export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return usePatientsControllerCreate({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 201) {
          toast.success('Pasien berhasil didaftarkan');
          
          // Invalidate related queries
          queryClient.invalidateQueries({
            queryKey: getPatientsControllerFindAllQueryKey()
          });
          queryClient.invalidateQueries({
            queryKey: getPatientsControllerGetStatisticsQueryKey()
          });
        }
      },
      onError: (error) => {
        toast.error('Gagal mendaftarkan pasien');
        console.error('Create patient error:', error);
      }
    }
  });
};

/**
 * Hook untuk update pasien
 */
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return usePatientsControllerUpdate({
    mutation: {
      onSuccess: (response, { id }) => {
        if (response.status === 200) {
          toast.success('Data pasien berhasil diperbarui');
          
          // Invalidate specific patient and list
          queryClient.invalidateQueries({
            queryKey: ['/patients', id]
          });
          queryClient.invalidateQueries({
            queryKey: getPatientsControllerFindAllQueryKey()
          });
        }
      },
      onError: (error) => {
        toast.error('Gagal memperbarui data pasien');
        console.error('Update patient error:', error);
      }
    }
  });
};

/**
 * Hook untuk soft delete pasien
 */
export const useRemovePatient = () => {
  const queryClient = useQueryClient();

  return usePatientsControllerRemove({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 200) {
          toast.success('Pasien berhasil dihapus');
          
          queryClient.invalidateQueries({
            queryKey: ['/patients']
          });
          queryClient.invalidateQueries({
            queryKey: getPatientsControllerGetStatisticsQueryKey()
          });
        }
      },
      onError: (error) => {
        toast.error('Gagal menghapus pasien. Anda mungkin tidak memiliki izin.');
        console.error('Remove patient error:', error);
      }
    }
  });
};

/**
 * Hook untuk aktivasi pasien dari pendaftaran online
 */
export const useActivatePatient = () => {
  const queryClient = useQueryClient();

  return usePatientsControllerActivatePatient({
    mutation: {
      onSuccess: (response, { id }) => {
        if (response.status === 200) {
          toast.success('Pasien berhasil diaktifkan');
          
          queryClient.invalidateQueries({
            queryKey: ['/patients', id]
          });
          queryClient.invalidateQueries({
            queryKey: getPatientsControllerFindAllQueryKey()
          });
          queryClient.invalidateQueries({
            queryKey: getPatientsControllerGetStatisticsQueryKey()
          });
        }
      },
      onError: (error) => {
        toast.error('Gagal mengaktifkan pasien');
        console.error('Activate patient error:', error);
      }
    }
  });
};

/**
 * Hook untuk restore pasien yang di-soft delete
 */
export const useRestorePatient = () => {
  const queryClient = useQueryClient();

  return usePatientsControllerRestore({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 200) {
          toast.success('Pasien berhasil dipulihkan');
          
          queryClient.invalidateQueries({
            queryKey: ['/patients']
          });
          queryClient.invalidateQueries({
            queryKey: getPatientsControllerGetStatisticsQueryKey()
          });
        }
      },
      onError: (error) => {
        toast.error('Gagal memulihkan pasien. Anda mungkin tidak memiliki izin.');
        console.error('Restore patient error:', error);
      }
    }
  });
};

/**
 * Hook gabungan untuk semua mutations patient
 */
export const usePatientMutations = () => {
  const create = useCreatePatient();
  const update = useUpdatePatient();
  const remove = useRemovePatient();
  const activate = useActivatePatient();
  const restore = useRestorePatient();

  return {
    // Mutation functions
    createPatient: create.mutate,
    createPatientAsync: create.mutateAsync,
    updatePatient: update.mutate,
    updatePatientAsync: update.mutateAsync,
    removePatient: remove.mutate,
    removePatientAsync: remove.mutateAsync,
    activatePatient: activate.mutate,
    activatePatientAsync: activate.mutateAsync,
    restorePatient: restore.mutate,
    restorePatientAsync: restore.mutateAsync,

    // Loading states
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isRemoving: remove.isPending,
    isActivating: activate.isPending,
    isRestoring: restore.isPending,
    
    // Any mutation in progress
    isMutating: create.isPending || update.isPending || remove.isPending || 
                activate.isPending || restore.isPending,

    // Error states
    createError: create.error,
    updateError: update.error,
    removeError: remove.error,
    activateError: activate.error,
    restoreError: restore.error
  };
};

/**
 * Hook untuk invalidate semua queries patient
 */
export const useInvalidatePatients = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({
        queryKey: ['/patients']
      });
    },
    invalidateList: (params?: PatientQueryParams) => {
      queryClient.invalidateQueries({
        queryKey: getPatientsControllerFindAllQueryKey(params)
      });
    },
    invalidateSearch: (params?: PatientSearchParams) => {
      queryClient.invalidateQueries({
        queryKey: getPatientsControllerSearchQueryKey(params)
      });
    },
    invalidateStatistics: () => {
      queryClient.invalidateQueries({
        queryKey: getPatientsControllerGetStatisticsQueryKey()
      });
    },
    invalidateOne: (id: string) => {
      queryClient.invalidateQueries({
        queryKey: ['/patients', id]
      });
    }
  };
};