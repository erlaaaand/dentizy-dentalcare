import { BaseService } from '../../base/base.service';
import {
  medicalRecordsControllerCreate,
  medicalRecordsControllerFindAll,
  medicalRecordsControllerSearch,
  medicalRecordsControllerFindByAppointmentId,
  medicalRecordsControllerGetDoctorStats,
  medicalRecordsControllerFindOne,
  medicalRecordsControllerUpdate,
  medicalRecordsControllerRemove,
  medicalRecordsControllerRestore,
  medicalRecordsControllerHardDelete,
} from '../../../api/generated/medical-records/medical-records';

import type {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  MedicalRecordQueryParams,
  MedicalRecordSearchParams,
  DoctorStatsParams,
  MedicalRecord,
  MedicalRecordPaginatedResponse,
  DoctorStatsResponse
} from '../../../types/medical-records/medical-record.types';

export class MedicalRecordsService extends BaseService {
  
  async findAll(params?: MedicalRecordQueryParams): Promise<MedicalRecordPaginatedResponse> {
    const response = await medicalRecordsControllerFindAll(params);
    return response.data as unknown as MedicalRecordPaginatedResponse;
  }

  async findOne(id: string): Promise<MedicalRecord> {
    const response = await medicalRecordsControllerFindOne(id);
    return response.data as MedicalRecord;
  }

  async search(params: MedicalRecordSearchParams): Promise<MedicalRecordPaginatedResponse> {
    const response = await medicalRecordsControllerSearch(params);
    return response.data as unknown as MedicalRecordPaginatedResponse;
  }

  async findByAppointmentId(appointmentId: string): Promise<MedicalRecord> {
    const response = await medicalRecordsControllerFindByAppointmentId(appointmentId);
    return response.data as MedicalRecord;
  }

  async getDoctorStats(params?: DoctorStatsParams): Promise<DoctorStatsResponse> {
    const response = await medicalRecordsControllerGetDoctorStats(params);
    return (response as unknown) as DoctorStatsResponse;
  }
  
  async create(data: CreateMedicalRecordDto): Promise<MedicalRecord> {
    const response = await medicalRecordsControllerCreate(data);
    if (response.status === 201) {
      return response.data as MedicalRecord;
    }
    throw new Error('Failed to create medical record');
  }

  async update(id: string, data: UpdateMedicalRecordDto): Promise<MedicalRecord> {
    const response = await medicalRecordsControllerUpdate(id, data);
    if (response.status === 200) {
      return response.data as MedicalRecord;
    }
    throw new Error('Failed to update medical record');
  }

  async remove(id: string): Promise<void> {
    const response = await medicalRecordsControllerRemove(id);
    if (response.status !== 200) {
      throw new Error('Failed to remove medical record');
    }
  }

  async restore(id: string): Promise<MedicalRecord> {
    const response = await medicalRecordsControllerRestore(id);
    if (response.status === 200) {
      return response.data as MedicalRecord;
    }
    throw new Error('Failed to restore medical record');
  }

  async hardDelete(id: string): Promise<void> {
    const response = await medicalRecordsControllerHardDelete(id);
    if (response.status !== 204) {
      throw new Error('Failed to permanently delete medical record');
    }
  }
}

export const medicalRecordsService = new MedicalRecordsService();