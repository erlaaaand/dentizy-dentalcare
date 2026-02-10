import { useQueryClient } from '@tanstack/react-query';
import { AppointmentsCacheManager } from '../../service/api/appointments/cache/cache.manager'
import type { AppointmentQueryParams } from '../../types/appointments/appointment.types';

const cacheManager = new AppointmentsCacheManager();

export function usePrefetchAppointment() {
  const queryClient = useQueryClient();
  
  return {
    prefetchList: (params?: AppointmentQueryParams) =>
      cacheManager.prefetchList(queryClient, params),
    prefetchDetail: (id: string) =>
      cacheManager.prefetchDetail(queryClient, id),
  };
}

export function useInvalidateAppointments() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => cacheManager.invalidateAll(queryClient),
    invalidateList: (params?: AppointmentQueryParams) => 
      cacheManager.invalidateList(queryClient, params),
    invalidateDetail: (id: string) => 
      cacheManager.invalidateDetail(queryClient, id),
  };
}