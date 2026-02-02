import {
  type PatientResponseDto,
  type PatientsControllerFindAllParams,
  type PatientsControllerSearchParams,
  PatientResponseDtoJenisKelamin,
} from "@/src/core/api/model"

export type {
  PatientResponseDto,
  PatientsControllerFindAllParams,
  PatientsControllerSearchParams,
}

export { PatientResponseDtoJenisKelamin }

export interface StrictCreatePatientDto {
  nama_lengkap: string
  nik?: string
  no_hp?: string
  email?: string
  alamat?: string
  jenis_kelamin: PatientResponseDtoJenisKelamin
  tanggal_lahir: string
}

export type StrictUpdatePatientDto = Partial<StrictCreatePatientDto>;

export type PatientPayload = StrictCreatePatientDto | StrictUpdatePatientDto

export interface ApiPaginatedResponse<T> {
  data: T[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  total?: number
  totalPages?: number
}