// frontend/src/core/types/api.ts
export type {
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
    PatientResponseDto,
    PatientResponseDtoJenisKelamin,
    CreatePatientDto,
    CreatePatientDtoJenisKelamin,
    UpdatePatientDto,
    PatientsControllerFindAllParams,
    PatientsControllerSearchParams,
    PatientSubsetDto,
    MedicalRecordResponseDto,
    CreateMedicalRecordDto,
    UpdateMedicalRecordDto,
    MedicalRecordsControllerFindAllParams,
    MedicalRecordsControllerSearchParams,
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
    LoginDto,
    User,
    UpdateProfileDto,
    VerifyTokenDto,
    NotificationResponseDto,
    NotificationResponseDtoStatus,
    NotificationResponseDtoType,
    NotificationStatsDto,
    NotificationTypeStatDto,
    NotificationsControllerFindAllParams,
} from '@/core/api/model';

export type ID = number;
export type SortOrder = 'asc' | 'desc' | 'ASC' | 'DESC';

export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    success: boolean;
}

export interface ApiErrorResponse {
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