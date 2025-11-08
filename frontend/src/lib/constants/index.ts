// Application-wide constants

export const APP_NAME = 'Sistem Manajemen Klinik';
export const APP_VERSION = '1.0.0';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Date/Time formats
export const DATE_FORMAT = 'DD MMMM YYYY';
export const DATE_INPUT_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'DD MMMM YYYY HH:mm';

// API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const API_TIMEOUT = 30000; // 30 seconds

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Appointment
export const APPOINTMENT_STATUSES = {
  DIJADWALKAN: 'dijadwalkan',
  SELESAI: 'selesai',
  DIBATALKAN: 'dibatalkan',
} as const;

export const APPOINTMENT_STATUS_LABELS = {
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

export const USER_ROLE_LABELS = {
  dokter: 'Dokter',
  staf: 'Staf',
  kepala_klinik: 'Kepala Klinik',
} as const;

// Gender
export const GENDER_OPTIONS = [
  { value: 'L', label: 'Laki-laki' },
  { value: 'P', label: 'Perempuan' },
] as const;

// Working hours
export const CLINIC_HOURS = {
  START: '08:00',
  END: '17:00',
  APPOINTMENT_DURATION: 30, // minutes
} as const;

// Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  PHONE_PATTERN: /^(\+62|62|0)[0-9]{9,12}$/,
  NIK_LENGTH: 16,
} as const;

// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
} as const;

// Toast duration
export const TOAST_DURATION = 5000; // 5 seconds

// Debounce delay for search
export const SEARCH_DEBOUNCE_DELAY = 500; // 500ms

// Report date ranges
export const REPORT_DATE_RANGES = [
  { value: '7', label: '7 Hari Terakhir' },
  { value: '30', label: '30 Hari Terakhir' },
  { value: '90', label: '90 Hari Terakhir' },
  { value: 'custom', label: 'Custom' },
] as const;

// Chart colors
export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#6366F1',
  SECONDARY: '#6B7280',
} as const;

export const CHART_COLOR_PALETTE = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
] as const;