/**
 * Local re-exports untuk fitur appointments.
 *
 * Semua domain types mengalir dari core types layer.
 * File ini TIDAK mendefensikan ulang DTO — cukup re-export
 * dan tambahkan helper types yang spesifik ke UI layer ini.
 */

import type {
  AppointmentResponseDto,
  AppointmentResponseDtoStatus,
  AppointmentsControllerFindAllParams,
  AppointmentsControllerFindAllStatus,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  PaginatedAppointmentResponseDto,
} from "@/src/core/api/model"

// ---------------------------------------------------------------------------
// Re-export core types
// ---------------------------------------------------------------------------
export type {
  AppointmentResponseDto,
  AppointmentsControllerFindAllParams,
  PaginatedAppointmentResponseDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
}

export {
  AppointmentResponseDtoStatus,
  AppointmentsControllerFindAllStatus,
}

// ---------------------------------------------------------------------------
// Union type untuk onSuccess callback di dialog.
// Page menentukan cabang (create vs update) berdasarkan ada-tidaknya
// `selectedAppointment`, sehingga payload sudah ternarrow di masing-masing sisi.
// ---------------------------------------------------------------------------
export type AppointmentPayload = CreateAppointmentDto | UpdateAppointmentDto

// ---------------------------------------------------------------------------
// Types untuk fetch dokter & pasien di dialog (bukan bagian dari appointment
// domain, tetapi dibutuhkan oleh komponen ini).
// ---------------------------------------------------------------------------
export interface UserRoleDto {
  id: number
  name: string
}

export interface UserResponseDto {
  id: number
  nama_lengkap: string
  roles: { id: number; name: string }[]
}

export interface PatientResponseDto {
  id: number
  nama_lengkap: string
  nomor_rekam_medis: string
  nik?: string
  is_active?: boolean
  email?: string
  nomor_telepon?: string
}

/**
 * Envelope pagination generik yang dikembalikan oleh API.
 * Dipakai untuk menormalise response PatientService & UserApi
 * yang belum memiliki typed wrapper.
 */
export interface ApiPaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
}