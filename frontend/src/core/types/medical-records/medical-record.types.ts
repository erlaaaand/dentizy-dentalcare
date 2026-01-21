import type { 
  MedicalRecordResponseDto,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  MedicalRecordsControllerSearchParams,
  MedicalRecordsControllerFindAllParams
} from '../../api/model';

export type { 
  MedicalRecordResponseDto,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto 
};

export type MedicalRecord = MedicalRecordResponseDto;
export type MedicalRecordSearchParams = MedicalRecordsControllerSearchParams;
export type MedicalRecordQueryParams = MedicalRecordsControllerFindAllParams;