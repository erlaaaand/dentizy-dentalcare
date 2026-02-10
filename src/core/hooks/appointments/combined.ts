import {
  useCreateAppointment,
  useUpdateAppointment,
  useCompleteAppointment,
  useCancelAppointment,
  useDeleteAppointment,
} from './mutations';

export function useAppointmentMutations() {
  const create = useCreateAppointment();
  const update = useUpdateAppointment();
  const complete = useCompleteAppointment();
  const cancel = useCancelAppointment();
  const remove = useDeleteAppointment();

  return {
    // Mutation functions
    create: create.mutate,
    createAsync: create.mutateAsync,
    update: update.mutate,
    updateAsync: update.mutateAsync,
    complete: complete.mutate,
    completeAsync: complete.mutateAsync,
    cancel: cancel.mutate,
    cancelAsync: cancel.mutateAsync,
    remove: remove.mutate,
    removeAsync: remove.mutateAsync,
    
    // Loading states
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isCompleting: complete.isPending,
    isCancelling: cancel.isPending,
    isDeleting: remove.isPending,
    
    // Combined loading
    isMutating: 
      create.isPending || 
      update.isPending || 
      complete.isPending || 
      cancel.isPending || 
      remove.isPending,
    
    // Error states
    createError: create.error,
    updateError: update.error,
    completeError: complete.error,
    cancelError: cancel.error,
    deleteError: remove.error,
    
    // Reset functions
    resetCreate: create.reset,
    resetUpdate: update.reset,
    resetComplete: complete.reset,
    resetCancel: cancel.reset,
    resetDelete: remove.reset,
  };
}