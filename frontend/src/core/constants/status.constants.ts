// frontend/src/core/constants/status.constants.ts
export const APPOINTMENT_STATUS = {
    DIJADWALKAN: 'dijadwalkan',
    SELESAI: 'selesai',
    DIBATALKAN: 'dibatalkan',
} as const;

export const STATUS_LABELS = {
    [APPOINTMENT_STATUS.DIJADWALKAN]: 'Dijadwalkan',
    [APPOINTMENT_STATUS.SELESAI]: 'Selesai',
    [APPOINTMENT_STATUS.DIBATALKAN]: 'Dibatalkan',
} as const;

export const STATUS_COLORS = {
    [APPOINTMENT_STATUS.DIJADWALKAN]: 'blue',
    [APPOINTMENT_STATUS.SELESAI]: 'green',
    [APPOINTMENT_STATUS.DIBATALKAN]: 'red',
} as const;

export const GENDER = {
    MALE: 'L',
    FEMALE: 'P',
} as const;

export const GENDER_LABELS = {
    [GENDER.MALE]: 'Laki-laki',
    [GENDER.FEMALE]: 'Perempuan',
} as const;