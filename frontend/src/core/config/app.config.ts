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
 * Environment Information
 */
export const ENV = {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL
} as const;