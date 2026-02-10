import { usePublicBooking } from './mutations';

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