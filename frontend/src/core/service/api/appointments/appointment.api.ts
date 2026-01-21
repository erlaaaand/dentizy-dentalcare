import {
  appointmentsControllerFindAll,
  appointmentsControllerCreate,
  appointmentsControllerFindOne,
  appointmentsControllerUpdate,
  appointmentsControllerCancel,
  appointmentsControllerComplete
} from '../../../api/generated/appointments/appointments';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentQueryParams } from '../../../types/appointments/appointment.types';

export const AppointmentApi = {
  findAll: async (params?: AppointmentQueryParams) => {
    return await appointmentsControllerFindAll(params);
  },
  findOne: async (id: string) => {
    return await appointmentsControllerFindOne(id);
  },
  create: async (data: CreateAppointmentDto) => {
    return await appointmentsControllerCreate(data);
  },
  update: async (id: string, data: UpdateAppointmentDto) => {
    return await appointmentsControllerUpdate(id, data);
  },
  cancel: async (id: string) => {
    return await appointmentsControllerCancel(id);
  },
  complete: async (id: string) => {
    return await appointmentsControllerComplete(id);
  }
};