import {
  medicalRecordsControllerFindAll,
  medicalRecordsControllerSearch,
  medicalRecordsControllerCreate,
  medicalRecordsControllerFindOne,
  medicalRecordsControllerUpdate,
  medicalRecordsControllerFindByAppointmentId
} from '../../../api/generated/medical-records/medical-records';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto, MedicalRecordSearchParams } from '../../../types/medical-records/medical-record.types';

export const MedicalRecordApi = {
  findAll: async (params?: MedicalRecordSearchParams) => {
    return await medicalRecordsControllerFindAll(params);
  },

  findOne: async (id: string) => {
    return await medicalRecordsControllerFindOne(id);
  },

  search: async (params: MedicalRecordSearchParams) => {
    return await medicalRecordsControllerSearch(params);
  },
  findByAppointment: async (appointmentId: string) => {
    return await medicalRecordsControllerFindByAppointmentId(appointmentId);
  },
  create: async (data: CreateMedicalRecordDto) => {
    return await medicalRecordsControllerCreate(data);
  },
  update: async (id: string, data: UpdateMedicalRecordDto) => {
    return await medicalRecordsControllerUpdate(id, data);
  }
};