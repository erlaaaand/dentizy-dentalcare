import type { 
  AppointmentResponseDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentsControllerFindAllParams
} from '../../api/model';

export type { 
  AppointmentResponseDto,
  CreateAppointmentDto,
  UpdateAppointmentDto 
};

export type Appointment = AppointmentResponseDto;
export type AppointmentQueryParams = AppointmentsControllerFindAllParams;