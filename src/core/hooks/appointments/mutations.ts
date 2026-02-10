import { createMutationHook } from '../../service/base/use-query-factory';
import { appointmentsService } from '../../service/api/appointments/appointment.api';
import { AppointmentsCacheManager } from '../../service/api/appointments/cache/cache.manager'
import type {
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from '../../types/appointments/appointment.types';

const cacheManager = new AppointmentsCacheManager();

export const useCreateAppointment = createMutationHook({
  mutationFn: (data: CreateAppointmentDto) => 
    appointmentsService.create(data),
  onSuccess: (_, __, queryClient) => {
    cacheManager.invalidateAll(queryClient);
  },
});

export const useUpdateAppointment = createMutationHook({
  mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentDto }) =>
    appointmentsService.update(id, data),
  onSuccess: (_, { id }, queryClient) => {
    cacheManager.invalidateDetail(queryClient, id);
    cacheManager.invalidateList(queryClient);
  },
});

export const useCompleteAppointment = createMutationHook({
  mutationFn: (id: string) => appointmentsService.complete(id),
  onSuccess: (data, id, queryClient) => {
    // Optimistic update
    cacheManager.optimisticUpdate(queryClient, id, (old) => ({
      ...old,
      status: 'selesai' as const,
    }));
    
    cacheManager.invalidateList(queryClient);
  },
});

export const useCancelAppointment = createMutationHook({
  mutationFn: (id: string) => appointmentsService.cancel(id),
  onSuccess: (data, id, queryClient) => {
    // Optimistic update
    cacheManager.optimisticUpdate(queryClient, id, (old) => ({
      ...old,
      status: 'dibatalkan' as const,
    }));
    
    cacheManager.invalidateList(queryClient);
  },
});

export const useDeleteAppointment = createMutationHook({
  mutationFn: (id: string) => appointmentsService.remove(id),
  onSuccess: (_, id, queryClient) => {
    cacheManager.removeDetail(queryClient, id);
    cacheManager.invalidateList(queryClient);
  },
});