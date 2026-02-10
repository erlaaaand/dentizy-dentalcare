import {
  useCreateTreatment,
  useUpdateTreatment,
  useRemoveTreatment,
  useRestoreTreatment,
  useActivateTreatment,
  useDeactivateTreatment,
} from './mutations';

export function useTreatmentMutations() {
  const create = useCreateTreatment();
  const update = useUpdateTreatment();
  const remove = useRemoveTreatment();
  const restore = useRestoreTreatment();
  const activate = useActivateTreatment();
  const deactivate = useDeactivateTreatment();

  return {
    create: create.mutate,
    createAsync: create.mutateAsync,
    update: update.mutate,
    updateAsync: update.mutateAsync,
    remove: remove.mutate,
    removeAsync: remove.mutateAsync,
    restore: restore.mutate,
    restoreAsync: restore.mutateAsync,
    activate: activate.mutate,
    activateAsync: activate.mutateAsync,
    deactivate: deactivate.mutate,
    deactivateAsync: deactivate.mutateAsync,

    isCreating: create.isPending,
    isUpdating: update.isPending,
    isRemoving: remove.isPending,
    isRestoring: restore.isPending,
    isActivating: activate.isPending,
    isDeactivating: deactivate.isPending,
    
    isMutating: 
      create.isPending || 
      update.isPending || 
      remove.isPending || 
      restore.isPending || 
      activate.isPending || 
      deactivate.isPending,

    createError: create.error,
    updateError: update.error,
    removeError: remove.error,
    restoreError: restore.error,
    activateError: activate.error,
    deactivateError: deactivate.error,
    
    resetCreate: create.reset,
    resetUpdate: update.reset,
    resetRemove: remove.reset,
    resetRestore: restore.reset,
    resetActivate: activate.reset,
    resetDeactivate: deactivate.reset,
  };
}

export function useTreatmentStatusToggle(onSuccess?: () => void) {
  const activate = useActivateTreatment();
  const deactivate = useDeactivateTreatment();

  const toggleStatus = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await activate.mutateAsync(id);
      } else {
        await deactivate.mutateAsync(id);
      }
      onSuccess?.();
    } catch (error) {
      // Error sudah di-handle di mutation hook
      throw error;
    }
  };

  return {
    toggleStatus,
    isToggling: activate.isPending || deactivate.isPending,
  };
}