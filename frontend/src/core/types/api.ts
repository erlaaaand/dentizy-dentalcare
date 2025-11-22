import type { 
  AppointmentResponseDto, 
  PatientResponseDto, 
  MedicalRecordResponseDto,
  UserResponseDto,
  NotificationResponseDto 
} from '../api/model';

// Base API Response
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query Options
export interface QueryOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
}

// Entity Types
export type Appointment = AppointmentResponseDto;
export type Patient = PatientResponseDto;
export type MedicalRecord = MedicalRecordResponseDto;
export type User = UserResponseDto;
export type Notification = NotificationResponseDto;

// Filter Types
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface SearchFilter {
  search?: string;
}

export type SortOrder = 'asc' | 'desc';