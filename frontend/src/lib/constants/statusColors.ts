import { AppointmentStatus } from '@/types/api';

// Status color mappings for consistent UI

export interface StatusColorConfig {
  bg: string;
  text: string;
  border: string;
  badge: string;
}

// Appointment status colors
export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, StatusColorConfig> = {
  [AppointmentStatus.DIJADWALKAN]: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
  },
  [AppointmentStatus.SELESAI]: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-800',
  },
  [AppointmentStatus.DIBATALKAN]: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
  },
};

// Alert/notification types
export const ALERT_COLORS = {
  success: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: 'text-green-400',
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: 'text-red-400',
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: 'text-yellow-400',
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: 'text-blue-400',
  },
} as const;

// Button variants
export const BUTTON_VARIANTS = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
  ghost: 'hover:bg-gray-100 text-gray-700',
} as const;

// Badge variants
export const BADGE_VARIANTS = {
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-indigo-100 text-indigo-800',
} as const;

// Get status color config
export function getAppointmentStatusColor(status: AppointmentStatus): StatusColorConfig {
  return APPOINTMENT_STATUS_COLORS[status] || APPOINTMENT_STATUS_COLORS[AppointmentStatus.DIJADWALKAN];
}

// Get alert color config
export function getAlertColor(type: keyof typeof ALERT_COLORS) {
  return ALERT_COLORS[type] || ALERT_COLORS.info;
}