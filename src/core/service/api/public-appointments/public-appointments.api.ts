import type { QueryClient } from '@tanstack/react-query';
import {
  publicAppointmentsControllerGetDoctors,
  publicAppointmentsControllerBook,
  usePublicAppointmentsControllerGetDoctors,
  usePublicAppointmentsControllerBook,
  getPublicAppointmentsControllerGetDoctorsQueryKey
} from '../../../api/generated/public-appointments/public-appointments';

import type {
  PublicBookingDto,
  AppointmentResponseDto
} from '../../../api/model';

import type {
  PublicBooking,
  PublicBookingFormData,
  PublicBookingResponse,
  BookingValidation,
  BookingConflict,
  DoctorAvailability,
  AvailableTimeSlot,
  BookingCancellationRequest,
  BookingCancellationResponse,
  BookingRescheduleRequest,
  BookingRescheduleResponse
} from '../../../types/public-appointments/public-appointments.types';

// Re-export generated hooks
export {
  usePublicAppointmentsControllerGetDoctors,
  usePublicAppointmentsControllerBook
};

// Re-export query keys
export { getPublicAppointmentsControllerGetDoctorsQueryKey };

// Re-export generated functions
export {
  publicAppointmentsControllerGetDoctors,
  publicAppointmentsControllerBook
};

// Custom API calls with typed responses
export const publicAppointmentsApi = {
  /**
   * Get list of active doctors
   */
  async getDoctors(): Promise<DoctorAvailability[]> {
    const response = await publicAppointmentsControllerGetDoctors();
    return response.data as DoctorAvailability[];
  },

  /**
   * Book appointment (public - no login required)
   */
  async bookAppointment(
    bookingData: PublicBookingDto
  ): Promise<AppointmentResponseDto> {
    const response = await publicAppointmentsControllerBook(bookingData);
    
    if (response.status === 201) {
      return response.data;
    }
    
    throw new Error('Failed to book appointment');
  },

  /**
   * Validate booking data before submission
   */
  validateBooking(bookingData: PublicBookingFormData): BookingValidation {
    const errors: { field: keyof PublicBookingDto; message: string }[] = [];

    // Validate NIK
    if (!bookingData.nik || bookingData.nik.trim() === '') {
      errors.push({ field: 'nik', message: 'NIK wajib diisi' });
    } else if (!/^\d{16}$/.test(bookingData.nik)) {
      errors.push({ field: 'nik', message: 'NIK harus 16 digit angka' });
    }

    // Validate nama
    if (!bookingData.nama_lengkap || bookingData.nama_lengkap.trim() === '') {
      errors.push({ field: 'nama_lengkap', message: 'Nama wajib diisi' });
    } else if (bookingData.nama_lengkap.length < 3) {
      errors.push({ field: 'nama_lengkap', message: 'Nama minimal 3 karakter' });
    }

    // Validate tanggal lahir
    if (!bookingData.tanggal_lahir) {
      errors.push({ field: 'tanggal_lahir', message: 'Tanggal lahir wajib diisi' });
    }

    // Validate jenis kelamin
    if (!bookingData.jenis_kelamin) {
      errors.push({ field: 'jenis_kelamin', message: 'Jenis kelamin wajib dipilih' });
    }

    // Validate nomor HP
    if (!bookingData.no_hp || bookingData.no_hp.trim() === '') {
      errors.push({ field: 'no_hp', message: 'Nomor HP wajib diisi' });
    } else if (!/^(\+62|62|0)[0-9]{9,12}$/.test(bookingData.no_hp)) {
      errors.push({ field: 'no_hp', message: 'Format nomor HP tidak valid' });
    }

    // Validate email (optional but must be valid if provided)
    if (bookingData.email && bookingData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bookingData.email)) {
        errors.push({ field: 'email', message: 'Format email tidak valid' });
      }
    }

    // Validate tanggal janji
    if (!bookingData.tanggal_janji) {
      errors.push({ field: 'tanggal_janji', message: 'Tanggal janji wajib dipilih' });
    } else {
      const appointmentDate = new Date(bookingData.tanggal_janji);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (appointmentDate < today) {
        errors.push({ field: 'tanggal_janji', message: 'Tanggal janji tidak boleh di masa lalu' });
      }
    }

    // Validate jam janji
    if (!bookingData.jam_janji || bookingData.jam_janji.trim() === '') {
      errors.push({ field: 'jam_janji', message: 'Jam janji wajib dipilih' });
    }

    // Validate doctor_id
    if (!bookingData.doctor_id) {
      errors.push({ field: 'doctor_id', message: 'Dokter wajib dipilih' });
    }

    // Validate terms acceptance (if in form data)
    if ('acceptTerms' in bookingData && !bookingData.acceptTerms) {
      errors.push({ 
        field: 'nik', // Use a valid field from DTO
        message: 'Anda harus menyetujui syarat dan ketentuan' 
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Check for booking conflicts
   */
  async checkConflict(_bookingData: PublicBookingDto): Promise<BookingConflict> {
    // This would typically make an API call to check conflicts
    // For now, return a mock implementation
    return {
      hasConflict: false
    };
  },

  /**
   * Get available time slots for a specific date and doctor
   */
  async getAvailableTimeSlots(
    doctorId: string,
    date: string
  ): Promise<AvailableTimeSlot> {
    // This would typically make an API call
    // Mock implementation for now
    return {
      date,
      slots: []
    };
  },

  /**
   * Cancel appointment
   */
  async cancelAppointment(
    _request: BookingCancellationRequest
  ): Promise<BookingCancellationResponse> {
    // This would typically make an API call
    // Mock implementation for now
    return {
      success: false,
      message: 'Not implemented'
    };
  },

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(
    _request: BookingRescheduleRequest
  ): Promise<BookingRescheduleResponse> {
    // This would typically make an API call
    // Mock implementation for now
    return {
      success: false,
      message: 'Not implemented',
      newConfirmationCode: '',
      oldAppointment: { date: '', time: '' },
      newAppointment: { date: '', time: '' }
    };
  },

  /**
   * Invalidate doctors query
   */
  invalidateDoctors(queryClient: QueryClient): Promise<void> {
    return queryClient.invalidateQueries({
      queryKey: getPublicAppointmentsControllerGetDoctorsQueryKey()
    });
  },

  /**
   * Prefetch doctors list
   */
  async prefetchDoctors(queryClient: QueryClient): Promise<void> {
    await queryClient.prefetchQuery({
      queryKey: getPublicAppointmentsControllerGetDoctorsQueryKey(),
      queryFn: () => publicAppointmentsControllerGetDoctors()
    });
  }
};

// Helper functions
export const publicAppointmentsHelpers = {
  /**
   * Format phone number to standard format
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Convert to +62 format
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    
    return '+' + cleaned;
  },

  /**
   * Format NIK (add spaces for readability)
   */
  formatNIK(nik: string): string {
    const cleaned = nik.replace(/\D/g, '');
    return cleaned.replace(/(\d{6})(\d{6})(\d{4})/, '$1 $2 $3');
  },

  /**
   * Validate NIK format
   */
  isValidNIK(nik: string): boolean {
    const cleaned = nik.replace(/\D/g, '');
    return /^\d{16}$/.test(cleaned);
  },

  /**
   * Calculate age from birth date
   */
  calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },

  /**
   * Check if appointment date is in the future
   */
  isFutureDate(dateString: string): boolean {
    const appointmentDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return appointmentDate >= today;
  },

  /**
   * Format appointment time for display
   */
  formatAppointmentTime(time: string): string {
    // Assuming time is in HH:mm format
    const [hours] = time.split(':');
    const hour = parseInt(hours, 10);
    
    if (hour < 12) {
      return `${time} WIB`;
    } else {
      return `${time} WIB`;
    }
  }
};

export type {
  PublicBooking,
  PublicBookingFormData,
  PublicBookingResponse,
  BookingValidation,
  DoctorAvailability
};