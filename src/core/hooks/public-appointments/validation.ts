import { publicAppointmentsValidators } from '../../service/api/public-appointments/validators/public-appointments.validators';
import { publicAppointmentsHelpers } from '../../service/api/public-appointments/helpers/public-appointments.helpers';
import type {
  PublicBookingFormData,
  BookingValidation,
} from '../../types/public-appointments/public-appointments.types';

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