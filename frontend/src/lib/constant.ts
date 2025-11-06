// ============================================
// APPLICATION CONFIGURATION
// ============================================

/**
 * Application name and metadata
 */
export const APP_CONFIG = {
    name: 'Dentizy Dentalcare',
    shortName: 'Dentizy',
    description: 'Sistem Informasi Klinik Gigi',
    version: '2.1.0',
    author: 'Dentizy Team',
    website: 'https://dentizy.com'
} as const;

/**
 * API Configuration
 */
export const API_CONFIG = {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
} as const;

/**
 * Authentication Configuration
 */
export const AUTH_CONFIG = {
    tokenKey: 'access_token',
    userKey: 'user',
    tokenExpiryDays: 1,
    refreshBeforeExpiry: 5 * 60 * 1000, // 5 minutes in milliseconds
    requireEmailVerification: false,
    allowRememberMe: true
} as const;

/**
 * Pagination Configuration
 */
export const PAGINATION_CONFIG = {
    defaultPage: 1,
    defaultLimit: 10,
    limitOptions: [5, 10, 25, 50, 100],
    maxLimit: 100
} as const;

/**
 * Date & Time Configuration
 */
export const DATETIME_CONFIG = {
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'dd/MM/yyyy HH:mm',
    locale: 'id-ID',
    timezone: 'Asia/Jakarta',
    workingHours: {
        start: '08:00',
        end: '16:30',
        interval: 30 // minutes
    }
} as const;

/**
 * File Upload Configuration
 */
export const UPLOAD_CONFIG = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: {
        images: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
        documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        all: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'application/pdf', 'application/msword']
    },
    allowedExtensions: {
        images: ['.jpg', '.jpeg', '.png', '.gif'],
        documents: ['.pdf', '.doc', '.docx'],
        all: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx']
    }
} as const;

/**
 * Validation Rules
 */
export const VALIDATION_RULES = {
    password: {
        minLength: 8,
        maxLength: 50,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false
    },
    username: {
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_]+$/
    },
    phone: {
        minLength: 10,
        maxLength: 15,
        pattern: /^(\+62|62|0)[0-9]{9,12}$/
    },
    nik: {
        length: 16,
        pattern: /^\d{16}$/
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
    toastDuration: 5000, // 5 seconds
    modalAnimationDuration: 300, // milliseconds
    debounceDelay: 500, // milliseconds
    searchMinChars: 2,
    maxToastsVisible: 5,
    sidebarWidth: {
        expanded: 256, // 64 * 4 (Tailwind w-64)
        collapsed: 64   // 16 * 4 (Tailwind w-16)
    }
} as const;

/**
 * Status Colors
 */
export const STATUS_COLORS = {
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
    notification: {
        pending: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            border: 'border-yellow-200'
        },
        sent: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-200'
        },
        failed: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-200'
        }
    }
} as const;

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

/**
 * Navigation Configuration
 */
export const NAVIGATION = {
    dashboard: {
        path: '/dashboard',
        label: 'Dashboard',
        roles: [ROLES.KEPALA_KLINIK, ROLES.DOKTER, ROLES.STAF]
    },
    appointments: {
        path: '/dashboard/appointments',
        label: 'Jadwal Janji Temu',
        roles: [ROLES.KEPALA_KLINIK, ROLES.DOKTER, ROLES.STAF]
    },
    patients: {
        path: '/dashboard/patients',
        label: 'Manajemen Pasien',
        roles: [ROLES.KEPALA_KLINIK, ROLES.DOKTER, ROLES.STAF]
    },
    medicalRecords: {
        path: '/dashboard/medical-records',
        label: 'Rekam Medis',
        roles: [ROLES.KEPALA_KLINIK, ROLES.DOKTER, ROLES.STAF]
    },
    reports: {
        path: '/dashboard/reports',
        label: 'Laporan',
        roles: [ROLES.KEPALA_KLINIK, ROLES.DOKTER]
    },
    settings: {
        path: '/dashboard/settings',
        label: 'Pengaturan',
        roles: [ROLES.KEPALA_KLINIK]
    }
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
    network: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
    unauthorized: 'Sesi Anda telah berakhir. Silakan login kembali.',
    forbidden: 'Anda tidak memiliki akses untuk melakukan operasi ini.',
    notFound: 'Data tidak ditemukan.',
    serverError: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
    validationError: 'Data yang Anda masukkan tidak valid.',
    conflict: 'Data sudah ada dalam sistem.',
    timeout: 'Permintaan timeout. Silakan coba lagi.',
    unknown: 'Terjadi kesalahan. Silakan coba lagi.'
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
    login: 'Login berhasil! Selamat datang kembali.',
    logout: 'Logout berhasil. Sampai jumpa!',
    create: 'Data berhasil dibuat.',
    update: 'Data berhasil diperbarui.',
    delete: 'Data berhasil dihapus.',
    save: 'Perubahan berhasil disimpan.',
    cancel: 'Operasi berhasil dibatalkan.',
    complete: 'Operasi berhasil diselesaikan.',
    upload: 'File berhasil diunggah.',
    download: 'File berhasil diunduh.'
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

/**
 * Gender Options
 */
export const GENDER = {
    MALE: 'L',
    FEMALE: 'P'
} as const;

export const GENDER_LABELS = {
    [GENDER.MALE]: 'Laki-laki',
    [GENDER.FEMALE]: 'Perempuan'
} as const;

/**
 * Notification Types
 */
export const NOTIFICATION_TYPES = {
    EMAIL: 'email_reminder',
    SMS: 'sms_reminder',
    WHATSAPP: 'whatsapp_confirmation'
} as const;

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
    user: 'user',
    theme: 'theme',
    language: 'language',
    sidebarCollapsed: 'sidebar_collapsed',
    recentSearches: 'recent_searches',
    preferences: 'user_preferences'
} as const;

/**
 * Query Keys for React Query (if implemented)
 */
export const QUERY_KEYS = {
    appointments: 'appointments',
    patients: 'patients',
    users: 'users',
    medicalRecords: 'medical-records',
    notifications: 'notifications',
    reports: 'reports',
    profile: 'profile'
} as const;

/**
 * Regular Expressions
 */
export const REGEX = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^(\+62|62|0)[0-9]{9,12}$/,
    nik: /^\d{16}$/,
    username: /^[a-zA-Z0-9_]+$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    numeric: /^\d+$/,
    alphabetic: /^[a-zA-Z]+$/,
    url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
} as const;

/**
 * Feature Flags
 */
export const FEATURES = {
    enableNotifications: true,
    enableWhatsAppReminder: true,
    enableEmailReminder: true,
    enableSMSReminder: false,
    enableOnlineRegistration: true,
    enableReports: true,
    enableUserManagement: true,
    enableAuditLog: false,
    enableBackup: false
} as const;

/**
 * Environment Information
 */
export const ENV = {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL
} as const;

/**
 * Type exports for TypeScript
 */
export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];
export type Gender = typeof GENDER[keyof typeof GENDER];
export type UserRole = typeof ROLES[keyof typeof ROLES];
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];