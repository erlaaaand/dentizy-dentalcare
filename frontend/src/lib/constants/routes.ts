// Application routes

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  
  // Appointments
  APPOINTMENTS: '/appointments',
  APPOINTMENT_CREATE: '/appointments/new',
  APPOINTMENT_DETAIL: (id: number | string) => `/appointments/${id}`,
  APPOINTMENT_EDIT: (id: number | string) => `/appointments/${id}/edit`,
  
  // Patients
  PATIENTS: '/patients',
  PATIENT_CREATE: '/patients/new',
  PATIENT_DETAIL: (id: number | string) => `/patients/${id}`,
  PATIENT_EDIT: (id: number | string) => `/patients/${id}/edit`,
  
  // Medical Records
  MEDICAL_RECORDS: '/medical-records',
  MEDICAL_RECORD_CREATE: '/medical-records/new',
  MEDICAL_RECORD_DETAIL: (id: number | string) => `/medical-records/${id}`,
  MEDICAL_RECORD_EDIT: (id: number | string) => `/medical-records/${id}/edit`,
  
  // Users
  USERS: '/users',
  USER_CREATE: '/users/new',
  USER_DETAIL: (id: number | string) => `/users/${id}`,
  USER_EDIT: (id: number | string) => `/users/${id}/edit`,
  
  // Reports
  REPORTS: '/reports',
  REPORT_APPOINTMENTS: '/reports/appointments',
  REPORT_PATIENTS: '/reports/patients',
  REPORT_MEDICAL_RECORDS: '/reports/medical-records',
  
  // Profile & Settings
  PROFILE: '/profile',
  SETTINGS: '/settings',
  CHANGE_PASSWORD: '/change-password',
  
  // Error pages
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',
  SERVER_ERROR: '/500',
} as const;

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
] as const;

// Routes that require authentication
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.APPOINTMENTS,
  ROUTES.PATIENTS,
  ROUTES.MEDICAL_RECORDS,
  ROUTES.USERS,
  ROUTES.REPORTS,
  ROUTES.PROFILE,
  ROUTES.SETTINGS,
] as const;

// Navigation menu items
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  roles?: string[];
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: 'dashboard',
  },
  {
    label: 'Janji Temu',
    href: ROUTES.APPOINTMENTS,
    icon: 'calendar',
    roles: ['dokter', 'staf', 'kepala_klinik'],
  },
  {
    label: 'Pasien',
    href: ROUTES.PATIENTS,
    icon: 'users',
    roles: ['dokter', 'staf', 'kepala_klinik'],
  },
  {
    label: 'Rekam Medis',
    href: ROUTES.MEDICAL_RECORDS,
    icon: 'file-text',
    roles: ['dokter', 'staf', 'kepala_klinik'],
  },
  {
    label: 'Pengguna',
    href: ROUTES.USERS,
    icon: 'user',
    roles: ['kepala_klinik'],
  },
  {
    label: 'Laporan',
    href: ROUTES.REPORTS,
    icon: 'bar-chart',
    roles: ['dokter', 'kepala_klinik'],
  },
];

/**
 * Check if a route is public
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => path.startsWith(route));
}

/**
 * Check if a route requires authentication
 */
export function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
}

/**
 * Get the redirect path after login based on user role
 */
export function getDefaultRouteForRole(role: string): string {
  switch (role) {
    case 'kepala_klinik':
      return ROUTES.DASHBOARD;
    case 'dokter':
      return ROUTES.APPOINTMENTS;
    case 'staf':
      return ROUTES.APPOINTMENTS;
    default:
      return ROUTES.DASHBOARD;
  }
}