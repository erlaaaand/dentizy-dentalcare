import { BaseService } from '../../base/base.service';
import {
  publicAppointmentsControllerGetDoctors,
  publicAppointmentsControllerBook,
} from '../../../api/generated/public-appointments/public-appointments';

import type {
  PublicBookingDto,
  AppointmentResponseDto
} from '../../../api/model';

import type {
  DoctorAvailability,
  AvailableTimeSlot,
  BookingConflict,
  BookingCancellationRequest,
  BookingCancellationResponse,
  BookingRescheduleRequest,
  BookingRescheduleResponse
} from '../../../types/public-appointments/public-appointments.types';

/**
 * Public Appointments Service
 * Handles all public appointment-related API calls
 * Extends BaseService for common query operations
 */
export class PublicAppointmentsService extends BaseService {
  /**
   * Get list of active doctors
   */
  async getDoctors(): Promise<DoctorAvailability[]> {
    const response = await publicAppointmentsControllerGetDoctors();
    return response.data as DoctorAvailability[];
  }

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
  }

  /**
   * Check for booking conflicts
   * Note: This would typically make an API call to check conflicts
   */
  async checkConflict(_bookingData: PublicBookingDto): Promise<BookingConflict> {
    // Mock implementation - replace with actual API call when available
    return {
      hasConflict: false
    };
  }

  /**
   * Get available time slots for a specific date and doctor
   * Note: This would typically make an API call
   */
  async getAvailableTimeSlots(
    _doctorId: string,
    date: string
  ): Promise<AvailableTimeSlot> {
    // Mock implementation - replace with actual API call when available
    return {
      date,
      slots: []
    };
  }

  /**
   * Cancel appointment
   * Note: This would typically make an API call
   */
  async cancelAppointment(
    _request: BookingCancellationRequest
  ): Promise<BookingCancellationResponse> {
    // Mock implementation - replace with actual API call when available
    return {
      success: false,
      message: 'Not implemented'
    };
  }

  /**
   * Reschedule appointment
   * Note: This would typically make an API call
   */
  async rescheduleAppointment(
    _request: BookingRescheduleRequest
  ): Promise<BookingRescheduleResponse> {
    // Mock implementation - replace with actual API call when available
    return {
      success: false,
      message: 'Not implemented',
      newConfirmationCode: '',
      oldAppointment: { date: '', time: '' },
      newAppointment: { date: '', time: '' }
    };
  }
}

export const publicAppointmentsService = new PublicAppointmentsService();