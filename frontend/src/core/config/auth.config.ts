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