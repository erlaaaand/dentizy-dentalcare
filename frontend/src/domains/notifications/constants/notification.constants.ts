export const STATUS_COLORS_NOTIFICATIONS = {
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
 * Notification Types
 */
export const NOTIFICATION_TYPES = {
    EMAIL: 'email_reminder',
    SMS: 'sms_reminder',
    WHATSAPP: 'whatsapp_confirmation'
} as const;