export const ROLES = {
  KEPALA_KLINIK: 'kepala_klinik',
  DOKTER: 'dokter',
  STAF: 'staf',
} as const;

export const ROLE_LABELS = {
  [ROLES.KEPALA_KLINIK]: 'Kepala Klinik',
  [ROLES.DOKTER]: 'Dokter',
  [ROLES.STAF]: 'Staf',
} as const;

export const ROLE_DESCRIPTIONS = {
  [ROLES.KEPALA_KLINIK]: 'Akses penuh ke seluruh sistem',
  [ROLES.DOKTER]: 'Mengelola pasien dan rekam medis',
  [ROLES.STAF]: 'Mengelola jadwal dan data pasien',
} as const;