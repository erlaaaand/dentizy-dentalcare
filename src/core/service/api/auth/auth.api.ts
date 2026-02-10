import { BaseService } from '../../base/base.service';
import { 
  authControllerLogin,
  authControllerRefresh,
  authControllerVerify,
  authControllerLogout,
  authControllerGetProfile,
  authControllerUpdateMyProfile,
  authControllerForgotPassword,
  authControllerVerifyOTP,
  authControllerResetPassword,
} from '../../../api/generated/auth/auth';

import type { 
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

/**
 * Auth Service
 * Handles all authentication-related API calls
 * Extends BaseService for common query operations
 */
export class AuthService extends BaseService {
  /**
   * Login user
   */
  async login(data: LoginDto): Promise<LoginResponseDto> {
    const response = await authControllerLogin(data);
    
    if (response.status === 200) {
      const responseData = response as unknown as { 
        access_token?: string;
        accessToken?: string;
        token?: string;
        data?: {
          access_token?: string;
          accessToken?: string;
          token?: string;
        }
      };
      
      // Extract token from various possible locations
      const token = responseData.access_token || 
                   responseData.accessToken || 
                   responseData.token ||
                   responseData.data?.access_token ||
                   responseData.data?.accessToken ||
                   responseData.data?.token;
      
      if (!token) {
        throw new Error('Token not found in response');
      }
      
      return response as unknown as LoginResponseDto;
    }
    
    throw new Error('Login failed');
  }

  /**
   * Refresh access token
   */
  async refresh(): Promise<{ access_token: string }> {
    const response = await authControllerRefresh();
    
    if (response.status === 200) {
      return response as unknown as { access_token: string };
    }
    
    throw new Error('Failed to refresh token');
  }

  /**
   * Verify token
   */
  async verify(data: VerifyTokenDto): Promise<{ valid: boolean }> {
    const response = await authControllerVerify(data);
    
    if (response.status === 200) {
      return response as unknown as { valid: boolean };
    }
    
    throw new Error('Token verification failed');
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const response = await authControllerLogout();
    
    if (response.status !== 200) {
      throw new Error('Logout failed');
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<UserResponseDto> {
    const response = await authControllerGetProfile();
    return response.data as UserResponseDto;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileDto): Promise<UserResponseDto> {
    const response = await authControllerUpdateMyProfile(data);
    
    if (response.status === 200) {
      return response.data as UserResponseDto;
    }
    
    throw new Error('Failed to update profile');
  }

  /**
   * Send forgot password email
   */
  async forgotPassword(data: ForgotPasswordRequestDto): Promise<{ message: string }> {
    const response = await authControllerForgotPassword(data);
    
    if (response.status === 200) {
      return response.data as { message: string };
    }
    
    throw new Error('Failed to send reset email');
  }

  /**
   * Verify OTP
   */
  async verifyOTP(data: VerifyOTPDto): Promise<VerifyOTPResponseDto> {
    const response = await authControllerVerifyOTP(data);
    
    if (response.status === 201) {
      return response.data as VerifyOTPResponseDto;
    }
    
    throw new Error('OTP verification failed');
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordWithTokenDto): Promise<{ message: string }> {
    const response = await authControllerResetPassword(data);
    
    if (response.status === 200) {
      return response.data as { message: string };
    }
    
    throw new Error('Password reset failed');
  }
}

export const authService = new AuthService();