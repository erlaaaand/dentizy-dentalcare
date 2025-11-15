/**
 * User Roles Configuration
 */
export const ROLES = {
    KEPALA_KLINIK: 'kepala_klinik',
    DOKTER: 'dokter',
    STAF: 'staf'
} as const;

export const ROLE_LABELS = {
    [ROLES.KEPALA_KLINIK]: 'Kepala Klinik',
    [ROLES.DOKTER]: 'Dokter',
    [ROLES.STAF]: 'Staf'
} as const;

export const ROLE_PERMISSIONS = {
    [ROLES.KEPALA_KLINIK]: {
        label: 'Kepala Klinik',
        description: 'Akses penuh ke semua fitur',
        color: 'purple',
        priority: 1
    },
    [ROLES.DOKTER]: {
        label: 'Dokter',
        description: 'Akses ke janji temu dan rekam medis',
        color: 'blue',
        priority: 2
    },
    [ROLES.STAF]: {
        label: 'Staf',
        description: 'Akses ke pendaftaran dan jadwal',
        color: 'green',
        priority: 3
    }
} as const;