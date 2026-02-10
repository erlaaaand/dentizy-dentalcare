import { createQueryHook } from '../../service/base/use-query-factory';
import { appointmentsService } from '../../service/api/appointments/appointment.api';
import { AppointmentsCacheManager } from '../../service/api/appointments/cache/cache.manager'
import type {
  AppointmentQueryParams,
} from '../../types/appointments/appointment.types';

const cacheManager = new AppointmentsCacheManager();

export const useAppointments = createQueryHook({
  queryKey: (params?: AppointmentQueryParams) => 
    cacheManager.getListQueryKey(params),
  queryFn: (params) => appointmentsService.findAll(params),
  options: {
    staleTime: 30 * 1000, // 30 seconds
  },
});

export const useAppointment = createQueryHook({
  queryKey: (id?: string) => cacheManager.getDetailQueryKey(id!),
  queryFn: (id) => appointmentsService.findOne(id!),
  options: {
    enabled: false, // Manually enabled when id provided
    staleTime: 60 * 1000, // 1 minute
  },
});