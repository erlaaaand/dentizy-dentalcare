import { ApiClient } from '../http/apiClient';
import {
  PatientResponseDto,
  CreatePatientDto,
  UpdatePatientDto,
  PatientsControllerFindAllParams,
  PatientsControllerSearchParams,
} from '../../api/model';

class PatientAPI extends ApiClient {
  constructor() {
    super('/patients');
  }

  async getAll(params?: PatientsControllerFindAllParams) {
    return this.get<PatientResponseDto[]>('', { params });
  }

  async search(params?: PatientsControllerSearchParams) {
    return this.get<PatientResponseDto[]>('/search', { params });
  }

  async getById(id: number) {
    return this.get<PatientResponseDto>(`/${id}`);
  }

  async getByNik(nik: string) {
    return this.get<PatientResponseDto>(`/by-nik/${nik}`);
  }

  async getByMedicalRecordNumber(number: string) {
    return this.get<PatientResponseDto>(`/by-medical-record/${number}`);
  }

  async create(data: CreatePatientDto) {
    return this.post<PatientResponseDto>('', data);
  }

  async update(id: number, data: UpdatePatientDto) {
    return this.patch<PatientResponseDto>(`/${id}`, data);
  }

  async delete(id: number) {
    return this.delete(`/${id}`);
  }

  async restore(id: number) {
    return this.patch(`/${id}/restore`);
  }

  async getStatistics() {
    return this.get('/statistics');
  }
}

export const patientAPI = new PatientAPI();