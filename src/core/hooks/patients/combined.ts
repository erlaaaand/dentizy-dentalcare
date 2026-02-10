import {
  useCreatePatient,
  useUpdatePatient,
  useRemovePatient,
  useActivatePatient,
  useRestorePatient,
} from './mutations';

export function usePatientMutations() {
  const create = useCreatePatient();
  const update = useUpdatePatient();
  const remove = useRemovePatient();
  const activate = useActivatePatient();
  const restore = useRestorePatient();

  return {
    create: create.mutate,
    createAsync: create.mutateAsync,
    update: update.mutate,
    updateAsync: update.mutateAsync,
    remove: remove.mutate,
    removeAsync: remove.mutateAsync,
    activate: activate.mutate,
    activateAsync: activate.mutateAsync,
    restore: restore.mutate,
    restoreAsync: restore.mutateAsync,

    isCreating: create.isPending,
    isUpdating: update.isPending,
    isRemoving: remove.isPending,
    isActivating: activate.isPending,
    isRestoring: restore.isPending,
    
    isMutating: 
      create.isPending || 
      update.isPending || 
      remove.isPending || 
      activate.isPending || 
      restore.isPending,

    createError: create.error,
    updateError: update.error,
    removeError: remove.error,
    activateError: activate.error,
    restoreError: restore.error,
    
    resetCreate: create.reset,
    resetUpdate: update.reset,
    resetRemove: remove.reset,
    resetActivate: activate.reset,
    resetRestore: restore.reset,
  };
}