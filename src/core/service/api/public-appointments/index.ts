/**
 * Public Appointments API Module
 * 
 * This module provides a clean API for managing public appointments (no login required).
 * It's refactored to separate concerns:
 * - Service: Core API calls
 * - Helpers: Utility functions
 * - Validators: Data validation
 * - Cache Manager: React Query cache management
 */

export { 
  publicAppointmentsService, 
  PublicAppointmentsService 
} from './public-appointments.api';

export { 
  publicAppointmentsHelpers, 
  PublicAppointmentsHelpers 
} from './helpers/public-appointments.helpers';

export { 
  publicAppointmentsValidators, 
  PublicAppointmentsValidators 
} from './validators/public-appointments.validators';

export { 
  publicAppointmentsCacheManager, 
  PublicAppointmentsCacheManager 
} from './cache/cache.manager';

// Re-export generated hooks
export {
  usePublicAppointmentsControllerGetDoctors,
  usePublicAppointmentsControllerBook
} from '../../../api/generated/public-appointments/public-appointments';

// Re-export query keys
export { 
  getPublicAppointmentsControllerGetDoctorsQueryKey 
} from '../../../api/generated/public-appointments/public-appointments';

// Re-export types
export type {
  PublicBookingDto,
  AppointmentResponseDto
} from '../../../api/model';

export type {
  PublicBooking,
  PublicBookingFormData,
  PublicBookingResponse,
  BookingConflict,
  DoctorAvailability,
  AvailableTimeSlot,
  BookingCancellationRequest,
  BookingCancellationResponse,
  BookingRescheduleRequest,
  BookingRescheduleResponse
} from '../../../types/public-appointments/public-appointments.types';

export type {
  ValidationError,
  BookingValidation
} from './validators/public-appointments.validators';