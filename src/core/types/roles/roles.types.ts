import {
  type UserResponseDto,
  type UserRoleDto,
  type UsersControllerFindAllParams,
  // Import DTO asli untuk casting
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

export interface StrictCreateUserDto {
  username: string
  password?: string
  nama_lengkap: string
  email?: string
  // Backend menerima array of UUID strings
  roles: string[] 
}

export interface StrictUpdateUserDto extends Partial<Omit<StrictCreateUserDto, 'roles'>> {
  roles?: string[]
}

export type UserPayload = StrictCreateUserDto | StrictUpdateUserDto

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