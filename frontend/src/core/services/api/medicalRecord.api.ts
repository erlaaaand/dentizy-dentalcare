import { ApiClient } from '../http/apiClient';
import {
  MedicalRecordResponseDto,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  MedicalRecordsControllerFindAllParams,
} from '../../api/model';

class MedicalRecordAPI extends ApiClient {
  constructor() {
    super('/medical-records');
  }

  async getAll(params?: MedicalRecordsControllerFindAllParams) {
    return this.get<MedicalRecordResponseDto[]>('', { params });
  }

  async getById(id: number) {
    return this.get<MedicalRecordResponseDto>(`/${id}`);
  }

  async getByAppointmentId(appointmentId: number) {
    return this.get<MedicalRecordResponseDto>(`/by-appointment/${appointmentId}`);
  }

  async create(data: CreateMedicalRecordDto) {
    return this.post<MedicalRecordResponseDto>('', data);
  }

  async update(id: number, data: UpdateMedicalRecordDto) {
    return this.patch<MedicalRecordResponseDto>(`/${id}`, data);
  }

  async delete(id: number) {
    return this.delete(`/${id}`);
  }

  async restore(id: number) {
    return this.post(`/${id}/restore`);
  }

  async hardDelete(id: number) {
    return this.delete(`/${id}/permanent`);
  }
}

export const medicalRecordAPI = new MedicalRecordAPI();