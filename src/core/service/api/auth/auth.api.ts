import { 
  authControllerLogin,
  authControllerRefresh,
  authControllerVerify,
  authControllerLogout,
  authControllerGetProfile,
  authControllerUpdateMyProfile,
  authControllerForgotPassword,
  authControllerVerifyOTP,
  authControllerResetPassword
} from '../../../api/generated/auth/auth';

import type { 
  LoginDto,
  VerifyTokenDto,
  UpdateProfileDto,
  ForgotPasswordRequestDto,
  VerifyOTPDto,
  ResetPasswordWithTokenDto
} from '../../../types/auth/auth.types';

export const AuthService = {
  /**
   * Login user dengan username dan password
   */
  login: async (data: LoginDto) => {
    const response = await authControllerLogin(data);
    return response;
  },

  /**
   * Refresh access token menggunakan refresh token
   */
  refresh: async () => {
    const response = await authControllerRefresh();
    return response;
  },

  /**
   * Verifikasi validitas token JWT
   */
  verifyToken: async (data: VerifyTokenDto) => {
    const response = await authControllerVerify(data);
    return response;
  },

  /**
   * Logout user dan invalidate token
   */
  logout: async () => {
    const response = await authControllerLogout();
    return response;
  },

  /**
   * Mendapatkan profil user yang sedang login
   */
  getProfile: async () => {
    const response = await authControllerGetProfile();
    return response;
  },

  /**
   * Update profil user yang sedang login
   */
  updateProfile: async (data: UpdateProfileDto) => {
    const response = await authControllerUpdateMyProfile(data);
    return response;
  },

  /**
   * Request OTP untuk reset password
   */
  forgotPassword: async (data: ForgotPasswordRequestDto) => {
    const response = await authControllerForgotPassword(data);
    return response;
  },

  /**
   * Verifikasi OTP dan dapatkan reset token
   */
  verifyOTP: async (data: VerifyOTPDto) => {
    const response = await authControllerVerifyOTP(data);
    return response;
  },

  /**
   * Reset password menggunakan reset token
   */
  resetPassword: async (data: ResetPasswordWithTokenDto) => {
    const response = await authControllerResetPassword(data);
    return response;
  }
};