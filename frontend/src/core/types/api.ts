// frontend/src/core/types/api.ts
// Re-export all types from generated models
export type {
    // Appointment types
    AppointmentResponseDto,
    AppointmentResponseDtoStatus,
    AppointmentDoctorDto,
    AppointmentPatientDto,
    AppointmentMedicalRecordDto,
    CreateAppointmentDto,
    UpdateAppointmentDto,
    PaginatedAppointmentResponseDto,
    AppointmentsControllerFindAllParams,
    AppointmentsControllerFindAllStatus,

    // Patient types
    PatientResponseDto,
    PatientResponseDtoJenisKelamin,
    CreatePatientDto,
    CreatePatientDtoJenisKelamin,
    UpdatePatientDto,
    PatientsControllerFindAllParams,
    PatientsControllerSearchParams,
    PatientSubsetDto,

    // Medical Record types
    MedicalRecordResponseDto,
    CreateMedicalRecordDto,
    UpdateMedicalRecordDto,
    MedicalRecordsControllerFindAllParams,
    MedicalRecordsControllerSearchParams,

    // User types
    UserResponseDto,
    UserRoleDto,
    UserSummaryDto,
    CreateUserDto,
    UpdateUserDto,
    ChangePasswordDto,
    ResetPasswordDto,
    PasswordChangeResponseDto,
    UsersControllerFindAllParams,
    UsersControllerGetRecentUsersParams,

    // Auth types
    LoginDto,
    User,
    UpdateProfileDto,
    VerifyTokenDto,

    // Notification types
    NotificationResponseDto,
    NotificationResponseDtoStatus,
    NotificationResponseDtoType,
    NotificationStatsDto,
    NotificationTypeStatDto,
    NotificationsControllerFindAllParams,
} from '@/core/api/model';

// Additional utility types
export type ID = number;
export type SortOrder = 'asc' | 'desc' | 'ASC' | 'DESC';

// Generic API types
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

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: SortOrder;
}

export interface PaginatedResponse<T> {
    data: T[];
    count: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface DateRangeFilter {
    startDate?: string;
    endDate?: string;
}

export interface SearchFilter {
    search?: string;
}