// ============================================
// PATIENT TYPES
// ============================================
export interface Patient {
    id: number;
    nomor_rekam_medis: string;
    nik?: string;
    nama_lengkap: string;
    tanggal_lahir?: Date | string;
    alamat?: string;
    email?: string;
    no_hp?: string;
    jenis_kelamin?: 'L' | 'P';
    is_registered_online: boolean;
    created_at: Date | string;
    updated_at: Date | string;
    appointments?: Appointment[];
}

// ============================================
// USER & ROLE TYPES
// ============================================
export enum UserRole {
    DOKTER = 'dokter',
    STAF = 'staf',
    KEPALA_KLINIK = 'kepala_klinik'
}

export interface Role {
    id: number;
    name: UserRole;
    description?: string;
}

export interface User {
    id: number;
    nama_lengkap: string;
    username: string;
    created_at: Date | string;
    updated_at: Date | string;
    roles: Role[];
}

// Doctor is just a User with specific role
export type Doctor = User;

// ============================================
// APPOINTMENT TYPES
// ============================================
export enum AppointmentStatus {
    DIJADWALKAN = 'dijadwalkan',
    SELESAI = 'selesai',
    DIBATALKAN = 'dibatalkan'
}

export interface Appointment {
    id: number;
    patient_id: number;
    doctor_id: number;
    status: AppointmentStatus | 'dijadwalkan' | 'selesai' | 'dibatalkan';
    tanggal_janji: Date | string;
    jam_janji: string; // Format: HH:mm:ss
    keluhan?: string;
    created_at: Date | string;
    updated_at: Date | string;
    // Relations
    patient: Patient;
    doctor: Doctor;
    medical_record?: MedicalRecord;
}

// ============================================
// MEDICAL RECORD TYPES
// ============================================
export interface MedicalRecord {
    id: number;
    appointment_id: number;
    user_id_staff?: number;
    // SOAP Format
    subjektif?: string;  // (S) Subjective
    objektif?: string;   // (O) Objective
    assessment?: string; // (A) Assessment/Diagnosis
    plan?: string;       // (P) Plan/Treatment
    created_at: Date | string;
    updated_at: Date | string;
    // Relations
    appointment: Appointment;
}

// ============================================
// NOTIFICATION TYPES
// ============================================
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

export interface Notification {
    id: number;
    appointment_id: number;
    type: NotificationType;
    status: NotificationStatus;
    send_at?: Date | string;
    sent_at?: Date | string;
    created_at: Date | string;
    updated_at: Date | string;
    // Relations
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

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
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
        id: number;
        username: string;
        nama_lengkap: string;
        roles: string[];
    };
}

// Appointment DTOs
export interface CreateAppointmentDto {
    patient_id: number;
    doctor_id: number;
    tanggal_janji: string; // Format: YYYY-MM-DD
    jam_janji: string;     // Format: HH:mm:ss
    keluhan?: string;
}

export interface UpdateAppointmentDto {
    status?: 'dijadwalkan' | 'selesai' | 'dibatalkan';
    tanggal_janji?: string;
    jam_janji?: string;
    keluhan?: string;
}

export interface FindAppointmentsQueryDto {
    doctorId?: number | string;
    date?: string;
    status?: 'dijadwalkan' | 'selesai' | 'dibatalkan' | '';
    page?: number;
    limit?: number;
}

// Patient DTOs
export interface CreatePatientDto {
    nama_lengkap: string;
    nik?: string;
    email?: string;
    no_hp?: string;
    tanggal_lahir?: string;
    jenis_kelamin?: 'L' | 'P';
    alamat?: string;
}

export interface UpdatePatientDto {
    nama_lengkap?: string;
    nik?: string;
    email?: string;
    no_hp?: string;
    tanggal_lahir?: string;
    jenis_kelamin?: 'L' | 'P';
    alamat?: string;
}

export interface SearchPatientDto {
    search?: string;
    page?: number;
    limit?: number;
}

// Medical Record DTOs
export interface CreateMedicalRecordDto {
    appointment_id: number;
    user_id_staff: number;
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

// User DTOs
export interface CreateUserDto {
    nama_lengkap: string;
    username: string;
    password: string;
    roles: number[]; // Array of role IDs
}

export interface UpdateUserDto {
    nama_lengkap?: string;
    username?: string;
    roles?: number[];
}

export interface ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ResetPasswordDto {
    newPassword: string;
}

export interface FindUsersQueryDto {
    role?: UserRole;
}