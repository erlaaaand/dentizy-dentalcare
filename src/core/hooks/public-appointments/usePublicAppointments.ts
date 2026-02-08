import { useCallback } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import {
  usePublicAppointmentsControllerGetDoctors,
  usePublicAppointmentsControllerBook,
  publicAppointmentsApi,
  publicAppointmentsHelpers,
  getPublicAppointmentsControllerGetDoctorsQueryKey
} from '../../service/api/public-appointments/public-appointments.api';

import type {
  PublicBookingDto,
  AppointmentResponseDto
} from '../../api/model';

import type {
  PublicBookingFormData,
  DoctorAvailability,
  BookingValidation,
} from '../../types/public-appointments/public-appointments.types';

/**
 * Hook untuk mendapatkan daftar dokter aktif
 */
export const usePublicDoctors = (options?: {
  enabled?: boolean;
  refetchOnMount?: boolean;
}) => {
  const { enabled = true, refetchOnMount = true } = options || {};

  const query = usePublicAppointmentsControllerGetDoctors({
    query: {
      enabled,
      refetchOnMount,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  });

  const doctors = query.data?.data as DoctorAvailability[] | undefined;

  return {
    ...query,
    doctors: doctors || [],
    doctorsCount: doctors?.length || 0
  };
};

/**
 * Hook untuk booking appointment
 */
export const usePublicBooking = () => {
  const mutation = usePublicAppointmentsControllerBook();

  const bookAppointment = useCallback(
    async (bookingData: PublicBookingDto) => {
      const response = await mutation.mutateAsync({ data: bookingData });
      return response.data;
    },
    [mutation]
  );

  return {
    ...mutation,
    bookAppointment,
    isBooking: mutation.isPending
  };
};

/**
 * Hook untuk validasi booking data
 */
export const useBookingValidation = () => {
  const validateBooking = useCallback(
    (bookingData: PublicBookingFormData): BookingValidation => {
      return publicAppointmentsApi.validateBooking(bookingData);
    },
    []
  );

  const isValidNIK = useCallback((nik: string): boolean => {
    return publicAppointmentsHelpers.isValidNIK(nik);
  }, []);

  const formatPhoneNumber = useCallback((phone: string): string => {
    return publicAppointmentsHelpers.formatPhoneNumber(phone);
  }, []);

  const formatNIK = useCallback((nik: string): string => {
    return publicAppointmentsHelpers.formatNIK(nik);
  }, []);

  const calculateAge = useCallback((birthDate: string): number => {
    return publicAppointmentsHelpers.calculateAge(birthDate);
  }, []);

  return {
    validateBooking,
    isValidNIK,
    formatPhoneNumber,
    formatNIK,
    calculateAge
  };
};

/**
 * Hook untuk public appointment actions
 */
export const usePublicAppointmentActions = (queryClient: QueryClient) => {
  const invalidateDoctors = useCallback(async () => {
    await publicAppointmentsApi.invalidateDoctors(queryClient);
  }, [queryClient]);

  const prefetchDoctors = useCallback(async () => {
    await publicAppointmentsApi.prefetchDoctors(queryClient);
  }, [queryClient]);

  const getDoctors = useCallback(async () => {
    return await publicAppointmentsApi.getDoctors();
  }, []);

  const checkConflict = useCallback(
    async (bookingData: PublicBookingDto) => {
      return await publicAppointmentsApi.checkConflict(bookingData);
    },
    []
  );

  return {
    invalidateDoctors,
    prefetchDoctors,
    getDoctors,
    checkConflict
  };
};

/**
 * Hook untuk complete booking flow
 */
export const usePublicBookingFlow = (queryClient: QueryClient) => {
  const { bookAppointment, isBooking } = usePublicBooking();
  const { validateBooking } = useBookingValidation();
  const { invalidateDoctors } = usePublicAppointmentActions(queryClient);

  const submitBooking = useCallback(
    async (bookingData: PublicBookingFormData): Promise<{
      success: boolean;
      data?: AppointmentResponseDto;
      validation?: BookingValidation;
      error?: Error;
    }> => {
      // Validate booking data
      const validation = validateBooking(bookingData);

      if (!validation.isValid) {
        return {
          success: false,
          validation
        };
      }

      try {
        // Submit booking
        const data = await bookAppointment(bookingData);

        // Invalidate doctors cache
        await invalidateDoctors();

        return {
          success: true,
          data: data ?? undefined
        };
      } catch (error) {
        return {
          success: false,
          error: error as Error
        };
      }
    },
    [bookAppointment, validateBooking, invalidateDoctors]
  );

  return {
    submitBooking,
    isBooking
  };
};

/**
 * Hook untuk mendapatkan query keys
 */
export const usePublicAppointmentQueryKeys = () => {
  return {
    doctors: getPublicAppointmentsControllerGetDoctorsQueryKey()
  };
};

// Export helpers
export { publicAppointmentsHelpers };

// Export types
export type {
  PublicBookingDto,
  PublicBookingFormData,
  DoctorAvailability,
  BookingValidation
};