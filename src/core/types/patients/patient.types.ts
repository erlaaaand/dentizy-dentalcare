import type { 
  PatientResponseDto,
  CreatePatientDto,
  UpdatePatientDto,
  PatientsControllerFindAllParams,
  PatientsControllerSearchParams,
  PatientsControllerFindByDoctorParams,
  PatientSubsetDto
} from '../../api/model';

// Re-export all DTOs
export type { 
  PatientResponseDto,
  CreatePatientDto,
  UpdatePatientDto,
  PatientsControllerFindAllParams,
  PatientsControllerSearchParams,
  PatientsControllerFindByDoctorParams,
  PatientSubsetDto
};

// Alias types untuk kemudahan penggunaan
export type Patient = PatientResponseDto;
export type PatientQueryParams = PatientsControllerFindAllParams;
export type PatientSearchParams = PatientsControllerSearchParams;
export type PatientByDoctorParams = PatientsControllerFindByDoctorParams;

// Patient statistics response
export interface PatientStatistics {
  total_patients: number;
  active_patients: number;
  new_patients_this_month: number;
  patients_by_gender: {
    male: number;
    female: number;
  };
  average_age: number;
  patients_by_age_group: {
    '0-17': number;
    '18-30': number;
    '31-50': number;
    '51+': number;
  };
}

// Response types untuk pagination
export interface PatientPaginatedResponse {
  data: PatientResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreatePatientFormData extends CreatePatientDto {
  confirmEmail?: string;
}

export interface UpdatePatientFormData extends UpdatePatientDto {
  is_active?: boolean;
}

// Filter options untuk UI
export interface PatientFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'nama_lengkap' | 'nomor_rekam_medis' | 'tanggal_lahir' | 'created_at' | 'umur';
  sortOrder?: 'asc' | 'desc';
  jenis_kelamin?: 'L' | 'P';
  umur_min?: number;
  umur_max?: number;
  tanggal_daftar_dari?: string;
  tanggal_daftar_sampai?: string;
  doctor_id?: string;
  is_active?: boolean;
  is_new?: boolean;
}

// Patient dengan informasi tambahan untuk display
export interface PatientDisplay extends PatientResponseDto {
  status_label: string;
  age_group: string;
  registration_source: string;
}

// Patient status tracking
export interface PatientStatus {
  is_active: boolean;
  is_new_patient: boolean;
  is_registered_online: boolean;
  can_activate: boolean;
  can_deactivate: boolean;
  can_delete: boolean;
  can_restore: boolean;
}

// Type untuk patient dengan status yang dihitung
export interface PatientWithStatus extends PatientResponseDto {
  status: PatientStatus;
}

// Enum untuk jenis kelamin (untuk type safety)
export enum Gender {
  MALE = 'L',
  FEMALE = 'P'
}

// Enum untuk sort by options
export enum PatientSortBy {
  NAME = 'nama_lengkap',
  MEDICAL_RECORD_NUMBER = 'nomor_rekam_medis',
  BIRTH_DATE = 'tanggal_lahir',
  CREATED_AT = 'created_at',
  AGE = 'umur'
}

// Enum untuk sort order
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}