import {
  medicalRecordTreatmentsControllerFindAll,
  medicalRecordTreatmentsControllerCreate,
  medicalRecordTreatmentsControllerUpdate,
  medicalRecordTreatmentsControllerRemove,
  medicalRecordTreatmentsControllerFindOne,
  medicalRecordTreatmentsControllerFindByMedicalRecordId,
  medicalRecordTreatmentsControllerGetTotalByMedicalRecordId,
  medicalRecordTreatmentsControllerGetTopTreatments
} from '../../../api/generated/medical-record-treatments/medical-record-treatments';
import type { 
  CreateMedicalRecordTreatmentDto, 
  UpdateMedicalRecordTreatmentDto, 
  MedicalRecordTreatmentQueryParams,
  TopTreatmentsParams
} from '../../../types/medical-record-treatments/medical-record-treatments.types';

export const MedicalRecordTreatmentApi = {
  findAll: async (params?: MedicalRecordTreatmentQueryParams) => 
    await medicalRecordTreatmentsControllerFindAll(params),
  
  findOne: async (id: number) => 
    await medicalRecordTreatmentsControllerFindOne(id),
  
  findByMedicalRecordId: async (medicalRecordId: number) => 
    await medicalRecordTreatmentsControllerFindByMedicalRecordId(medicalRecordId),
  
  create: async (data: CreateMedicalRecordTreatmentDto) => 
    await medicalRecordTreatmentsControllerCreate(data),
  
  update: async (id: number, data: UpdateMedicalRecordTreatmentDto) => 
    await medicalRecordTreatmentsControllerUpdate(id, data),
  
  remove: async (id: number) => 
    await medicalRecordTreatmentsControllerRemove(id),
  
  // Statistics and analytics
  getTotalByMedicalRecordId: async (medicalRecordId: number) => 
    await medicalRecordTreatmentsControllerGetTotalByMedicalRecordId(medicalRecordId),
  
  getTopTreatments: async (params?: TopTreatmentsParams) => 
    await medicalRecordTreatmentsControllerGetTopTreatments(params)
};