export const APPOINTMENT_STATUS = {
  DIJADWALKAN: 'dijadwalkan',
  SELESAI: 'selesai',
  DIBATALKAN: 'dibatalkan',
} as const;

export const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
} as const;

export const NOTIFICATION_TYPE = {
  EMAIL_REMINDER: 'email_reminder',
  SMS_REMINDER: 'sms_reminder',
  WHATSAPP_CONFIRMATION: 'whatsapp_confirmation',
} as const;

export const STATUS_COLORS = {
  [APPOINTMENT_STATUS.DIJADWALKAN]: 'blue',
  [APPOINTMENT_STATUS.SELESAI]: 'green',
  [APPOINTMENT_STATUS.DIBATALKAN]: 'red',
  [NOTIFICATION_STATUS.PENDING]: 'yellow',
  [NOTIFICATION_STATUS.SENT]: 'green',
  [NOTIFICATION_STATUS.FAILED]: 'red',
} as const;

export const STATUS_LABELS = {
  [APPOINTMENT_STATUS.DIJADWALKAN]: 'Dijadwalkan',
  [APPOINTMENT_STATUS.SELESAI]: 'Selesai',
  [APPOINTMENT_STATUS.DIBATALKAN]: 'Dibatalkan',
  [NOTIFICATION_STATUS.PENDING]: 'Menunggu',
  [NOTIFICATION_STATUS.SENT]: 'Terkirim',
  [NOTIFICATION_STATUS.FAILED]: 'Gagal',
} as const;