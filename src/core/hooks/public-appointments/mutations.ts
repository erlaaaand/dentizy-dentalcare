import { toast } from 'sonner';
import { createMutationHook } from '../../service/base/use-query-factory';
import { publicAppointmentsService } from '../../service/api/public-appointments/public-appointments.api';
import { PublicAppointmentsCacheManager } from '../../service/api/public-appointments/cache/cache.manager';
import type { PublicBookingDto } from '../../types/public-appointments/public-appointments.types';

const cacheManager = new PublicAppointmentsCacheManager();

export const usePublicBooking = createMutationHook({
  mutationFn: (data: PublicBookingDto) => publicAppointmentsService.bookAppointment(data),
  onSuccess: (_, __, queryClient) => {
    toast.success('Janji berhasil dibuat');
    cacheManager.invalidateDoctors(queryClient);
  },
  onError: () => {
    toast.error('Gagal membuat janji');
  },
});