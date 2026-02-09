import { useQueryClient } from '@tanstack/react-query';
import { createQueryHook, createMutationHook } from '../../service/base/use-query-factory';
import { appointmentsApi } from '../../service/api/appointments/appointment.api';
import type {
  AppointmentQueryParams,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from '../../types/appointments/appointment.types';

// ==================== QUERY HOOKS ====================

export const useAppointments = createQueryHook({
  queryKey: (params?: AppointmentQueryParams) => 
    appointmentsApi.getListQueryKey(params),
  queryFn: (params) => appointmentsApi.findAll(params),
  options: {
    staleTime: 30 * 1000, // 30 seconds
  },
});

export const useAppointment = createQueryHook({
  queryKey: (id?: string) => appointmentsApi.getDetailQueryKey(id!),
  queryFn: (id) => appointmentsApi.findOne(id!),
  options: {
    enabled: false, // Manually enabled when id provided
    staleTime: 60 * 1000, // 1 minute
  },
});

// ==================== MUTATION HOOKS ====================

export const useCreateAppointment = createMutationHook({
  mutationFn: (data: CreateAppointmentDto) => 
    appointmentsApi.create(data),
  onSuccess: (_, __, queryClient) => {
    appointmentsApi.invalidateAll(queryClient);
  },
});

export const useUpdateAppointment = createMutationHook({
  mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentDto }) =>
    appointmentsApi.update(id, data),
  onSuccess: (_, { id }, queryClient) => {
    appointmentsApi.invalidateDetail(queryClient, id);
    appointmentsApi.invalidateList(queryClient);
  },
});

export const useCompleteAppointment = createMutationHook({
  mutationFn: (id: string) => appointmentsApi.complete(id),
  onSuccess: (data, id, queryClient) => {
    // Optimistic update
    appointmentsApi.optimisticUpdate(queryClient, id, (old) => ({
      ...old,
      status: 'selesai' as const,
    }));
    
    appointmentsApi.invalidateList(queryClient);
  },
});

export const useCancelAppointment = createMutationHook({
  mutationFn: (id: string) => appointmentsApi.cancel(id),
  onSuccess: (data, id, queryClient) => {
    // Optimistic update
    appointmentsApi.optimisticUpdate(queryClient, id, (old) => ({
      ...old,
      status: 'dibatalkan' as const,
    }));
    
    appointmentsApi.invalidateList(queryClient);
  },
});

export const useDeleteAppointment = createMutationHook({
  mutationFn: (id: string) => appointmentsApi.remove(id),
  onSuccess: (_, id, queryClient) => {
    appointmentsApi.removeQueries(queryClient, [...appointmentsApi.getDetailQueryKey(id)]);
    appointmentsApi.invalidateList(queryClient);
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
      appointmentsApi.prefetchList(queryClient, params),
    prefetchDetail: (id: string) =>
      appointmentsApi.prefetchDetail(queryClient, id),
  };
}

export function useInvalidateAppointments() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => appointmentsApi.invalidateAll(queryClient),
    invalidateList: (params?: AppointmentQueryParams) => 
      appointmentsApi.invalidateList(queryClient, params),
    invalidateDetail: (id: string) => 
      appointmentsApi.invalidateDetail(queryClient, id),
  };
}