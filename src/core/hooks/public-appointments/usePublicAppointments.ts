import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createQueryHook, createMutationHook } from '../../service/base/use-query-factory';
import { publicAppointmentsService } from '../../service/api/public-appointments/public-appointments.api';
import { publicAppointmentsHelpers } from '../../service/api/public-appointments/helpers/public-appointments.helpers';
import { publicAppointmentsValidators } from '../../service/api/public-appointments/validators/public-appointments.validators';
import { PublicAppointmentsCacheManager } from '../../service/api/public-appointments/cache/cache.manager';
import type {
  PublicBookingDto,
  PublicBookingFormData,
  DoctorAvailability,
  BookingValidation,
} from '../../types/public-appointments/public-appointments.types';


const cacheManager = new PublicAppointmentsCacheManager();

export const usePublicDoctors = createQueryHook({
  queryKey: () => cacheManager.getDoctorsQueryKey(),
  queryFn: () => publicAppointmentsService.getDoctors(),
  options: {
    staleTime: 5 * 60 * 1000,
    retry: 1,
  },
});

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

export function useBookingValidation() {
  return {
    validateBooking: (data: PublicBookingFormData): BookingValidation =>
      publicAppointmentsValidators.validateBooking(data),
    isValidNIK: (nik: string): boolean =>
      publicAppointmentsHelpers.isValidNIK(nik),
    formatPhoneNumber: (phone: string): string =>
      publicAppointmentsHelpers.formatPhoneNumber(phone),
    formatNIK: (nik: string): string =>
      publicAppointmentsHelpers.formatNIK(nik),
    calculateAge: (birthDate: string): number =>
      publicAppointmentsHelpers.calculateAge(birthDate),
  };
}

export function usePublicAppointmentMutations() {
  const booking = usePublicBooking();

  return {
    book: booking.mutate,
    bookAsync: booking.mutateAsync,

    isBooking: booking.isPending,
    isMutating: booking.isPending,

    bookingError: booking.error,

    resetBooking: booking.reset,
  };
}

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

// Export helpers & types
export { publicAppointmentsHelpers };
export type {
  PublicBookingDto,
  PublicBookingFormData,
  DoctorAvailability,
  BookingValidation,
};