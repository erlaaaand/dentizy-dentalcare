import {
  type MedicalRecordResponseDto,
  type MedicalRecordsControllerFindAllParams,
  type MedicalRecordTreatmentResponseDto,
  type PatientResponseDto,
  type UserResponseDto
} from "@/src/core/api/model"

export type {
  MedicalRecordResponseDto,
  MedicalRecordsControllerFindAllParams,
  MedicalRecordTreatmentResponseDto,
  PatientResponseDto,
  UserResponseDto
}

// Helper untuk Response API yang Paginated
export interface ApiPaginatedResponse<T> {
  data: T[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  // Fallback field
  total?: number
  totalPages?: number
}

// Custom Interface untuk perhitungan biaya agar type-safe
export interface MedicalRecordWithCost extends MedicalRecordResponseDto {
  totalCost?: number
}