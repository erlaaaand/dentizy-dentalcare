import { ApiClient } from '../http/apiClient';
import {
  AppointmentResponseDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  PaginatedAppointmentResponseDto,
  AppointmentsControllerFindAllParams,
} from '../../api/model';

class AppointmentAPI extends ApiClient {
  constructor() {
    super('/appointments');
  }

  async getAll(params?: AppointmentsControllerFindAllParams) {
    return this.get<PaginatedAppointmentResponseDto>('', { params });
  }

  async getById(id: number) {
    return this.get<AppointmentResponseDto>(`/${id}`);
  }

  async create(data: CreateAppointmentDto) {
    return this.post<AppointmentResponseDto>('', data);
  }

  async update(id: number, data: UpdateAppointmentDto) {
    return this.patch<AppointmentResponseDto>(`/${id}`, data);
  }

  async delete(id: number) {
    return this.delete(`/${id}`);
  }

  async complete(id: number) {
    return this.post<AppointmentResponseDto>(`/${id}/complete`);
  }

  async cancel(id: number) {
    return this.post<AppointmentResponseDto>(`/${id}/cancel`);
  }
}

export const appointmentAPI = new AppointmentAPI();