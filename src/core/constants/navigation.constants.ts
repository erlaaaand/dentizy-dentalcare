import {  
  Users,    
  Settings,
  LayoutDashboard,
  UserPlus,
  Stethoscope,
  CalendarClock,
  ReceiptText,
  BarChart3,
  HeartPulse 
} from "lucide-react";

import { PROTECTED_ROUTES } from "./routes.constants";
import { ROLES } from './role.constants';

export type RoleKey = 'kepala_klinik' | 'dokter' | 'staf';

export const getRoleKey = (roleName?: string): RoleKey | null => {
  if (!roleName) return null;
  
  const normalized = roleName.toLowerCase();
  if (normalized.includes('kepala')) return 'kepala_klinik';
  if (normalized.includes('dokter')) return 'dokter';
  if (normalized.includes('staf')) return 'staf';
  
  return 'staf';
};

export const NAV_ITEMS = [
  { title: "Dashboard", url: PROTECTED_ROUTES[0], icon: LayoutDashboard, roles: [ROLES.KEPALA_KLINIK, ROLES.DOKTER, ROLES.STAF] },
  { title: "Jadwal & Antrean", url: PROTECTED_ROUTES[1], icon: CalendarClock, roles: [ROLES.STAF, ROLES.DOKTER, ROLES.KEPALA_KLINIK] },
  { title: "Pendaftaran Pasien", url: PROTECTED_ROUTES[2], icon: UserPlus, roles: [ROLES.STAF, ROLES.KEPALA_KLINIK] },
  { title: "Rekam Medis", url: PROTECTED_ROUTES[3], icon: Stethoscope, roles: [ROLES.DOKTER, ROLES.KEPALA_KLINIK] },
  { title: "Manajemen User", url: PROTECTED_ROUTES[4], icon: Users, roles: [ROLES.KEPALA_KLINIK] },
  { title: "Laporan", url: PROTECTED_ROUTES[5], icon: BarChart3, roles: [ROLES.KEPALA_KLINIK] },
  { title: "Pembayaran", url: PROTECTED_ROUTES[6], icon: ReceiptText, roles: [ROLES.STAF, ROLES.KEPALA_KLINIK] },
  { title: "Profil", url: PROTECTED_ROUTES[7], icon: Settings, roles: [ROLES.KEPALA_KLINIK, ROLES.DOKTER, ROLES.STAF] }, // Profile biasanya Settings-like icon
  { title: "Pengaturan", url: PROTECTED_ROUTES[8], icon: Settings, roles: [ROLES.KEPALA_KLINIK] },
  { title: "Pelayanan", url: PROTECTED_ROUTES[9], icon: HeartPulse, roles: [ROLES.KEPALA_KLINIK, ROLES.STAF] },
];