// frontend/src/core/constants/clinic.constants.ts

/**
 * Clinic Operating Hours Configuration
 */
export const CLINIC_HOURS = {
    // Operating Hours
    START: '08:00',
    END: '17:00',
    BREAK_START: '12:00',
    BREAK_END: '13:00',

    // Appointment Settings
    APPOINTMENT_DURATION: 30, // minutes
    MIN_BOOKING_ADVANCE: 2, // hours
    MAX_BOOKING_ADVANCE: 30, // days

    // Working Days (0 = Sunday, 6 = Saturday)
    // FIX: Cast sebagai 'readonly number[]' agar .includes() menerima tipe number umum
    WORKING_DAYS: [1, 2, 3, 4, 5] as readonly number[],

    // Holiday Dates (akan di-check saat booking)
    // FIX: Cast sebagai 'readonly string[]' agar .includes() menerima tipe string umum
    HOLIDAYS: [
        '2025-01-01', // Tahun Baru
        '2025-12-25', // Natal
        // Tambahkan hari libur lainnya
    ] as readonly string[],
} as const;

/**
 * Appointment Time Slots Configuration
 */
export const TIME_SLOTS = {
    DURATION: CLINIC_HOURS.APPOINTMENT_DURATION,
    SLOTS_PER_DAY: Math.floor(
        (
            (parseInt(CLINIC_HOURS.END) - parseInt(CLINIC_HOURS.START)) * 60 -
            (parseInt(CLINIC_HOURS.BREAK_END) - parseInt(CLINIC_HOURS.BREAK_START)) * 60
        ) / CLINIC_HOURS.APPOINTMENT_DURATION
    ),
} as const;

/**
 * Clinic Contact Information
 */
export const CLINIC_INFO = {
    NAME: 'Dentizy Dental Clinic',
    PHONE: '+62 274 123456',
    EMAIL: 'info@dentizy.com',
    ADDRESS: 'Jl. Contoh No. 123, Yogyakarta',
    WEBSITE: 'https://dentizy.com',
} as const;

/**
 * Helper function to check if clinic is open
 */
export function isClinicOpen(date: Date = new Date()): boolean {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const currentTime = hours * 60 + minutes;

    const [startHour, startMin] = CLINIC_HOURS.START.split(':').map(Number);
    const [endHour, endMin] = CLINIC_HOURS.END.split(':').map(Number);
    const [breakStartHour, breakStartMin] = CLINIC_HOURS.BREAK_START.split(':').map(Number);
    const [breakEndHour, breakEndMin] = CLINIC_HOURS.BREAK_END.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    const breakStart = breakStartHour * 60 + breakStartMin;
    const breakEnd = breakEndHour * 60 + breakEndMin;

    // Check if it's a working day
    const dayOfWeek = date.getDay();

    // Error "Argument of type number..." sekarang sudah hilang
    if (!CLINIC_HOURS.WORKING_DAYS.includes(dayOfWeek)) {
        return false;
    }

    // Check if it's a holiday
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Error "Argument of type string..." sekarang sudah hilang
    if (CLINIC_HOURS.HOLIDAYS.includes(dateStr)) {
        return false;
    }

    // Check if within operating hours and not during break
    return (
        currentTime >= startTime &&
        currentTime < endTime &&
        (currentTime < breakStart || currentTime >= breakEnd)
    );
}

/**
 * Get clinic status message
 */
export function getClinicStatus(): {
    isOpen: boolean;
    message: string;
    nextOpenTime?: string;
} {
    const now = new Date();
    const isOpen = isClinicOpen(now);

    if (isOpen) {
        return {
            isOpen: true,
            message: 'Klinik Buka',
        };
    }

    // Determine when clinic opens next
    const hours = now.getHours();
    const dayOfWeek = now.getDay();
    const startHour = parseInt(CLINIC_HOURS.START.split(':')[0]);
    const breakStartHour = parseInt(CLINIC_HOURS.BREAK_START.split(':')[0]);

    // If it's weekend
    if (!CLINIC_HOURS.WORKING_DAYS.includes(dayOfWeek)) {
        return {
            isOpen: false,
            message: 'Klinik Tutup (Akhir Pekan)',
            nextOpenTime: 'Senin ' + CLINIC_HOURS.START,
        };
    }

    // If before opening
    if (hours < startHour) {
        return {
            isOpen: false,
            message: 'Klinik Belum Buka',
            nextOpenTime: 'Hari ini ' + CLINIC_HOURS.START,
        };
    }

    // If during break
    if (hours === breakStartHour) {
        return {
            isOpen: false,
            message: 'Istirahat',
            nextOpenTime: 'Hari ini ' + CLINIC_HOURS.BREAK_END,
        };
    }

    // If after closing
    return {
        isOpen: false,
        message: 'Klinik Tutup',
        nextOpenTime: 'Besok ' + CLINIC_HOURS.START,
    };
}