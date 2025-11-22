import { ROUTES } from '../constants/routes.constants';

export const AUTH_CONFIG = {
  // Routes
  LOGIN_PATH: ROUTES.LOGIN,
  DASHBOARD_PATH: ROUTES.DASHBOARD,
  
  // Token
  TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  
  // Session
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  REFRESH_BEFORE_EXPIRE: 5 * 60 * 1000, // 5 minutes
  
  // Password
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBER: true,
  PASSWORD_REQUIRE_SPECIAL: true,
} as const;