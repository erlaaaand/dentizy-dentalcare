// Application-wide constants

// Application info
export const APP_CONFIG = {
    NAME: 'Sistem Manajemen Klinik',
    VERSION: '1.0.0',
    DESCRIPTION: 'Sistem manajemen klinik untuk mengelola janji temu, pasien, dan rekam medis',
} as const;

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
    MAX_PAGE_SIZE: 100,
} as const;

// Date/Time formats
export const DATE_FORMATS = {
    DISPLAY: 'DD MMMM YYYY',
    INPUT: 'YYYY-MM-DD',
    TIME: 'HH:mm',
    DATETIME: 'DD MMMM YYYY HH:mm',
    SHORT_DATE: 'DD/MM/YYYY',
    MONTH_YEAR: 'MMMM YYYY',
    FULL_DATETIME: 'DD MMMM YYYY HH:mm:ss',
} as const;

// API configuration
export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'clinic_access_token',
    REFRESH_TOKEN: 'clinic_refresh_token',
    USER: 'clinic_user',
    THEME: 'clinic_theme',
    LANGUAGE: 'clinic_language',
    SIDEBAR_COLLAPSED: 'clinic_sidebar_collapsed',
} as const;

// Session Storage Keys
export const SESSION_KEYS = {
    REDIRECT_URL: 'redirect_url',
    FORM_DATA: 'form_data',
} as const;

// Appointment statuses
export const APPOINTMENT_STATUS = {
    DIJADWALKAN: 'dijadwalkan',
    SELESAI: 'selesai',
    DIBATALKAN: 'dibatalkan',
} as const;

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
    dijadwalkan: 'Dijadwalkan',
    selesai: 'Selesai',
    dibatalkan: 'Dibatalkan',
} as const;

// User Roles
export const USER_ROLES = {
    DOKTER: 'dokter',
    STAF: 'staf',
    KEPALA_KLINIK: 'kepala_klinik',
} as const;

export const USER_ROLE_LABELS: Record<string, string> = {
    dokter: 'Dokter',
    staf: 'Staf',
    kepala_klinik: 'Kepala Klinik',
} as const;

// Gender options
export const GENDER = {
    MALE: 'L',
    FEMALE: 'P',
} as const;

export const GENDER_OPTIONS = [
    { value: GENDER.MALE, label: 'Laki-laki' },
    { value: GENDER.FEMALE, label: 'Perempuan' },
] as const;

export const GENDER_LABELS: Record<string, string> = {
    [GENDER.MALE]: 'Laki-laki',
    [GENDER.FEMALE]: 'Perempuan',
} as const;

// Clinic working hours
export const CLINIC_HOURS = {
    START: '08:00',
    END: '17:00',
    LUNCH_START: '12:00',
    LUNCH_END: '13:00',
    APPOINTMENT_DURATION: 30, // minutes
    SLOT_INTERVAL: 30, // minutes
} as const;

// Working days
export const WORKING_DAYS = [1, 2, 3, 4, 5, 6] as const; // Monday to Saturday

// Validation rules
export const VALIDATION_RULES = {
    PASSWORD: {
        MIN_LENGTH: 6,
        MAX_LENGTH: 50,
        PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
        MESSAGE: 'Password minimal 6 karakter, mengandung huruf besar, huruf kecil, dan angka',
    },
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 50,
        PATTERN: /^[a-zA-Z0-9_]+$/,
        MESSAGE: 'Username minimal 3 karakter, hanya huruf, angka, dan underscore',
    },
    PHONE: {
        PATTERN: /^(\+62|62|0)[0-9]{9,12}$/,
        MESSAGE: 'Nomor telepon tidak valid (contoh: 08123456789 atau +628123456789)',
    },
    NIK: {
        LENGTH: 16,
        PATTERN: /^[0-9]{16}$/,
        MESSAGE: 'NIK harus 16 digit angka',
    },
    EMAIL: {
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        MESSAGE: 'Email tidak valid',
    },
    NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 100,
        PATTERN: /^[a-zA-Z\s.,'-]+$/,
        MESSAGE: 'Nama tidak valid',
    },
} as const;

// File upload configuration
export const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_SIZE_MB: 5,
    ALLOWED_TYPES: {
        IMAGES: ['image/jpeg', 'image/png', 'image/jpg'],
        DOCUMENTS: ['application/pdf'],
        ALL: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    },
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf'],
} as const;

// Toast/Notification duration
export const NOTIFICATION = {
    DURATION: {
        SUCCESS: 3000,
        ERROR: 5000,
        WARNING: 4000,
        INFO: 3000,
    },
    POSITION: 'top-right',
} as const;

// Debounce delays
export const DEBOUNCE_DELAY = {
    SEARCH: 500, // 500ms
    INPUT: 300, // 300ms
    RESIZE: 200, // 200ms
} as const;

// Report date ranges
export const REPORT_DATE_RANGES = [
    { value: 'today', label: 'Hari Ini' },
    { value: '7', label: '7 Hari Terakhir' },
    { value: '30', label: '30 Hari Terakhir' },
    { value: '90', label: '90 Hari Terakhir' },
    { value: 'this_month', label: 'Bulan Ini' },
    { value: 'last_month', label: 'Bulan Lalu' },
    { value: 'custom', label: 'Custom' },
] as const;

// Chart configuration
export const CHART_CONFIG = {
    COLORS: {
        PRIMARY: '#3B82F6',
        SUCCESS: '#10B981',
        WARNING: '#F59E0B',
        DANGER: '#EF4444',
        INFO: '#6366F1',
        SECONDARY: '#6B7280',
    },
    PALETTE: [
        '#3B82F6', // Blue
        '#10B981', // Green
        '#F59E0B', // Orange
        '#EF4444', // Red
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#06B6D4', // Cyan
        '#84CC16', // Lime
    ],
    ANIMATION: {
        DURATION: 750,
        EASING: 'easeInOut',
    },
} as const;

// Table configuration
export const TABLE_CONFIG = {
    DEFAULT_SORT_ORDER: 'desc' as const,
    EMPTY_MESSAGE: 'Tidak ada data',
    LOADING_MESSAGE: 'Memuat data...',
    ERROR_MESSAGE: 'Terjadi kesalahan saat memuat data',
} as const;

// Regex patterns
export const REGEX_PATTERNS = {
    PHONE: VALIDATION_RULES.PHONE.PATTERN,
    NIK: VALIDATION_RULES.NIK.PATTERN,
    EMAIL: VALIDATION_RULES.EMAIL.PATTERN,
    NAME: VALIDATION_RULES.NAME.PATTERN,
    USERNAME: VALIDATION_RULES.USERNAME.PATTERN,
    NUMBERS_ONLY: /^[0-9]+$/,
    LETTERS_ONLY: /^[a-zA-Z\s]+$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
} as const;

// Error messages
export const ERROR_MESSAGES = {
    NETWORK: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
    UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
    FORBIDDEN: 'Anda tidak memiliki akses ke halaman ini.',
    NOT_FOUND: 'Data tidak ditemukan.',
    SERVER_ERROR: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
    VALIDATION: 'Data yang Anda masukkan tidak valid.',
    REQUIRED_FIELD: 'Field ini wajib diisi.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
    CREATE: 'Data berhasil ditambahkan.',
    UPDATE: 'Data berhasil diperbarui.',
    DELETE: 'Data berhasil dihapus.',
    LOGIN: 'Login berhasil. Selamat datang!',
    LOGOUT: 'Logout berhasil.',
    PASSWORD_CHANGED: 'Password berhasil diubah.',
} as const;