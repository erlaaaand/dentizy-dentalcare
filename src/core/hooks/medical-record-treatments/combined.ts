import {
  useCreateMedicalRecordTreatment,
  useUpdateMedicalRecordTreatment,
  useRemoveMedicalRecordTreatment,
} from './mutations';

import {
  useMedicalRecordTreatmentsByRecordId,
  useMedicalRecordTreatmentTotal,
} from './queries';

export function useMedicalRecordTreatmentMutations() {
  const create = useCreateMedicalRecordTreatment();
  const update = useUpdateMedicalRecordTreatment();
  const remove = useRemoveMedicalRecordTreatment();

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
    
    isMutating: create.isPending || update.isPending || remove.isPending,

    createError: create.error,
    updateError: update.error,
    deleteError: remove.error,
    
    resetCreate: create.reset,
    resetUpdate: update.reset,
    resetDelete: remove.reset,
  };
}

export function useMedicalRecordTreatmentManager(medicalRecordId: string) {
  
  const treatments = useMedicalRecordTreatmentsByRecordId(medicalRecordId, {
    enabled: !!medicalRecordId
  });
  
  const total = useMedicalRecordTreatmentTotal(medicalRecordId, {
    enabled: !!medicalRecordId
  });
  
  const mutations = useMedicalRecordTreatmentMutations();

  const refetchAll = async () => {
    await Promise.all([
      treatments.refetch(),
      total.refetch()
    ]);
  };

  return {
    treatments: treatments.data || [],
    total: total.data?.data?.total || 0,
    isLoadingTreatments: treatments.isLoading,
    isLoadingTotal: total.isLoading,
    isLoading: treatments.isLoading || total.isLoading,
    refetchTreatments: treatments.refetch,
    refetchTotal: total.refetch,
    refetchAll,
    ...mutations
  };
}