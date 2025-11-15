// API endpoints configuration untuk Sistem Manajemen Klinik Gigi

export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        ME: '/auth/me',
        CHANGE_PASSWORD: '/auth/change-password',
    },

    // Appointments (Janji Temu)
    APPOINTMENTS: {
        BASE: '/appointments',
        DETAIL: (id: number | string) => `/appointments/${id}`,
        BY_PATIENT: (patientId: number | string) => `/appointments/patient/${patientId}`,
        BY_DENTIST: (dentistId: number | string) => `/appointments/dentist/${dentistId}`,
        BY_DATE: '/appointments/by-date',
        UPCOMING: '/appointments/upcoming',
        TODAY: '/appointments/today',
        UPDATE_STATUS: (id: number | string) => `/appointments/${id}/status`,
        SCHEDULE: '/appointments/schedule',
        AVAILABLE_SLOTS: '/appointments/available-slots',
    },

    // Patients (Pasien)
    PATIENTS: {
        BASE: '/patients',
        DETAIL: (id: number | string) => `/patients/${id}`,
        SEARCH: '/patients/search',
        BY_NIK: (nik: string) => `/patients/nik/${nik}`,
        HISTORY: (id: number | string) => `/patients/${id}/history`,
        ALLERGIES: (id: number | string) => `/patients/${id}/allergies`,
    },

    // Medical Records (Rekam Medis Gigi)
    MEDICAL_RECORDS: {
        BASE: '/medical-records',
        DETAIL: (id: number | string) => `/medical-records/${id}`,
        BY_PATIENT: (patientId: number | string) => `/medical-records/patient/${patientId}`,
        BY_APPOINTMENT: (appointmentId: number | string) => `/medical-records/appointment/${appointmentId}`,
        DENTAL_CHART: (patientId: number | string) => `/medical-records/patient/${patientId}/dental-chart`,
    },

    // Users (Pengguna: Dokter Gigi & Staf)
    USERS: {
        BASE: '/users',
        DETAIL: (id: number | string) => `/users/${id}`,
        DENTISTS: '/users/dentists',
        STAFF: '/users/staff',
        BY_ROLE: (role: string) => `/users/role/${role}`,
        SCHEDULE: (id: number | string) => `/users/${id}/schedule`,
    },

    // Treatments (Tindakan Gigi)
    TREATMENTS: {
        BASE: '/treatments',
        DETAIL: (id: number | string) => `/treatments/${id}`,
        CATEGORIES: '/treatments/categories',
        SEARCH: '/treatments/search',
    },

    // Reports (Laporan)
    REPORTS: {
        APPOINTMENTS: '/reports/appointments',
        PATIENTS: '/reports/patients',
        MEDICAL_RECORDS: '/reports/medical-records',
        TREATMENTS: '/reports/treatments',
        REVENUE: '/reports/revenue',
        DASHBOARD: '/reports/dashboard',
        EXPORT: '/reports/export',
    },

    // Settings
    SETTINGS: {
        BASE: '/settings',
        CLINIC: '/settings/clinic',
        SYSTEM: '/settings/system',
    },
} as const;

// HTTP methods
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
} as const;

// HTTP status codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const;

// API response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Request headers
export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
} as const;