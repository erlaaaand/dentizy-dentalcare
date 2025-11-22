// frontend/src/core/types/api.ts
export type ID = number;

export type Gender = 'L' | 'P';

export type AppointmentStatus = 'dijadwalkan' | 'selesai' | 'dibatalkan';

export type SortOrder = 'asc' | 'desc';

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

export interface Role {
    id: ID;
    name: string;
    description?: string;
}

export interface User {
    id: ID;
    nama_lengkap: string;
    username: string;
    roles: Role[];
    created_at: string;
    updated_at: string;
}

export interface Patient {
    id: ID;
    no_rm: string;
    nama_lengkap: string;
    nik?: string;
    email?: string;
    no_hp?: string;
    tanggal_lahir?: string;
    jenis_kelamin?: Gender;
    alamat?: string;
    created_at: string;
    updated_at: string;
}

export interface Appointment {
    id: ID;
    patient_id: ID;
    doctor_id: ID;
    tanggal_janji: string;
    jam_janji: string;
    keluhan?: string;
    status: AppointmentStatus;
    patient: Patient;
    doctor: User;
    created_at: string;
    updated_at: string;
}

export interface MedicalRecord {
    id: ID;
    appointment_id: ID;
    patient_id: ID;
    user_id_staff: ID;
    subjektif: string;
    objektif: string;
    assessment: string;
    plan: string;
    appointment: Appointment;
    patient: Patient;
    staff: User;
    created_at: string;
    updated_at: string;
}