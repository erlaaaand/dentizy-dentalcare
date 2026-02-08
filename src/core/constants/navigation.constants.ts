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

import { PROTECTED_ROUTES} from "./routes.constants";

// 1. Definisikan Role Key yang konsisten dengan Middleware Anda
export type RoleKey = 'kepala_klinik' | 'dokter' | 'staf';

// 2. Helper untuk Normalisasi Role dari Backend
export const getRoleKey = (roleName?: string): RoleKey | null => {
  if (!roleName) return null;
  
  const normalized = roleName.toLowerCase();
  if (normalized.includes('kepala')) return 'kepala_klinik';
  if (normalized.includes('dokter')) return 'dokter';
  if (normalized.includes('staf')) return 'staf';
  
  return 'staf';
};

// 3. Konfigurasi Menu Navigasi (Sesuai UI Anda)
export const NAV_ITEMS = [
  {
    title: "Dashboard",
    url: PROTECTED_ROUTES[0],
    icon: LayoutDashboard,
    isActive: true,
    roles: ['kepala_klinik', 'dokter', 'staf'],
  },
  {
    title: "Manajemen User",
    url: PROTECTED_ROUTES[4],
    icon: Users,
    roles: ['kepala_klinik'],
  },
  {
    title: "Pendaftaran Pasien",
    url: PROTECTED_ROUTES[2],
    icon: UserPlus,
    roles: ['staf', 'kepala_klinik'],
  },
  {
    title: "Rekam Medis",
    url: PROTECTED_ROUTES[3],
    icon: Stethoscope,
    roles: ['dokter', 'kepala_klinik'],
  },
  {
    title: "Jadwal & Antrean",
    url: PROTECTED_ROUTES[1],
    icon: CalendarClock,
    roles: ['staf', 'dokter', 'kepala_klinik'],
  },
  {
    title: "Pembayaran",
    url: PROTECTED_ROUTES[6],
    icon: ReceiptText,
    roles: ['staf', 'kepala_klinik'],
  },
  {
    title: "Pelayanan",
    url: PROTECTED_ROUTES[8],
    icon: HeartPulse,
    roles: ['kepala_klinik', 'staf']
  },
  {
    title: "Laporan",
    url: PROTECTED_ROUTES[5],
    icon: BarChart3,
    roles: ['kepala_klinik'],
  },
  {
    title: "Pengaturan",
    url: PROTECTED_ROUTES[7],
    icon: Settings,
    roles: ['kepala_klinik'],
  },
];