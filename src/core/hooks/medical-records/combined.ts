import {
  useCreateMedicalRecord,
  useUpdateMedicalRecord,
  useRemoveMedicalRecord,
  useRestoreMedicalRecord,
  useHardDeleteMedicalRecord,
} from './mutations';

export function useMedicalRecordMutations() {
  const create = useCreateMedicalRecord();
  const update = useUpdateMedicalRecord();
  const remove = useRemoveMedicalRecord();
  const restore = useRestoreMedicalRecord();
  const hardDelete = useHardDeleteMedicalRecord();

  return {
    create: create.mutate,
    createAsync: create.mutateAsync,
    update: update.mutate,
    updateAsync: update.mutateAsync,
    remove: remove.mutate,
    removeAsync: remove.mutateAsync,
    restore: restore.mutate,
    restoreAsync: restore.mutateAsync,
    hardDelete: hardDelete.mutate,
    hardDeleteAsync: hardDelete.mutateAsync,
    
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isRemoving: remove.isPending,
    isRestoring: restore.isPending,
    isHardDeleting: hardDelete.isPending,
    
    isMutating: 
      create.isPending || 
      update.isPending || 
      remove.isPending || 
      restore.isPending || 
      hardDelete.isPending,
    
    createError: create.error,
    updateError: update.error,
    removeError: remove.error,
    restoreError: restore.error,
    hardDeleteError: hardDelete.error,
    
    resetCreate: create.reset,
    resetUpdate: update.reset,
    resetRemove: remove.reset,
    resetRestore: restore.reset,
    resetHardDelete: hardDelete.reset,
  };
}