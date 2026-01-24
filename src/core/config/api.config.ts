export const API_CONFIG = {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
} as const;