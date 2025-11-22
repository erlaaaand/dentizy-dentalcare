import { NavItem } from '../types/global/layout.types';
import { ROUTES } from './routes.constants';
import { ROLES } from './role.constants';

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    roles: [ROLES.KEPALA_KLINIK, ROLES.DOKTER, ROLES.STAF],
  },
  {
    label: 'Janji Temu',
    href: ROUTES.APPOINTMENTS,
    roles: [ROLES.KEPALA_KLINIK, ROLES.DOKTER, ROLES.STAF],
  },
  {
    label: 'Pasien',
    href: ROUTES.PATIENTS,
    roles: [ROLES.KEPALA_KLINIK, ROLES.DOKTER, ROLES.STAF],
  },
  {
    label: 'Rekam Medis',
    href: ROUTES.MEDICAL_RECORDS,
    roles: [ROLES.KEPALA_KLINIK, ROLES.DOKTER],
  },
  {
    label: 'Pengguna',
    href: ROUTES.USERS,
    roles: [ROLES.KEPALA_KLINIK],
  },
  {
    label: 'Laporan',
    href: ROUTES.REPORTS,
    roles: [ROLES.KEPALA_KLINIK],
  },
  {
    label: 'Pengaturan',
    href: ROUTES.SETTINGS,
    roles: [ROLES.KEPALA_KLINIK],
  },
];