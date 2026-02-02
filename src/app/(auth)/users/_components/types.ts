import {
  type UserResponseDto,
  type UserRoleDto,
  type UsersControllerFindAllParams,
  type CreateUserDto,
  type UpdateUserDto
} from "@/src/core/api/model"

export type {
  UserResponseDto,
  UserRoleDto,
  UsersControllerFindAllParams,
  CreateUserDto,
  UpdateUserDto
}

// --- STRICT PAYLOAD DEFINITIONS ---
// Definisi manual agar validasi form type-safe di frontend sebelum dikirim ke API

export interface StrictCreateUserDto {
  username: string
  password?: string
  nama_lengkap: string
  email?: string
  // Backend menerima array role ID (UUID string)
  roles: string[] 
}

export interface StrictUpdateUserDto extends Partial<Omit<StrictCreateUserDto, 'roles'>> {
  roles?: string[]
}

export type UserPayload = StrictCreateUserDto | StrictUpdateUserDto

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