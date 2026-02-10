import { BaseService } from '../../base/base.service';
import {
  appointmentsControllerFindAll,
  appointmentsControllerFindOne,
  appointmentsControllerCreate,
  appointmentsControllerUpdate,
  appointmentsControllerCancel,
  appointmentsControllerComplete,
  appointmentsControllerRemove,
} from '../../../api/generated/appointments/appointments';

import type {
  AppointmentQueryParams,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentResponseDto,
  PaginatedAppointmentResponseDto,
} from '../../../types/appointments/appointment.types';
export class AppointmentsService extends BaseService {

  async findAll(params?: AppointmentQueryParams): Promise<PaginatedAppointmentResponseDto> {
    const response = await appointmentsControllerFindAll(params);
    return response.data as PaginatedAppointmentResponseDto;
  }

  async findOne(id: string): Promise<AppointmentResponseDto> {
    const response = await appointmentsControllerFindOne(id);
    return response.data as AppointmentResponseDto;
  }

  async create(data: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    const response = await appointmentsControllerCreate({ data });
    return response.data as AppointmentResponseDto;
  }

  async update(id: string, data: UpdateAppointmentDto): Promise<AppointmentResponseDto> {
    const response = await appointmentsControllerUpdate(id, { data });
    return response.data as AppointmentResponseDto;
  }

  async complete(id: string): Promise<AppointmentResponseDto> {
    const response = await appointmentsControllerComplete(id);
    return response.data as AppointmentResponseDto;
  }

  async cancel(id: string): Promise<AppointmentResponseDto> {
    const response = await appointmentsControllerCancel(id);
    return response.data as AppointmentResponseDto;
  }

  async remove(id: string): Promise<void> {
    await appointmentsControllerRemove(id);
  }
}

export const appointmentsService = new AppointmentsService();