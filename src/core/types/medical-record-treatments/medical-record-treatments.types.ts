import type { 
  MedicalRecordTreatmentResponseDto,
  CreateMedicalRecordTreatmentDto,
  UpdateMedicalRecordTreatmentDto,
  MedicalRecordTreatmentSubsetDto,
  MedicalRecordTreatmentsControllerFindAllParams,
  MedicalRecordTreatmentsControllerGetTopTreatmentsParams,
  MedicalRecordTreatmentsControllerGetTotalByMedicalRecordId200,
  MedicalRecordTreatmentsControllerGetTotalByMedicalRecordId200Data,
  MedicalRecordTreatmentsControllerRemove200
} from '../../api/model';

// Re-export all DTOs
export type { 
  MedicalRecordTreatmentResponseDto, 
  CreateMedicalRecordTreatmentDto, 
  UpdateMedicalRecordTreatmentDto,
  MedicalRecordTreatmentSubsetDto,
  MedicalRecordTreatmentsControllerGetTotalByMedicalRecordId200,
  MedicalRecordTreatmentsControllerGetTotalByMedicalRecordId200Data,
  MedicalRecordTreatmentsControllerRemove200
};

// Alias types
export type MedicalRecordTreatment = MedicalRecordTreatmentResponseDto;
export type MedicalRecordTreatmentQueryParams = MedicalRecordTreatmentsControllerFindAllParams;
export type TopTreatmentsParams = MedicalRecordTreatmentsControllerGetTopTreatmentsParams;
export type TreatmentTotalResponse = MedicalRecordTreatmentsControllerGetTotalByMedicalRecordId200;