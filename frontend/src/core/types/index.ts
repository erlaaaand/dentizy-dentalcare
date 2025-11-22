// Export all types
export * from './api';
export * from './components';
export * from './forms';

// Re-export commonly used types for convenience
export type {
    // Base types
    ID,
    ISODateString,
    ISODateTimeString,
    TimeString,
    
    // Enums
    UserRole,
    AppointmentStatus,
    Gender,
    NotificationType,
    NotificationStatus,
    
    // Entity types
    User,
    Patient,
    Appointment,
    MedicalRecord,
    Notification,
    Role,
    
    // DTO types
    CreateUserDto,
    UpdateUserDto,
    CreatePatientDto,
    UpdatePatientDto,
    CreateAppointmentDto,
    UpdateAppointmentDto,
    CreateMedicalRecordDto,
    UpdateMedicalRecordDto,
    LoginDto,
    LoginResponse,
    ChangePasswordDto,
    
    // Response types
    ApiResponse,
    PaginatedResponse,
    ApiError,
    
    // Filter types
    UserFilters,
    PatientFilters,
    AppointmentFilters,
    MedicalRecordFilters,
    NotificationFilters,
} from './api';