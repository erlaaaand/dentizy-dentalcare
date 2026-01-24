// frontend/src/core/constants/routes.constants.ts
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',

    DASHBOARD: '/dashboard',

    // Appointments
    APPOINTMENTS: '/appointments',

    // Patients
    PATIENTS: '/patients',

    // Medical Records
    MEDICAL_RECORDS: '/medical-records',

    // Users
    USERS: '/users',

    // Reports
    REPORTS: '/reports',

    // Payments
    PAYMENTS: '/payments',

    // Profile
    PROFILE: '/profile',

    // Settings
    SETTINGS: '/settings',

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