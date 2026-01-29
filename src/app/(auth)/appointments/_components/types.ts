import {
  AppointmentResponseDto,
  PaginatedAppointmentResponseDto,
  AppointmentResponseDtoStatus,
  AppointmentsControllerFindAllParams,
  AppointmentsControllerFindAllStatus,
  UserResponseDto,
  PatientResponseDto,
} from "@/src/core/api/model"

export type {
  AppointmentResponseDto,
  PaginatedAppointmentResponseDto,
  AppointmentsControllerFindAllParams,
  UserResponseDto,
  PatientResponseDto,
}

export { 
  AppointmentResponseDtoStatus,
  AppointmentsControllerFindAllStatus
}

export interface StrictCreateAppointmentDto {
  patient_id: number
  doctor_id: number
  tanggal_janji: string
  jam_janji: string
  keluhan?: string
  status?: AppointmentResponseDtoStatus
}

export interface StrictUpdateAppointmentDto {
  doctor_id?: number
  tanggal_janji?: string
  jam_janji?: string
  keluhan?: string
  status?: AppointmentResponseDtoStatus
}

export type AppointmentPayload = StrictCreateAppointmentDto | StrictUpdateAppointmentDto

export interface ApiPaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
}