import { useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  useMedicalRecordTreatmentsControllerFindAll,
  useMedicalRecordTreatmentsControllerCreate,
  useMedicalRecordTreatmentsControllerUpdate,
  useMedicalRecordTreatmentsControllerRemove,
  useMedicalRecordTreatmentsControllerFindOne,
  useMedicalRecordTreatmentsControllerFindByMedicalRecordId,
  useMedicalRecordTreatmentsControllerGetTotalByMedicalRecordId,
  useMedicalRecordTreatmentsControllerGetTopTreatments
} from '../../api/generated/medical-record-treatments/medical-record-treatments';
import type { 
  MedicalRecordTreatmentQueryParams,
  TopTreatmentsParams 
} from '../../types/medical-record-treatments/medical-record-treatments.types';

/**
 * Hook untuk mendapatkan daftar medical record treatments dengan pagination dan filter
 */
export const useMedicalRecordTreatments = (params?: MedicalRecordTreatmentQueryParams) => {
  return useMedicalRecordTreatmentsControllerFindAll(params, {
    query: { placeholderData: keepPreviousData }
  });
};

/**
 * Hook untuk mendapatkan detail medical record treatment berdasarkan ID
 */
export const useMedicalRecordTreatmentDetail = (id: number) => {
  return useMedicalRecordTreatmentsControllerFindOne(id, {
    query: { enabled: !!id }
  });
};

/**
 * Hook untuk mendapatkan semua treatments dalam satu medical record
 */
export const useMedicalRecordTreatmentsByRecordId = (medicalRecordId: number) => {
  return useMedicalRecordTreatmentsControllerFindByMedicalRecordId(medicalRecordId, {
    query: { enabled: !!medicalRecordId }
  });
};

/**
 * Hook untuk mendapatkan total biaya treatments dalam satu medical record
 */
export const useMedicalRecordTreatmentTotal = (medicalRecordId: number) => {
  return useMedicalRecordTreatmentsControllerGetTotalByMedicalRecordId(medicalRecordId, {
    query: { enabled: !!medicalRecordId }
  });
};

/**
 * Hook untuk mendapatkan statistik top treatments
 */
export const useTopTreatments = (params?: TopTreatmentsParams) => {
  return useMedicalRecordTreatmentsControllerGetTopTreatments(params);
};

/**
 * Hook untuk semua operasi mutasi medical record treatment
 */
export const useMedicalRecordTreatmentMutations = () => {
  const queryClient = useQueryClient();
  
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['/medical-record-treatments'] });
  };

  const create = useMedicalRecordTreatmentsControllerCreate({ 
    mutation: { 
      onSuccess: (data) => {
        invalidate();
        // Also invalidate the specific medical record's treatments
        if (data.status === 201 && data.data.medicalRecordId) {
          queryClient.invalidateQueries({ 
            queryKey: [`/medical-record-treatments/medical-record/${data.data.medicalRecordId}`] 
          });
          queryClient.invalidateQueries({ 
            queryKey: [`/medical-record-treatments/medical-record/${data.data.medicalRecordId}/total`] 
          });
        }
      } 
    } 
  });
  
  const update = useMedicalRecordTreatmentsControllerUpdate({ 
    mutation: { 
      onSuccess: (data) => {
        invalidate();
        // Also invalidate the specific medical record's treatments
        if (data.status === 200 && data.data.medicalRecordId) {
          queryClient.invalidateQueries({ 
            queryKey: [`/medical-record-treatments/medical-record/${data.data.medicalRecordId}`] 
          });
          queryClient.invalidateQueries({ 
            queryKey: [`/medical-record-treatments/medical-record/${data.data.medicalRecordId}/total`] 
          });
        }
      } 
    } 
  });
  
  const remove = useMedicalRecordTreatmentsControllerRemove({ 
    mutation: { 
      onSuccess: () => {
        invalidate();
      } 
    } 
  });

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
  };
};

/**
 * Hook untuk manage treatments dalam satu medical record
 * Menggabungkan list treatments dan total dalam satu hook
 */
export const useMedicalRecordTreatmentManager = (medicalRecordId: number) => {
  const treatments = useMedicalRecordTreatmentsByRecordId(medicalRecordId);
  const total = useMedicalRecordTreatmentTotal(medicalRecordId);
  const mutations = useMedicalRecordTreatmentMutations();

  return {
    treatments: treatments.data,
    total: total.data?.data?.data?.total || 0,
    isLoadingTreatments: treatments.isLoading,
    isLoadingTotal: total.isLoading,
    isLoading: treatments.isLoading || total.isLoading,
    refetchTreatments: treatments.refetch,
    refetchTotal: total.refetch,
    refetchAll: async () => {
      await Promise.all([treatments.refetch(), total.refetch()]);
    },
    ...mutations
  };
};