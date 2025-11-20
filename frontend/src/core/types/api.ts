// frontend/src/core/types/api.ts
// ============================================
// BASE TYPES
// ============================================
export type ID = number;
export type ISODateString = string; // Format: YYYY-MM-DD
export type ISODateTimeString = string; // Format: YYYY-MM-DDTHH:mm:ss
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

// User Entity (Swagger: UserResponseDto)
export interface User {
    id: ID;
    username: string;
    nama_lengkap: string;
    roles: Role[];
    created_at: ISODateTimeString;
    updated_at: ISODateTimeString;
    profile_photo?: string | null;
}

// Patient Entity (Swagger: PatientResponseDto)
export interface Patient {
    id: ID;
    nomor_rekam_medis: string;
    nik: string;
    nama_lengkap: string;
    tanggal_lahir: ISODateString;
    umur: number; // Computed field from backend
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
    // Relations
    appointments?: Appointment[];
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
    // Relations
    patient: {
        id: ID;
        nama_lengkap: string;
        nomor_rekam_medis: string;
        email?: string;
        nomor_telepon?: string;
    };
    doctor: {
        id: ID;
        nama_lengkap: string;
        roles: string[];
    };
    medical_record?: MedicalRecord;
}

// Medical Record Entity (Swagger: MedicalRecordResponseDto)
export interface MedicalRecord {
    id: ID;
    appointment_id: ID;
    doctor_id: ID;
    patient_id: ID;
    subjektif?: string;
    objektif?: string;
    assessment?: string;
    plan?: string;
    created_at: ISODateTimeString;
    updated_at: ISODateTimeString;
    deleted_at?: ISODateTimeString | null;
    umur_rekam: number; // Age at time of record
    // Relations
    appointment: {
        id: ID;
        appointment_date: ISODateTimeString;
        status: AppointmentStatus;
        patient: {
            id: ID;
            nama_lengkap: string;
            no_rm: string;
            tanggal_lahir?: ISODateString;
        };
    };
    doctor: {
        id: ID;
        name: string;
    };
    patient: {
        id: ID;
        nama_lengkap: string;
        no_rm: string;
        tanggal_lahir?: ISODateString;
    };
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
    // Relations
    appointment: {
        id: ID;
        tanggal_janji: ISODateString;
        jam_janji: TimeString;
        patient: {
            id: ID;
            nama_lengkap: string;
            email: string;
        };
        doctor: {
            id: ID;
            nama_lengkap: string;
        };
    };
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
    success: boolean;
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

// Auth DTOs
export interface LoginDto {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    user: {
        id: ID;
        username: string;
        nama_lengkap: string;
        roles: Role[];
    };
}

export interface VerifyTokenDto {
    token: string;
}

export interface UpdateProfileDto {
    username?: string;
    nama_lengkap?: string;
}

// User DTOs
export interface CreateUserDto {
    nama_lengkap: string;
    username: string;
    password: string;
    roles: ID[]; // Array of role IDs
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

export interface UserFilters {
    role?: UserRole | '';
    search?: string;
    page?: number;
    limit?: number;
    isActive?: boolean;
}

// Patient DTOs
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

// Appointment DTOs
export interface CreateAppointmentDto {
    patient_id: ID;
    doctor_id: ID;
    tanggal_janji: ISODateString;
    jam_janji: TimeString;
    keluhan?: string;
}

export interface UpdateAppointmentDto {
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

// Medical Record DTOs
export interface CreateMedicalRecordDto {
    appointment_id: ID;
    user_id_staff: ID;
    subjektif?: string;
    objektif?: string;
    assessment?: string;
    plan?: string;
}

export interface UpdateMedicalRecordDto extends Partial<Omit<CreateMedicalRecordDto, 'appointment_id' | 'user_id_staff'>> {}

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

// Notification DTOs
export interface NotificationFilters {
    status?: NotificationStatus | '';
    type?: NotificationType | '';
    page?: number;
    limit?: number;
}

export interface NotificationStats {
    total: number;
    pending: number;
    sent: number;
    failed: number;
    scheduled_today: number;
    scheduled_this_week: number;
    by_type: Array<{
        type: NotificationType;
        count: number;
    }>;
}

// ============================================
// UTILITY TYPES
// ============================================
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;