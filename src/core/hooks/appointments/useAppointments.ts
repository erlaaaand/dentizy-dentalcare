import { useQueryClient } from '@tanstack/react-query';
import { createQueryHook, createMutationHook } from '../../service/base/use-query-factory';
import { appointmentsService } from '../../service/api/appointments/appointment.api';
import type {
  AppointmentQueryParams,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from '../../types/appointments/appointment.types';

// ==================== QUERY HOOKS ====================

export const useAppointments = createQueryHook({
  queryKey: (params?: AppointmentQueryParams) => 
    appointmentsService.getListQueryKey(params),
  queryFn: (params) => appointmentsService.findAll(params),
  options: {
    staleTime: 30 * 1000, // 30 seconds
  },
});

export const useAppointment = createQueryHook({
  queryKey: (id?: string) => appointmentsService.getDetailQueryKey(id!),
  queryFn: (id) => appointmentsService.findOne(id!),
  options: {
    enabled: false, // Manually enabled when id provided
    staleTime: 60 * 1000, // 1 minute
  },
});

// ==================== MUTATION HOOKS ====================

export const useCreateAppointment = createMutationHook({
  mutationFn: (data: CreateAppointmentDto) => 
    appointmentsService.create(data),
  onSuccess: (_, __, queryClient) => {
    appointmentsService.invalidateAll(queryClient);
  },
});

export const useUpdateAppointment = createMutationHook({
  mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentDto }) =>
    appointmentsService.update(id, data),
  onSuccess: (_, { id }, queryClient) => {
    appointmentsService.invalidateDetail(queryClient, id);
    appointmentsService.invalidateList(queryClient);
  },
});

export const useCompleteAppointment = createMutationHook({
  mutationFn: (id: string) => appointmentsService.complete(id),
  onSuccess: (data, id, queryClient) => {
    // Optimistic update
    appointmentsService.optimisticUpdate(queryClient, id, (old) => ({
      ...old,
      status: 'selesai' as const,
    }));
    
    appointmentsService.invalidateList(queryClient);
  },
});

export const useCancelAppointment = createMutationHook({
  mutationFn: (id: string) => appointmentsService.cancel(id),
  onSuccess: (data, id, queryClient) => {
    // Optimistic update
    appointmentsService.optimisticUpdate(queryClient, id, (old) => ({
      ...old,
      status: 'dibatalkan' as const,
    }));
    
    appointmentsService.invalidateList(queryClient);
  },
});

export const useDeleteAppointment = createMutationHook({
  mutationFn: (id: string) => appointmentsService.remove(id),
  onSuccess: (_, id, queryClient) => {
    appointmentsService.removeQueries(queryClient, appointmentsService.getDetailQueryKey(id));
    appointmentsService.invalidateList(queryClient);
  },
});

// ==================== COMBINED MUTATIONS HOOK ====================

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

// ==================== UTILITY HOOKS ====================

export function usePrefetchAppointment() {
  const queryClient = useQueryClient();
  
  return {
    prefetchList: (params?: AppointmentQueryParams) =>
      appointmentsService.prefetchList(queryClient, params),
    prefetchDetail: (id: string) =>
      appointmentsService.prefetchDetail(queryClient, id),
  };
}

export function useInvalidateAppointments() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => appointmentsService.invalidateAll(queryClient),
    invalidateList: (params?: AppointmentQueryParams) => 
      appointmentsService.invalidateList(queryClient, params),
    invalidateDetail: (id: string) => 
      appointmentsService.invalidateDetail(queryClient, id),
  };
}