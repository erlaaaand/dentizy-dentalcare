// ============================================
// BASE TYPES
// ============================================
export type ID = number;
export type ISODateString = string; // Format: YYYY-MM-DD
export type ISODateTimeString = string; // Format: YYYY-MM-DDTHH:mm:ss
export type TimeString = string; // Format: HH:mm:ss
import { useAuthStore } from '@/lib/store/authStore';

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
// ENTITY TYPES
// ============================================
export interface Role {
    id: ID;
    name: UserRole;
    description?: string;
}

export interface User {
    id: ID;
    nama_lengkap: string;
    username: string;
    created_at: ISODateTimeString;
    updated_at: ISODateTimeString;
    roles: Role[];
}

export function useRole() {
    const { hasRole, isKepalaKlinik, isDokter, isStaf } = useAuthStore();

    return {
        hasRole,
        isKepalaKlinik,
        isDokter,
        isStaf,
    };
}

export interface Patient {
    id: ID;
    nomor_rekam_medis: string;
    nik?: string;
    nama_lengkap: string;
    tanggal_lahir?: ISODateString;
    alamat?: string;
    email?: string;
    no_hp?: string;
    jenis_kelamin?: Gender;
    is_registered_online: boolean;
    created_at: ISODateTimeString;
    updated_at: ISODateTimeString;
    appointments?: Appointment[];
}

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
    patient: Patient;
    doctor: User;
    medical_record?: MedicalRecord;
}

export interface MedicalRecord {
    id: ID;
    appointment_id: ID;
    user_id_staff?: ID;
    subjektif?: string;
    objektif?: string;
    assessment?: string;
    plan?: string;
    created_at: ISODateTimeString;
    updated_at: ISODateTimeString;
    appointment: Appointment;
    user_staff?: User;
}

export interface Notification {
    id: ID;
    appointment_id: ID;
    type: NotificationType;
    status: NotificationStatus;
    send_at?: ISODateTimeString;
    sent_at?: ISODateTimeString;
    created_at: ISODateTimeString;
    updated_at: ISODateTimeString;
    appointment: Appointment;
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
    pagination: PaginationMeta;
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
        roles: UserRole[];
    };
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
    doctorId?: ID;
    date?: ISODateString;
    status?: AppointmentStatus | '';
    page?: number;
    limit?: number;
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
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> { }

export interface PatientSearchParams {
    search?: string;
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

export interface UpdateMedicalRecordDto extends Partial<Omit<CreateMedicalRecordDto, 'appointment_id' | 'user_id_staff'>> { }

// User DTOs
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

export interface UserFilters {
    role?: UserRole;
}

// ============================================
// UTILITY TYPES
// ============================================
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;