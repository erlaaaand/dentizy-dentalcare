// Application-wide constants untuk Sistem Manajemen Klinik Gigi

export const APP_NAME = 'Sistem Manajemen Klinik Gigi';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Sistem informasi manajemen klinik gigi untuk mengelola pasien, janji temu, dan rekam medis';

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
  ACCESS_TOKEN: 'dental_clinic_access_token',
  REFRESH_TOKEN: 'dental_clinic_refresh_token',
  USER: 'dental_clinic_user',
  THEME: 'dental_clinic_theme',
  LANGUAGE: 'dental_clinic_language',
} as const;

// Appointment Statuses (Status Janji Temu)
export const APPOINTMENT_STATUSES = {
  DIJADWALKAN: 'dijadwalkan',
  SELESAI: 'selesai',
  DIBATALKAN: 'dibatalkan',
  SEDANG_BERLANGSUNG: 'sedang_berlangsung',
  TIDAK_HADIR: 'tidak_hadir',
} as const;

export const APPOINTMENT_STATUS_LABELS = {
  dijadwalkan: 'Dijadwalkan',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
  sedang_berlangsung: 'Sedang Berlangsung',
  tidak_hadir: 'Tidak Hadir',
} as const;

// User Roles (Role Pengguna)
export const USER_ROLES = {
  DOKTER: 'dokter',
  STAF: 'staf',
  KEPALA_KLINIK: 'kepala_klinik',
} as const;

export const USER_ROLE_LABELS = {
  dokter: 'Dokter Gigi',
  staf: 'Staf Administrasi',
  kepala_klinik: 'Kepala Klinik',
} as const;

// Gender
export const GENDER_OPTIONS = [
  { value: 'L', label: 'Laki-laki' },
  { value: 'P', label: 'Perempuan' },
] as const;

// Working hours (Jam Kerja Klinik)
export const CLINIC_HOURS = {
  START: '08:00',
  END: '17:00',
  BREAK_START: '12:00',
  BREAK_END: '13:00',
  APPOINTMENT_DURATION: 30, // menit per pasien
} as const;

// Working days (Hari kerja: Senin-Sabtu)
export const WORKING_DAYS = [1, 2, 3, 4, 5, 6] as const; // 1=Senin, 6=Sabtu

// Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  PHONE_PATTERN: /^(\+62|62|0)[0-9]{9,12}$/,
  NIK_LENGTH: 16,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf'],
} as const;

// Toast duration
export const TOAST_DURATION = 5000; // 5 seconds

// Debounce delay for search
export const SEARCH_DEBOUNCE_DELAY = 500; // 500ms

// Report date ranges
export const REPORT_DATE_RANGES = [
  { value: 'today', label: 'Hari Ini' },
  { value: '7', label: '7 Hari Terakhir' },
  { value: '30', label: '30 Hari Terakhir' },
  { value: '90', label: '90 Hari Terakhir' },
  { value: 'this_month', label: 'Bulan Ini' },
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

// ============================================================================
// DENTAL-SPECIFIC CONSTANTS (Khusus untuk Klinik Gigi)
// ============================================================================

// Dental Chart (Peta Gigi)
export const DENTAL_NOTATION = {
  FDI: 'fdi', // FDI World Dental Federation notation
  UNIVERSAL: 'universal', // American system
} as const;

// Gigi Permanen Dewasa (32 gigi) - FDI Notation
export const ADULT_TEETH = {
  UPPER_RIGHT: [18, 17, 16, 15, 14, 13, 12, 11], // Kuadran 1
  UPPER_LEFT: [21, 22, 23, 24, 25, 26, 27, 28], // Kuadran 2
  LOWER_LEFT: [31, 32, 33, 34, 35, 36, 37, 38], // Kuadran 3
  LOWER_RIGHT: [41, 42, 43, 44, 45, 46, 47, 48], // Kuadran 4
} as const;

// Kondisi Gigi
export const TOOTH_CONDITIONS = {
  SEHAT: 'sehat',
  KARIES: 'karies',
  TUMPATAN: 'tumpatan',
  HILANG: 'hilang',
  MAHKOTA: 'mahkota',
  JEMBATAN: 'jembatan',
  IMPLAN: 'implan',
  FRAKTUR: 'fraktur',
  PERLU_PENCABUTAN: 'perlu_pencabutan',
} as const;

export const TOOTH_CONDITION_LABELS = {
  sehat: 'Sehat',
  karies: 'Karies',
  tumpatan: 'Tumpatan',
  hilang: 'Hilang',
  mahkota: 'Mahkota',
  jembatan: 'Jembatan',
  implan: 'Implan',
  fraktur: 'Fraktur',
  perlu_pencabutan: 'Perlu Pencabutan',
} as const;

// Kategori Tindakan Gigi
export const TREATMENT_CATEGORIES = {
  PREVENTIF: 'preventif',
  RESTORASI: 'restorasi',
  ENDODONTIK: 'endodontik',
  BEDAH_MULUT: 'bedah_mulut',
  PERIODONTAL: 'periodontal',
  PROSTODONTIK: 'prostodontik',
  ORTODONTIK: 'ortodontik',
  ESTETIK: 'estetik',
} as const;

export const TREATMENT_CATEGORY_LABELS = {
  preventif: 'Preventif (Pencegahan)',
  restorasi: 'Restorasi (Penambalan)',
  endodontik: 'Endodontik (Perawatan Saluran Akar)',
  bedah_mulut: 'Bedah Mulut',
  periodontal: 'Periodontal (Perawatan Gusi)',
  prostodontik: 'Prostodontik (Gigi Tiruan)',
  ortodontik: 'Ortodontik (Kawat Gigi)',
  estetik: 'Estetik (Pemutihan)',
} as const;

// Payment methods
export const PAYMENT_METHODS = {
  TUNAI: 'tunai',
  TRANSFER: 'transfer',
  KARTU_DEBIT: 'kartu_debit',
  KARTU_KREDIT: 'kartu_kredit',
  ASURANSI: 'asuransi',
} as const;

export const PAYMENT_METHOD_LABELS = {
  tunai: 'Tunai',
  transfer: 'Transfer Bank',
  kartu_debit: 'Kartu Debit',
  kartu_kredit: 'Kartu Kredit',
  asuransi: 'Asuransi',
} as const;

// Payment status
export const PAYMENT_STATUSES = {
  LUNAS: 'lunas',
  BELUM_LUNAS: 'belum_lunas',
} as const;

export const PAYMENT_STATUS_LABELS = {
  lunas: 'Lunas',
  belum_lunas: 'Belum Lunas',
} as const;

// Tingkat Urgensi
export const URGENCY_LEVELS = {
  RENDAH: 'rendah',
  SEDANG: 'sedang',
  TINGGI: 'tinggi',
  DARURAT: 'darurat',
} as const;

export const URGENCY_LEVEL_LABELS = {
  rendah: 'Rendah',
  sedang: 'Sedang',
  tinggi: 'Tinggi',
  darurat: 'Darurat',
} as const;

// ============================================================================
// RE-EXPORTS from other constant files
// ============================================================================

// API Constants
export {
  API_ENDPOINTS,
  HTTP_METHODS,
  HTTP_STATUS,
  DEFAULT_HEADERS,
  type ApiResponse,
  type PaginatedResponse,
} from './api.constants';

// Permission Constants
export {
  Permission,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsForRoles,
} from './permission.constants';

// Role Constants
export {
  ROLES,
  ROLE_DISPLAY_NAMES,
  ROLE_DESCRIPTIONS,
  ROLE_HIERARCHY,
  normalizeRole,
  normalizeRoles,
  getRoleDisplayName,
  getRoleDescription,
  hasHigherOrEqualAuthority,
  isKepalaKlinik,
  isDokter,
  isStaf,
  canManagePatients,
  canCreateMedicalRecords,
  canViewReports,
  getAllRoles,
  getRoleOptions,
  getAssignableRoles,
  type RoleOption,
} from './role.constants';

// Route Constants
export {
  ROUTES,
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
  NAV_ITEMS,
  isPublicRoute,
  isProtectedRoute,
  getDefaultRouteForRole,
  type NavItem,
} from './routes.constants';

// Status Constants
export {
  APPOINTMENT_STATUS_COLORS,
  ALERT_COLORS,
  BUTTON_VARIANTS,
  BADGE_VARIANTS,
  getAppointmentStatusColor,
  getAlertColor,
  type StatusColorConfig,
} from './status.constants';

// Storage Constants
export {
  StorageType,
  LOCAL_STORAGE_KEYS,
  SESSION_STORAGE_KEYS,
  localStorageManager,
  sessionStorageManager,
  tokenStorage,
  userStorage,
  themeStorage,
  sidebarStorage,
  redirectStorage,
  formStorage,
  dentalChartStorage,
  clearAllStorage,
  clearSessionData,
  isStorageAvailable,
  getStorageInfo,
} from './storage.constants';