export { authService, AuthService } from './auth.api';
export { authTokenManager, AuthTokenManager } from './helpers/token.manager';
export { authHelpers, AuthHelpers } from './helpers/auth.helpers';
export { authCacheManager, AuthCacheManager } from './cache/cache.manager';

export {
  useAuthControllerLogin,
  useAuthControllerRefresh,
  useAuthControllerVerify,
  useAuthControllerLogout,
  useAuthControllerGetProfile,
  useAuthControllerUpdateMyProfile,
  useAuthControllerForgotPassword,
  useAuthControllerVerifyOTP,
  useAuthControllerResetPassword,
  getAuthControllerGetProfileQueryKey
} from '../../../api/generated/auth/auth';

export type {
  LoginDto,
  VerifyTokenDto,
  UpdateProfileDto,
  ForgotPasswordRequestDto,
  VerifyOTPDto,
  ResetPasswordWithTokenDto,
  UserResponseDto,
  LoginResponseDto,
  VerifyOTPResponseDto
} from '../../../types/auth/auth.types';