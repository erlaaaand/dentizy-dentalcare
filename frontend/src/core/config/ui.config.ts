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