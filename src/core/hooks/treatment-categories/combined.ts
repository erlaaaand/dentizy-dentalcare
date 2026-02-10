import {
  useCreateTreatmentCategory,
  useUpdateTreatmentCategory,
  useRemoveTreatmentCategory,
  useRestoreTreatmentCategory,
} from './mutations';

export function useTreatmentCategoryMutations() {
  const create = useCreateTreatmentCategory();
  const update = useUpdateTreatmentCategory();
  const remove = useRemoveTreatmentCategory();
  const restore = useRestoreTreatmentCategory();

  return {
    create: create.mutate,
    createAsync: create.mutateAsync,
    update: update.mutate,
    updateAsync: update.mutateAsync,
    remove: remove.mutate,
    removeAsync: remove.mutateAsync,
    restore: restore.mutate,
    restoreAsync: restore.mutateAsync,

    isCreating: create.isPending,
    isUpdating: update.isPending,
    isRemoving: remove.isPending,
    isRestoring: restore.isPending,

    isMutating:
      create.isPending ||
      update.isPending ||
      remove.isPending ||
      restore.isPending,

    createError: create.error,
    updateError: update.error,
    removeError: remove.error,
    restoreError: restore.error,

    resetCreate: create.reset,
    resetUpdate: update.reset,
    resetRemove: remove.reset,
    resetRestore: restore.reset,
  };
}