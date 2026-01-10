// frontend/src/core/constants/routes.constants.ts
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',

    DASHBOARD: '/dashboard',

    // Appointments
    APPOINTMENTS: '/appointments',
    APPOINTMENT_CREATE: '/appointments/new',
    APPOINTMENT_DETAIL: (id: string) => `/appointments/${id}`,
    APPOINTMENT_EDIT: (id: string) => `/appointments/${id}/edit`,

    // Patients
    PATIENTS: '/patients',
    PATIENT_CREATE: '/patients/new',
    PATIENT_DETAIL: (id: string) => `/patients/${id}`,
    PATIENT_EDIT: (id: string) => `/patients/${id}/edit`,

    // Medical Records
    MEDICAL_RECORDS: '/medical-records',
    MEDICAL_RECORD_CREATE: '/medical-records/new',
    MEDICAL_RECORD_DETAIL: (id: string) => `/medical-records/${id}`,
    MEDICAL_RECORD_EDIT: (id: string) => `/medical-records/${id}/edit`,

    // Users
    USERS: '/users',
    USER_CREATE: '/users/new',
    USER_DETAIL: (id: string) => `/users/${id}`,
    USER_EDIT: (id: string) => `/users/${id}/edit`,

    // Reports
    REPORTS: '/reports',
    REPORT_APPOINTMENTS: '/reports/appointments',
    REPORT_PATIENTS: '/reports/patients',
    REPORT_MEDICAL_RECORDS: '/reports/medical-records',

    // Payments
    PAYMENTS: '/payments',

    // Profile
    PROFILE: '/profile',

    // Settings
    SETTINGS: '/settings',
    SETTINGS_NOTIFICATIONS: '/settings/notifications',
    SETTINGS_CLINIC: '/settings/clinic',
    SETTINGS_SECURITY: '/settings/security',
    SETTINGS_SYSTEM_STATUS: '/settings/system-status',

    // Treatments
    TREATMENTS: '/treatments',

    // Error pages
    NOT_FOUND: '/404',
    FORBIDDEN: '/403',
    SERVER_ERROR: '/500',
} as const;

export const PUBLIC_ROUTES = [
    ROUTES.HOME,
    ROUTES.LOGIN,
] as const;

export const PROTECTED_ROUTES = [
    ROUTES.DASHBOARD,
    ROUTES.APPOINTMENTS,
    ROUTES.PATIENTS,
    ROUTES.MEDICAL_RECORDS,
    ROUTES.USERS,
    ROUTES.REPORTS,
    ROUTES.PAYMENTS,
    ROUTES.PROFILE,
    ROUTES.SETTINGS,
    ROUTES.TREATMENTS,
] as const;