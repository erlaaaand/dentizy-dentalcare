import type { 
  PatientResponseDto, 
  CreatePatientDto, 
  UpdatePatientDto,
  PatientsControllerFindAllParams,
  PatientsControllerSearchParams
} from '../../api/model';

export type { 
  PatientResponseDto, 
  CreatePatientDto, 
  UpdatePatientDto 
};

// Alias agar lebih pendek saat digunakan di komponen
export type Patient = PatientResponseDto;
export type PatientQueryParams = PatientsControllerFindAllParams;
export type PatientSearchParams = PatientsControllerSearchParams;