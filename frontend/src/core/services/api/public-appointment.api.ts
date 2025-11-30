// frontend/src/core/services/api/public-appointment.api.ts

import {
    usePublicAppointmentsControllerBook,
} from '@/core/api/generated/public-appointments/public-appointments';

// Export dengan nama yang lebih ramah pengguna
export {
    usePublicAppointmentsControllerBook as useBookPublicAppointment,
};

// Re-export types agar mudah diimport dari satu tempat
export type {
    PublicBookingDto,
    AppointmentResponseDto,
} from '@/core/api/model';