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
  getAuthControllerGetProfileQueryKey
} from '../../../api/generated/auth/auth';

import type { QueryClient } from '@tanstack/react-query';
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

// Re-export hooks
export {
  useAuthControllerLogin,
  useAuthControllerRefresh,
  useAuthControllerVerify,
  useAuthControllerLogout,
  useAuthControllerGetProfile,
  useAuthControllerUpdateMyProfile,
  useAuthControllerForgotPassword,
  useAuthControllerVerifyOTP,
  useAuthControllerResetPassword
} from '../../../api/generated/auth/auth';

// Re-export query keys
export {
  getAuthControllerGetProfileQueryKey
} from '../../../api/generated/auth/auth';

class AuthService extends BaseService {
  // ==================== MUTATIONS ====================
  
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

  async refresh(): Promise<{ access_token: string }> {
    const response = await authControllerRefresh();
    
    if (response.status === 200) {
      return response as unknown as { access_token: string };
    }
    
    throw new Error('Failed to refresh token');
  }

  async verify(data: VerifyTokenDto): Promise<{ valid: boolean }> {
    const response = await authControllerVerify(data);
    
    if (response.status === 200) {
      return response as unknown as { valid: boolean };
    }
    
    throw new Error('Token verification failed');
  }

  async logout(): Promise<void> {
    const response = await authControllerLogout();
    
    if (response.status !== 200) {
      throw new Error('Logout failed');
    }
  }

  async getProfile(): Promise<UserResponseDto> {
    const response = await authControllerGetProfile();
    return response.data as UserResponseDto;
  }

  async updateProfile(data: UpdateProfileDto): Promise<UserResponseDto> {
    const response = await authControllerUpdateMyProfile(data);
    
    if (response.status === 200) {
      return response.data as UserResponseDto;
    }
    
    throw new Error('Failed to update profile');
  }

  async forgotPassword(data: ForgotPasswordRequestDto): Promise<{ message: string }> {
    const response = await authControllerForgotPassword(data);
    
    if (response.status === 200) {
      return response.data as { message: string };
    }
    
    throw new Error('Failed to send reset email');
  }

  async verifyOTP(data: VerifyOTPDto): Promise<VerifyOTPResponseDto> {
    const response = await authControllerVerifyOTP(data);
    
    if (response.status === 201) {
      return response.data as VerifyOTPResponseDto;
    }
    
    throw new Error('OTP verification failed');
  }

  async resetPassword(data: ResetPasswordWithTokenDto): Promise<{ message: string }> {
    const response = await authControllerResetPassword(data);
    
    if (response.status === 200) {
      return response.data as { message: string };
    }
    
    throw new Error('Password reset failed');
  }

  // ==================== QUERY KEYS ====================
  
  getProfileQueryKey() {
    return getAuthControllerGetProfileQueryKey();
  }

  // ==================== CACHE UTILITIES ====================
  
  invalidateProfile(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, this.getProfileQueryKey());
  }

  invalidateAll(queryClient: QueryClient) {
    return this.invalidateQueries(queryClient, ['/auth'] as const);
  }

  async prefetchProfile(queryClient: QueryClient) {
    return this.prefetchQuery(
      queryClient,
      this.getProfileQueryKey(),
      () => this.getProfile()
    );
  }

  optimisticUpdateProfile(
    queryClient: QueryClient,
    updater: (old: UserResponseDto) => UserResponseDto
  ) {
    const queryKey = this.getProfileQueryKey();
    const previousData = this.getQueryData<UserResponseDto>(queryClient, queryKey);
    
    if (previousData) {
      this.setQueryData(queryClient, queryKey, updater(previousData));
    }
    
    return previousData;
  }

  // ==================== TOKEN MANAGEMENT ====================
  
  setTokenInCookie(token: string): void {
    if (typeof document === 'undefined') return;
    
    const isSecure = window.location.protocol === 'https:';
    const cookieString = `access_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax${isSecure ? '; Secure' : ''}`;
    document.cookie = cookieString;
  }

  getTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
    
    if (!tokenCookie) return null;
    
    const token = tokenCookie.split('=')[1];
    return token ? decodeURIComponent(token.trim()) : null;
  }

  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('refresh_token', token);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  clearAuthData(): void {
    if (typeof document !== 'undefined') {
      document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('access_token');
    }
  }

  isTokenExpired(token: string): boolean {
    return authHelpers.isTokenExpired(token);
  }
  
}

export const authService = new AuthService();

// Helper functions
export const authHelpers = {
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!authService.getTokenFromCookie();
  },

  /**
   * Decode JWT token (client-side only, for display purposes)
   */
  decodeToken(token: string): { exp: number; sub: string } | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return true;
    
    const now = Date.now() / 1000;
    return decoded.exp < now;
  },

  /**
   * Get time until token expires (in seconds)
   */
  getTokenTimeToExpire(token: string): number {
    const decoded = this.decodeToken(token);
    if (!decoded) return 0;
    
    const now = Date.now() / 1000;
    return Math.max(0, decoded.exp - now);
  },

  /**
   * Check if token needs refresh (less than 5 minutes remaining)
   */
  shouldRefreshToken(token: string): boolean {
    const timeToExpire = this.getTokenTimeToExpire(token);
    return timeToExpire > 0 && timeToExpire < 5 * 60; // 5 minutes
  },

  /**
   * Format user role for display
   */
  formatUserRole(user: UserResponseDto): string {
    return user.role || 'User';
  },

  /**
   * Get user initials
   */
  getUserInitials(user: UserResponseDto): string {
    const name = user.nama_lengkap || user.username;
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
};