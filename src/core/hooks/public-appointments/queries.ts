import { createQueryHook } from '../../service/base/use-query-factory';
import { publicAppointmentsService } from '../../service/api/public-appointments/public-appointments.api';
import { PublicAppointmentsCacheManager } from '../../service/api/public-appointments/cache/cache.manager';

const cacheManager = new PublicAppointmentsCacheManager();

export const usePublicDoctors = createQueryHook({
  queryKey: () => cacheManager.getDoctorsQueryKey(),
  queryFn: () => publicAppointmentsService.getDoctors(),
  options: {
    staleTime: 5 * 60 * 1000,
    retry: 1,
  },
});