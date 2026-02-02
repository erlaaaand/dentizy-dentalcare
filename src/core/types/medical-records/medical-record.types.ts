import type { 
  MedicalRecordResponseDto,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  MedicalRecordsControllerSearchParams,
  MedicalRecordsControllerFindAllParams,
  MedicalRecordsControllerGetDoctorStatsParams,
  AppointmentSubsetDto,
  DoctorSubsetDto,
  PatientSubsetDto
} from '../../api/model';

// Re-export all DTOs
export type { 
  MedicalRecordResponseDto,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  MedicalRecordsControllerSearchParams,
  MedicalRecordsControllerFindAllParams,
  MedicalRecordsControllerGetDoctorStatsParams,
  AppointmentSubsetDto,
  DoctorSubsetDto,
  PatientSubsetDto
};

// Alias types untuk kemudahan penggunaan
export type MedicalRecord = MedicalRecordResponseDto;
export type MedicalRecordSearchParams = MedicalRecordsControllerSearchParams;
export type MedicalRecordQueryParams = MedicalRecordsControllerFindAllParams;
export type DoctorStatsParams = MedicalRecordsControllerGetDoctorStatsParams;

// Response types untuk pagination
export interface MedicalRecordPaginatedResponse {
  data: MedicalRecordResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Doctor statistics response
export interface DoctorStatsResponse {
  doctor_id: string;
  doctor_name: string;
  total_records: number;
  total_patients: number;
  total_treatments: number;
  average_treatment_time?: number;
  period: {
    start_date: string;
    end_date: string;
  };
}

// SOAP Notes structure (untuk form handling)
export interface SOAPNotes {
  subjektif?: string;
  objektif?: string;
  assessment?: string;
  plan?: string;
}

// Form data untuk create/update
export interface MedicalRecordFormData extends SOAPNotes {
  appointment_id: string;
  user_id_staff: string;
}

// Filter options untuk UI
export interface MedicalRecordFilters {
  patient_id?: string;
  doctor_id?: string;
  appointment_id?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  appointment_status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

// Medical record dengan relasi yang sudah di-populate
// Menggunakan type assertion yang benar sesuai dengan struktur API
export interface MedicalRecordWithRelations extends MedicalRecordResponseDto {
  appointment: AppointmentSubsetDto;
  doctor: DoctorSubsetDto;
  patient: PatientSubsetDto;
}

// Extended medical record untuk keperluan UI yang lebih spesifik
export interface MedicalRecordDisplay {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  subjektif?: string;
  objektif?: string;
  assessment?: string;
  plan?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  umur_rekam: number;
  // Simplified relations untuk display
  appointment_info: {
    id: string;
    date: string;
    time_start: string;
    time_end?: string;
    status: string;
  };
  doctor_info: {
    id: string;
    name: string;
    specialization?: string;
  };
  patient_info: {
    id: string;
    name: string;
    birth_date: string;
    phone?: string;
  };
}

// Status untuk tracking
export interface MedicalRecordStatus {
  isDeleted: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
  ageInDays: number;
}

// Helper type untuk medical record dengan status yang dihitung
export interface MedicalRecordWithStatus extends MedicalRecordResponseDto {
  status: MedicalRecordStatus;
}

// Type untuk create form
export interface CreateMedicalRecordFormData {
  appointment_id: string;
  user_id_staff: string;
  subjektif?: string;
  objektif?: string;
  assessment?: string;
  plan?: string;
}

// Type untuk update form (semua field optional)
export interface UpdateMedicalRecordFormData {
  subjektif?: string;
  objektif?: string;
  assessment?: string;
  plan?: string;
}