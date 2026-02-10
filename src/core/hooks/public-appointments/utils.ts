import { useQueryClient } from '@tanstack/react-query';
import { PublicAppointmentsCacheManager } from '../../service/api/public-appointments/cache/cache.manager';

const cacheManager = new PublicAppointmentsCacheManager();

export function usePrefetchPublicAppointments() {
  const queryClient = useQueryClient();

  return {
    prefetchDoctors: () => cacheManager.prefetchDoctors(queryClient),
  };
}

export function useInvalidatePublicAppointments() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => cacheManager.invalidateAll(queryClient),
    invalidateDoctors: () => cacheManager.invalidateDoctors(queryClient),
  };
}