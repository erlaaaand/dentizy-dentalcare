import { NavigationItem, BadgeVariant, NavBadgeColor } from './sidebar.types';
import { ROUTES } from '@/core/constants/routes.constants';

export const navigationItems: NavigationItem[] = [
    // ======================= DASHBOARD =======================
    {
        id: 'dashboard',
        label: 'Dashboard',
        href: ROUTES.DASHBOARD,
        allowedRoles: ['kepala_klinik', 'dokter', 'staf'],
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 10a7 7 0 1114 0 7 7 0 01-14 0zm7-3a1 1 0 00-1 1v3a1 1 0 102 0V8a1 1 0 00-1-1z" />
            </svg>
        ),
    },

    // ======================= JANJI TEMU =======================
    {
        id: 'appointments',
        label: 'Jadwal Janji Temu',
        href: ROUTES.APPOINTMENTS,
        allowedRoles: ['kepala_klinik', 'dokter', 'staf'],
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 2v2H5a2 2 0 00-2 2v13a3 3 0 003 3h12a3 3 0 003-3V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7zm12 7H5v10a1 1 0 001 1h12a1 1 0 001-1V9z" />
            </svg>
        ),
    },

    // ======================= PASIEN =======================
    {
        id: 'patients',
        label: 'Manajemen Pasien',
        href: ROUTES.PATIENTS,
        allowedRoles: ['kepala_klinik', 'dokter', 'staf'],
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0v1H5v-1z" />
            </svg>
        ),
    },

    // ======================= REKAM MEDIS =======================
    {
        id: 'medical-records',
        label: 'Rekam Medis',
        href: ROUTES.MEDICAL_RECORDS,
        allowedRoles: ['kepala_klinik', 'dokter', 'staf'],
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5a2 2 0 00-2 2v15a1 1 0 001 1h16a1 1 0 001-1V5a2 2 0 00-2-2zm-6 9h3v2h-3v3h-2v-3H8v-2h3V9h2v3z" />
            </svg>
        ),
    },

    // ======================= LAPORAN =======================
    {
        id: 'reports',
        label: 'Laporan',
        href: ROUTES.REPORTS,
        allowedRoles: ['kepala_klinik', 'dokter'],
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 3h14v4H5V3zm0 6h6v12H5V9zm8 0h6v12h-6V9z" />
            </svg>
        ),
    },

    // ======================= USER =======================
    {
        id: 'users',
        label: 'Manajemen User',
        href: ROUTES.USERS,
        allowedRoles: ['kepala_klinik'],
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0zm-4 6c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4z" />
            </svg>
        ),
        badge: { text: 'Admin', color: 'red' },
    },

    // ======================= PEMBAYARAN =======================
    {
        id: 'payments',
        label: 'Kelola Pembayaran',
        href: ROUTES.PAYMENTS,
        allowedRoles: ['kepala_klinik', 'staf'],
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 7a3 3 0 013-3h12a3 3 0 013 3v2H3V7zm0 6h18v4a3 3 0 01-3 3H6a3 3 0 01-3-3v-4zm12 2v2H9v-2h6z" />
            </svg>
        ),
    },

    // ======================= LAYANAN =======================
    {
        id: 'treatments',
        label: 'Kelola Layanan',
        href: ROUTES.TREATMENTS,
        allowedRoles: ['kepala_klinik'],
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 4h10a2 2 0 012 2v12H5V6a2 2 0 012-2zm3 4v2H8v2h2v2h2v-2h2v-2h-2V8h-2z" />
            </svg>
        ),
    },

    // ======================= PENGATURAN =======================
    {
        id: 'settings',
        label: 'Pengaturan',
        href: ROUTES.SETTINGS,
        allowedRoles: ['kepala_klinik'],
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8a4 4 0 110 8 4 4 0 010-8zm9 4c0-.7-.1-1.4-.3-2l2.1-1.6-2-3.4-2.5 1a9 9 0 00-3.4-2l-.4-2.6h-4l-.4 2.6a9 9 0 00-3.4 2l-2.5-1-2 3.4 2.1 1.6a9 9 0 000 4l-2.1 1.6 2 3.4 2.5-1a9 9 0 003.4 2l.4 2.6h4l.4-2.6a9 9 0 003.4-2l2.5 1 2-3.4-2.1-1.6c.2-.6.3-1.3.3-2z" />
            </svg>
        ),
    },
];

export const colorToVariantMap: Record<NavBadgeColor, BadgeVariant> = {
    red: 'error',
    green: 'success',
    yellow: 'warning',
    blue: 'info',
};
