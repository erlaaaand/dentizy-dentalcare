// frontend/src/core/config/app.config.ts
export const APP_CONFIG = {
    name: 'Dentizy Dentalcare',
    shortName: 'Dentizy',
    description: 'Sistem Informasi Klinik Gigi',
    version: '2.1.0',
    author: 'Dentizy Team',
    website: 'https://dentizy.com'
} as const;

export const ENV = {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL
} as const;

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
    MAX_PAGE_SIZE: 100,
} as const;

export const DEBOUNCE_DELAY = 500;