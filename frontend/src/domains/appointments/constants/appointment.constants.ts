export const STATUS_COLORS_APPOINTMENTS = {
    appointment: {
        dijadwalkan: {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            border: 'border-blue-200'
        },
        selesai: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-200'
        },
        dibatalkan: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-200'
        }
    },
} as const;

/**
 * Appointment Status
 */
export const APPOINTMENT_STATUS = {
    DIJADWALKAN: 'dijadwalkan',
    SELESAI: 'selesai',
    DIBATALKAN: 'dibatalkan'
} as const;

export const APPOINTMENT_STATUS_LABELS = {
    [APPOINTMENT_STATUS.DIJADWALKAN]: 'Dijadwalkan',
    [APPOINTMENT_STATUS.SELESAI]: 'Selesai',
    [APPOINTMENT_STATUS.DIBATALKAN]: 'Dibatalkan'
} as const;