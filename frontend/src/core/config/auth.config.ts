// frontend/src/core/config/auth.config.ts
import { ROUTES } from '../constants/routes.constants';

export const AUTH_CONFIG = {
    LOGIN_PATH: ROUTES.LOGIN,
    DASHBOARD_PATH: ROUTES.DASHBOARD,
    TOKEN_KEY: 'access_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    USER_KEY: 'user',
    SESSION_TIMEOUT: 30 * 60 * 1000,
    REFRESH_BEFORE_EXPIRE: 5 * 60 * 1000,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIRE_UPPERCASE: true,
    PASSWORD_REQUIRE_LOWERCASE: true,
    PASSWORD_REQUIRE_NUMBER: true,
    PASSWORD_REQUIRE_SPECIAL: false,
} as const;