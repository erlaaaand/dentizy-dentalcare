// frontend/src/core/constants/api.constants.ts

export const API_ENDPOINTS = {
    // ============================================
    // HEALTH CHECK
    // ============================================
    HEALTH: {
        BASE: '/health',
        DETAILS: '/health/details',
        LIVE: '/health/live',
        READY: '/health/ready',
    },

    // ============================================
    // AUTHENTICATION
    // ============================================
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        VERIFY: '/auth/verify',
        ME: '/auth/me',
        UPDATE_PROFILE: '/auth/me', // PATCH
    },

    // ============================================
    // USERS
    // ============================================
    USERS: {
        BASE: '/users',
        DETAIL: (id: number | string) => `/users/${id}`,
        STATISTICS: '/users/statistics',
        RECENT: '/users/recent',
        CHECK_USERNAME: (username: string) => `/users/check-username/${username}`,
        CHANGE_PASSWORD: '/users/change-password',
        RESET_PASSWORD: (id: number | string) => `/users/${id}/reset-password`,
        GENERATE_TEMP_PASSWORD: (id: number | string) => `/users/${id}/generate-temp-password`,
    },

    // ============================================
    // ROLES
    // ============================================
    ROLES: {
        BASE: '/roles',
        DETAIL: (id: number | string) => `/roles/${id}`,
    },

    // ============================================
    // PATIENTS
    // ============================================
    PATIENTS: {
        BASE: '/patients',
        DETAIL: (id: number | string) => `/patients/${id}`,
        SEARCH: '/patients/search',
        STATISTICS: '/patients/statistics',
        BY_MEDICAL_RECORD: (number: string) => `/patients/by-medical-record/${number}`,
        BY_NIK: (nik: string) => `/patients/by-nik/${nik}`,
        BY_DOCTOR: (doctorId: number | string) => `/patients/by-doctor/${doctorId}`,
        RESTORE: (id: number | string) => `/patients/${id}/restore`,
    },

    // ============================================
    // APPOINTMENTS
    // ============================================
    APPOINTMENTS: {
        BASE: '/appointments',
        DETAIL: (id: number | string) => `/appointments/${id}`,
        COMPLETE: (id: number | string) => `/appointments/${id}/complete`,
        CANCEL: (id: number | string) => `/appointments/${id}/cancel`,
    },

    // ============================================
    // MEDICAL RECORDS
    // ============================================
    MEDICAL_RECORDS: {
        BASE: '/medical-records',
        DETAIL: (id: number | string) => `/medical-records/${id}`,
        SEARCH: '/medical-records/search',
        BY_APPOINTMENT: (appointmentId: number | string) => `/medical-records/by-appointment/${appointmentId}`,
        RESTORE: (id: number | string) => `/medical-records/${id}/restore`,
        PERMANENT_DELETE: (id: number | string) => `/medical-records/${id}/permanent`,
    },

    // ============================================
    // NOTIFICATIONS
    // ============================================
    NOTIFICATIONS: {
        BASE: '/notifications',
        DETAIL: (id: number | string) => `/notifications/${id}`,
        STATISTICS: '/notifications/statistics',
        FAILED: '/notifications/failed',
        RETRY: (id: number | string) => `/notifications/${id}/retry`,
        RETRY_ALL_FAILED: '/notifications/retry-all-failed',
        JOBS: {
            STATUS: '/notifications/jobs/status',
            TRIGGER_MANUAL: '/notifications/jobs/trigger-manual',
            STOP_ALL: '/notifications/jobs/stop-all',
            START_ALL: '/notifications/jobs/start-all',
        },
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

// HTTP status codes (dari swagger responses)
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
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const;

// Request headers
export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
} as const;

// Export types untuk type safety
export type ApiResponse<T = any> = {
    success?: boolean;
    data?: T;
    message?: string;
    error?: string;
};

export type PaginatedResponse<T = any> = {
    data: T[];
    count: number;
    page: number;
    limit: number;
    totalPages: number;
};