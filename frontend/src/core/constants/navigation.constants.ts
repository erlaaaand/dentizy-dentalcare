import { ROLES } from './';

/**
 * Navigation Configuration
 */
export const NAVIGATION = {
    dashboard: {
        path: '/dashboard',
        label: 'Dashboard',
        roles: [ROLES.KEPALA_KLINIK, ROLES.DOKTER, ROLES.STAF]
    },
    appointments: {
        path: '/dashboard/appointments',
        label: 'Jadwal Janji Temu',
        roles: [ROLES.KEPALA_KLINIK, ROLES.DOKTER, ROLES.STAF]
    },
    patients: {
        path: '/dashboard/patients',
        label: 'Manajemen Pasien',
        roles: [ROLES.KEPALA_KLINIK, ROLES.DOKTER, ROLES.STAF]
    },
    medicalRecords: {
        path: '/dashboard/medical-records',
        label: 'Rekam Medis',
        roles: [ROLES.KEPALA_KLINIK, ROLES.DOKTER, ROLES.STAF]
    },
    reports: {
        path: '/dashboard/reports',
        label: 'Laporan',
        roles: [ROLES.KEPALA_KLINIK, ROLES.DOKTER]
    },
    settings: {
        path: '/dashboard/settings',
        label: 'Pengaturan',
        roles: [ROLES.KEPALA_KLINIK]
    }
} as const;