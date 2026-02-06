import type {
  PublicBookingDto,
  PublicBookingDtoJenisKelamin
} from '../../api/model';

// Re-export DTOs
export type {
  PublicBookingDto,
  PublicBookingDtoJenisKelamin
};

// Re-export enum for runtime
export { 
  PublicBookingDtoJenisKelamin as PublicBookingGender 
} from '../../api/model';

// Alias types
export type PublicBooking = PublicBookingDto;

// Extended form data dengan validasi tambahan
export interface PublicBookingFormData extends PublicBookingDto {
  // Konfirmasi data
  confirmNoHp?: string;
  confirmEmail?: string;
  
  // Terms & conditions
  acceptTerms: boolean;
  acceptPrivacyPolicy: boolean;
  
  // Captcha
  captchaToken?: string;
  
  // Additional info
  preferredContactMethod?: 'whatsapp' | 'sms' | 'email';
  hasInsurance?: boolean;
  insuranceProvider?: string;
  insuranceNumber?: string;
  
  // Emergency contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

// Response setelah booking berhasil
export interface PublicBookingResponse {
  success: boolean;
  message: string;
  bookingId: string;
  appointmentId: string;
  patientId: string;
  confirmationCode: string;
  estimatedWaitingTime?: number; // dalam menit
  appointmentDetails: {
    tanggal_janji: string;
    jam_janji: string;
    doctor_name: string;
    clinic_address?: string;
    clinic_phone?: string;
  };
  nextSteps: string[];
}

// Booking confirmation email data
export interface BookingConfirmationData {
  patientName: string;
  patientEmail: string;
  confirmationCode: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorName: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  specialInstructions?: string;
  cancellationPolicy?: string;
}

// Available time slots untuk booking
export interface AvailableTimeSlot {
  date: string;
  slots: {
    time: string;
    available: boolean;
    doctorId: string;
    doctorName: string;
    specialization?: string;
  }[];
}

// Doctor availability untuk public booking
export interface DoctorAvailability {
  doctorId: string;
  doctorName: string;
  specialization?: string;
  photoUrl?: string;
  availableDates: string[];
  unavailableDates: string[];
  workingHours: {
    [day: string]: {
      start: string;
      end: string;
      breakStart?: string;
      breakEnd?: string;
    };
  };
}

// Booking validation
export interface BookingValidation {
  isValid: boolean;
  errors: {
    field: keyof PublicBookingDto;
    message: string;
  }[];
  warnings?: {
    field: string;
    message: string;
  }[];
}

// Booking conflict check
export interface BookingConflict {
  hasConflict: boolean;
  conflictType?: 'duplicate' | 'time_overlap' | 'doctor_unavailable' | 'clinic_closed';
  message?: string;
  suggestedAlternatives?: {
    date: string;
    time: string;
    doctorId: string;
  }[];
}

// Public booking statistics (untuk admin)
export interface PublicBookingStatistics {
  total_bookings: number;
  confirmed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
  booking_by_source: {
    website: number;
    mobile_app: number;
    phone: number;
  };
  average_lead_time: number; // dalam hari
  peak_booking_times: {
    hour: number;
    count: number;
  }[];
}

// Booking cancellation request
export interface BookingCancellationRequest {
  confirmationCode: string;
  reason: string;
  requestRefund?: boolean;
  alternativeDate?: string;
  alternativeTime?: string;
}

// Booking cancellation response
export interface BookingCancellationResponse {
  success: boolean;
  message: string;
  refundAmount?: number;
  refundMethod?: string;
  alternativeAppointment?: {
    date: string;
    time: string;
    confirmationCode: string;
  };
}

// Booking reminder
export interface BookingReminder {
  id: string;
  bookingId: string;
  patientName: string;
  patientContact: string;
  appointmentDate: string;
  appointmentTime: string;
  reminderType: 'email' | 'sms' | 'whatsapp';
  sentAt: string;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
}

// Booking reschedule request
export interface BookingRescheduleRequest {
  confirmationCode: string;
  newDate: string;
  newTime: string;
  reason?: string;
}

// Booking reschedule response
export interface BookingRescheduleResponse {
  success: boolean;
  message: string;
  newConfirmationCode: string;
  oldAppointment: {
    date: string;
    time: string;
  };
  newAppointment: {
    date: string;
    time: string;
  };
}

// Enum untuk preferred contact method
export enum PreferredContactMethod {
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
  EMAIL = 'email',
  PHONE = 'phone'
}

// Enum untuk booking source
export enum BookingSource {
  WEBSITE = 'website',
  MOBILE_APP = 'mobile_app',
  PHONE = 'phone',
  WALK_IN = 'walk_in'
}

// Enum untuk booking status
export enum PublicBookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}