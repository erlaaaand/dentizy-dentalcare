/**
 * Appointment domain types.
 *
 * Re-exports the orval-generated DTOs so the rest of the app
 * never imports directly from `../../api/model`.
 * Local type aliases are added where a more readable or
 * domain-specific name is preferred.
 */

// ---------------------------------------------------------------------------
// Raw orval re-exports – keep every model the generated layer exposes
// ---------------------------------------------------------------------------
import type {
  AppointmentResponseDto,
  AppointmentResponseDtoStatus,
  AppointmentsControllerFindAllParams,
  AppointmentPatientDto,
  AppointmentDoctorDto,
  AppointmentMedicalRecordDto,
  AppointmentMedicalRecordDtoSubjektif,
  AppointmentMedicalRecordDtoObjektif,
  AppointmentMedicalRecordDtoAssessment,
  AppointmentMedicalRecordDtoPlan,
  AppointmentSubsetDto,
  PaginatedAppointmentResponseDto,
} from '../../api/model';

export type {
  AppointmentResponseDto,
  AppointmentResponseDtoStatus,
  AppointmentsControllerFindAllParams,
  AppointmentPatientDto,
  AppointmentDoctorDto,
  AppointmentMedicalRecordDto,
  AppointmentMedicalRecordDtoSubjektif,
  AppointmentMedicalRecordDtoObjektif,
  AppointmentMedicalRecordDtoAssessment,
  AppointmentMedicalRecordDtoPlan,
  AppointmentSubsetDto,
  PaginatedAppointmentResponseDto,
};

// ---------------------------------------------------------------------------
// Status enum value – import the const object so it can be used at runtime
// ---------------------------------------------------------------------------
export { AppointmentResponseDtoStatus as AppointmentStatus } from '../../api/model';

// ---------------------------------------------------------------------------
// Semantic aliases – used throughout features & components
// ---------------------------------------------------------------------------

/** Full appointment entity returned by the API. */
export type Appointment = AppointmentResponseDto;

/** Lightweight appointment used in lists / summaries (e.g. patient dashboard). */
export type AppointmentSubset = AppointmentSubsetDto;

/** Paginated list envelope from GET /appointments. */
export type PaginatedAppointments = PaginatedAppointmentResponseDto;

/** Query-string parameters accepted by GET /appointments. */
export type AppointmentQueryParams = AppointmentsControllerFindAllParams;

// ---------------------------------------------------------------------------
// Create DTO – shaped to match the fields the backend validates.
// The orval generator emits `{ [key: string]: unknown }` when the OpenAPI
// schema uses a free-form object; we define the actual expected shape here
// so consumers get full type-safety without touching the generated layer.
// ---------------------------------------------------------------------------
export interface CreateAppointmentDto {
  /** ID pasien yang akan didaftarkan. */
  patient_id: string;
  /** ID dokter yang akan menangani. */
  doctor_id: string;
  /** Tanggal janji temu (format YYYY-MM-DD). */
  tanggal_janji: string;
  /** Jam janji temu (format HH:mm). */
  jam_janji: string;
  /** Keluhan awal pasien (optional). */
  keluhan?: string;
}

// ---------------------------------------------------------------------------
// Update DTO – semua field optional karena PATCH bersifat partial.
// ---------------------------------------------------------------------------
export interface UpdateAppointmentDto {
  /** ID dokter (jika ingin mengalihkan ke dokter lain). */
  doctor_id?: string;
  /** Tanggal janji temu baru (format YYYY-MM-DD). */
  tanggal_janji?: string;
  /** Jam janji temu baru (format HH:mm). */
  jam_janji?: string;
  /** Keluhan / catatan tambahan. */
  keluhan?: string;
  /**
   * Status baru.
   * Biasanya diset oleh backend melalui endpoint khusus
   * (complete / cancel), tetapi tetap diekspos di sini
   * untuk use-case admin update langsung.
   */
  status?: AppointmentResponseDtoStatus;
  /**
   * Medical record – jika diisi bersamaan dengan status SELESAI,
   * backend akan memicu transaksi rekam medis.
   */
  medical_record?: {
    subjektif?: AppointmentMedicalRecordDtoSubjektif;
    objektif?: AppointmentMedicalRecordDtoObjektif;
    assessment?: AppointmentMedicalRecordDtoAssessment;
    plan?: AppointmentMedicalRecordDtoPlan;
  };
}