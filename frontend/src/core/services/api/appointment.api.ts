// frontend/src/core/services/api/appointment.api.ts
import {
  useAppointmentsControllerCreate,
  useAppointmentsControllerFindAll,
  useAppointmentsControllerFindOne,
  useAppointmentsControllerUpdate,
  useAppointmentsControllerRemove,
  useAppointmentsControllerComplete,
  useAppointmentsControllerCancel,
} from '@/core/api/generated/appointments/appointments';

export {
  useAppointmentsControllerCreate as useCreateAppointment,
  useAppointmentsControllerFindAll as useGetAppointments,
  useAppointmentsControllerFindOne as useGetAppointment,
  useAppointmentsControllerUpdate as useUpdateAppointment,
  useAppointmentsControllerRemove as useDeleteAppointment,
  useAppointmentsControllerComplete as useCompleteAppointment,
  useAppointmentsControllerCancel as useCancelAppointment,
};

// Re-export types
export type {
  AppointmentResponseDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  PaginatedAppointmentResponseDto,
  AppointmentsControllerFindAllParams,
} from '@/core/api/model';