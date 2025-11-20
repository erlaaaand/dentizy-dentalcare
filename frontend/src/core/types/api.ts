// frontend/src/core/types/api.ts
// ============================================
// BASE TYPES
// ============================================
export type ID = number;
export type ISODateString = string; // Format: YYYY-MM-DD
export type ISODateTimeString = string; // Format: YYYY-MM-DDTHH:mm:ss.sssZ
export type TimeString = string; // Format: HH:mm:ss

// ============================================
// ENUMS
// ============================================
export enum UserRole {
    DOKTER = 'dokter',
    STAF = 'staf',
    KEPALA_KLINIK = 'kepala_klinik'
}

export enum AppointmentStatus {
    DIJADWALKAN = 'dijadwalkan',
    SELESAI = 'selesai',
    DIBATALKAN = 'dibatalkan'
}

export enum Gender {
    MALE = 'L',
    FEMALE = 'P'
}

export enum NotificationType {
    EMAIL_REMINDER = 'email_reminder',
    SMS_REMINDER = 'sms_reminder',
    WHATSAPP_CONFIRMATION = 'whatsapp_confirmation'
}

export enum NotificationStatus {
    PENDING = 'pending',
    SENT = 'sent',
    FAILED = 'failed'
}

// ============================================
// ENTITY TYPES (Sesuai Swagger)
// ============================================

// Role Entity
export interface Role {
    id: ID;
    name: UserRole;
    description?: string;
}

// User Role DTO (dari swagger)
export interface UserRoleDto {
    id: number;
    name: string;
    description: string;
}

// User Entity (Swagger: UserResponseDto)
export interface User {
    id: ID;
    username: string;
    nama_lengkap: string;
    roles: UserRoleDto[];
    created_at: ISODateTimeString;
    updated_at: ISODateTimeString;
    profile_photo?: string | null;
}

// User Summary DTO
export interface UserSummaryDto {
    id: number;
    username: string;
}

// Patient Entity (Swagger: PatientResponseDto)
export interface Patient {
    id: ID;
    nomor_rekam_medis: string;
    nik: string;
    nama_lengkap: string;
    tanggal_lahir: ISODateString;
    umur: number;
    jenis_kelamin: Gender;
    email: string;
    no_hp: string;
    alamat: string;
    riwayat_alergi?: string;
    riwayat_penyakit?: string;
    catatan_khusus?: string;
    golongan_darah?: string;
    pekerjaan?: string;
    kontak_darurat_nama?: string;
    kontak_darurat_nomor?: string;
    kontak_darurat_relasi?: string;
    is_registered_online: boolean;
    is_active: boolean;
    is_new_patient: boolean;
    created_at: ISODateTimeString;
    updated_at: ISODateTimeString;
}

// Patient Subset DTO (untuk relasi)
export interface PatientSubsetDto {
    id: number;
    nama_lengkap: string;
    no_rm: string;
    tanggal_lahir?: ISODateString;
}

// Appointment Patient DTO
export interface AppointmentPatientDto {
    id: number;
    nama_lengkap: string;
    nomor_rekam_medis: string;
    email?: string;
    nomor_telepon?: string;
}

// Appointment Doctor DTO
export interface AppointmentDoctorDto {
    id: number;
    nama_lengkap: string;
    roles: string[];
}

// Doctor Subset DTO (untuk relasi)
export interface DoctorSubsetDto {
    id: number;
    name: string;
}

// Appointment Medical Record DTO
export interface AppointmentMedicalRecordDto {
    id: number;
    appointment_id: number;
    subjektif: any; // JSON object
    objektif: any;
    assessment: any;
    plan: any;
    created_at: ISODateTimeString;
    updated_at: ISODateTimeString;
}

// Appointment Entity (Swagger: AppointmentResponseDto)
export interface Appointment {
    id: ID;
    patient_id: ID;
    doctor_id: ID;
    status: AppointmentStatus;
    tanggal_janji: ISODateString;
    jam_janji: TimeString;
    keluhan?: string;
    created_at: ISODateTimeString;
    updated_at: ISODateTimeString;
    patient: AppointmentPatientDto;
    doctor: AppointmentDoctorDto;
    medical_record?: AppointmentMedicalRecordDto;
}

// Appointment Subset DTO
export interface AppointmentSubsetDto {
    id: number;
    appointment_date: ISODateTimeString;
    status: AppointmentStatus;
    patient?: PatientSubsetDto;
}

// Medical Record Entity (Swagger: MedicalRecordResponseDto)
export interface MedicalRecord {
    id: ID;
    appointment_id: ID;
    doctor_id: ID;
    patient_id: ID;
    subjektif?: any;
    objektif?: any;
    assessment?: any;
    plan?: any;
    created_at: ISODateTimeString;
    updated_at: ISODateTimeString;
    deleted_at?: ISODateTimeString | null;
    umur_rekam: number;
    appointment: AppointmentSubsetDto;
    doctor: DoctorSubsetDto;
    patient: PatientSubsetDto;
}

// Notification Patient DTO
export interface NotificationPatientDto {
    id: number;
    nama_lengkap: string;
    email: string;
}

// Notification Doctor DTO
export interface NotificationDoctorDto {
    id: number;
    nama_lengkap: string;
}

// Notification Appointment DTO
export interface NotificationAppointmentDto {
    id: number;
    tanggal_janji: ISODateString;
    jam_janji: TimeString;
    patient?: NotificationPatientDto;
    doctor?: NotificationDoctorDto;
}

// Notification Entity (Swagger: NotificationResponseDto)
export interface Notification {
    id: ID;
    appointment_id: ID;
    type: NotificationType;
    status: NotificationStatus;
    send_at: ISODateTimeString;
    sent_at?: ISODateTimeString | null;
    created_at: ISODateTimeString;
    updated_at: ISODateTimeString;
    appointment: NotificationAppointmentDto;
}

// Notification Type Stat DTO
export interface NotificationTypeStatDto {
    type: NotificationType;
    count: number;
}

// Notification Stats DTO
export interface NotificationStatsDto {
    total: number;
    pending: number;
    sent: number;
    failed: number;
    scheduled_today: number;
    scheduled_this_week: number;
    by_type?: NotificationTypeStatDto[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    count: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiResponse<T = unknown> {
    success?: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface ApiError {
    message: string;
    statusCode?: number;
    error?: string;
    errors?: Record<string, string[]>;
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

// ============================================
// AUTH DTOs
// ============================================

export interface LoginDto {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
}

export interface VerifyTokenDto {
    token: string;
}

export interface UpdateProfileDto {
    username?: string;
    nama_lengkap?: string;
}

// ============================================
// USER DTOs
// ============================================

export interface CreateUserDto {
    nama_lengkap: string;
    username: string;
    password: string;
    roles: ID[];
}

export interface UpdateUserDto {
    nama_lengkap?: string;
    username?: string;
    roles?: ID[];
}

export interface ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ResetPasswordDto {
    newPassword: string;
}

export interface PasswordChangeResponseDto {
    message: string;
    timestamp: string;
    user?: UserSummaryDto;
}

export interface UserFilters {
    role?: UserRole | '';
    search?: string;
    page?: number;
    limit?: number;
    isActive?: boolean;
}

export interface UserStatistics {
    total: number;
    byRole: {
        DOKTER: number;
        STAF: number;
        KEPALA_KLINIK: number;
    };
    active: number;
    inactive: number;
}

// ============================================
// PATIENT DTOs
// ============================================

export interface CreatePatientDto {
    nama_lengkap: string;
    nik?: string;
    email?: string;
    no_hp?: string;
    tanggal_lahir?: ISODateString;
    jenis_kelamin?: Gender;
    alamat?: string;
    riwayat_alergi?: string;
    riwayat_penyakit?: string;
    catatan_khusus?: string;
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> {
    is_active?: boolean;
}

export interface PatientFilters {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'nama_lengkap' | 'nomor_rekam_medis' | 'tanggal_lahir' | 'created_at' | 'umur';
    sortOrder?: 'asc' | 'desc';
    jenis_kelamin?: Gender | '';
    umur_min?: number;
    umur_max?: number;
    tanggal_daftar_dari?: ISODateString;
    tanggal_daftar_sampai?: ISODateString;
    doctor_id?: ID;
    is_active?: boolean;
    is_new?: boolean;
    has_allergies?: boolean;
}

export interface PatientStatistics {
    total: number;
    new_this_month: number;
    active: number;
    with_allergies: number;
}

// ============================================
// APPOINTMENT DTOs
// ============================================

export interface CreateAppointmentDto {
    patient_id: ID;
    doctor_id: ID;
    tanggal_janji: ISODateString;
    jam_janji: TimeString;
    keluhan?: string;
}

export interface UpdateAppointmentDto {
    patient_id?: ID;
    doctor_id?: ID;
    status?: AppointmentStatus;
    tanggal_janji?: ISODateString;
    jam_janji?: TimeString;
    keluhan?: string;
}

export interface AppointmentFilters {
    status?: AppointmentStatus | '';
    date?: ISODateString;
    doctorId?: ID;
    page?: number;
    limit?: number;
}

// ============================================
// MEDICAL RECORD DTOs
// ============================================

export interface CreateMedicalRecordDto {
    appointment_id: ID;
    user_id_staff: ID;
    subjektif?: string;
    objektif?: string;
    assessment?: string;
    plan?: string;
}

export interface UpdateMedicalRecordDto {
    subjektif?: string;
    objektif?: string;
    assessment?: string;
    plan?: string;
}

export interface MedicalRecordFilters {
    patient_id?: ID;
    doctor_id?: ID;
    appointment_id?: ID;
    search?: string;
    start_date?: ISODateString;
    end_date?: ISODateString;
    appointment_status?: AppointmentStatus | '';
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
}

// ============================================
// NOTIFICATION DTOs
// ============================================

export interface NotificationFilters {
    status?: NotificationStatus | '';
    type?: NotificationType | '';
    page?: number;
    limit?: number;
}

// ============================================
// HEALTH CHECK
// ============================================

export interface HealthCheckResponse {
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
}

// ============================================
// UTILITY TYPES
// ============================================
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;