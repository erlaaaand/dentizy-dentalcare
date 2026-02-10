import {
  useCreatePayment,
  useUpdatePayment,
  useProcessPayment,
  useCancelPayment,
  useRemovePayment,
} from './mutations';

export function usePaymentMutations() {
  const create = useCreatePayment();
  const update = useUpdatePayment();
  const process = useProcessPayment();
  const cancel = useCancelPayment();
  const remove = useRemovePayment();

  return {
    create: create.mutate,
    createAsync: create.mutateAsync,
    update: update.mutate,
    updateAsync: update.mutateAsync,
    process: process.mutate,
    processAsync: process.mutateAsync,
    cancel: cancel.mutate,
    cancelAsync: cancel.mutateAsync,
    remove: remove.mutate,
    removeAsync: remove.mutateAsync,

    isCreating: create.isPending,
    isUpdating: update.isPending,
    isProcessing: process.isPending,
    isCancelling: cancel.isPending,
    isRemoving: remove.isPending,

    isMutating:
      create.isPending ||
      update.isPending ||
      process.isPending ||
      cancel.isPending ||
      remove.isPending,

    createError: create.error,
    updateError: update.error,
    processError: process.error,
    cancelError: cancel.error,
    removeError: remove.error,

    resetCreate: create.reset,
    resetUpdate: update.reset,
    resetProcess: process.reset,
    resetCancel: cancel.reset,
    resetRemove: remove.reset,
  };
}