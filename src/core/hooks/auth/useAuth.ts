import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createQueryHook, createMutationHook } from '../../service/base/use-query-factory';
import { authService } from '../../service/api/auth/auth.api';
import { AuthCacheManager } from '../../service/api/auth/cache/cache.manager';
import { AuthTokenManager } from '../../service/api/auth/helpers/token.manager';
import type {
  LoginDto,
  VerifyTokenDto,
  UpdateProfileDto,
  ForgotPasswordRequestDto,
  VerifyOTPDto,
  ResetPasswordWithTokenDto,
} from '../../types/auth/auth.types';

const cacheManager = new AuthCacheManager();
const tokenManager = new AuthTokenManager();

// ==================== QUERY HOOKS ====================

export const useUserProfile = createQueryHook({
  queryKey: () => cacheManager.getProfileQueryKey(),
  queryFn: () => authService.getProfile(),
  options: {
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  },
});

export const useAuthLogin = createMutationHook({
  mutationFn: (data: LoginDto) => authService.login(data),
  onSuccess: (response, __, queryClient) => {
    // Extract token from response
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
    
    const token = responseData.access_token || 
                 responseData.accessToken || 
                 responseData.token ||
                 responseData.data?.access_token ||
                 responseData.data?.accessToken ||
                 responseData.data?.token;
    
    if (token) {
      tokenManager.setTokenInCookie(token);
    }
    
    toast.success('Login berhasil');
    cacheManager.invalidateProfile(queryClient);
  },
  onError: () => {
    toast.error('Login gagal. Periksa username dan password Anda.');
  }
});

export const useAuthRefresh = createMutationHook({
  mutationFn: () => authService.refresh(),
  onSuccess: (response) => {
    if (response.access_token) {
      tokenManager.setTokenInCookie(response.access_token);
    }
  },
  onError: (error) => {
    console.error('Refresh token error:', error);
  }
});

export const useAuthVerify = createMutationHook({
  mutationFn: (data: VerifyTokenDto) => authService.verify(data),
});

export const useAuthLogout = createMutationHook({
  mutationFn: () => authService.logout(),
  onSuccess: (_, __, queryClient) => {
    tokenManager.clearAuthData();
    queryClient.clear();
    toast.info('Anda telah logout');
  },
  onError: (error, __, queryClient) => {
    console.error('Logout error:', error);
    tokenManager.clearAuthData();
    queryClient.clear();
  }
});

export const useUpdateProfile = createMutationHook({
  mutationFn: (data: UpdateProfileDto) => authService.updateProfile(data),
  onSuccess: (_, __, queryClient) => {
    toast.success('Profil berhasil diperbarui');
    cacheManager.invalidateProfile(queryClient);
  },
  onError: () => {
    toast.error('Gagal memperbarui profil');
  }
});

export const useForgotPassword = createMutationHook({
  mutationFn: (data: ForgotPasswordRequestDto) => authService.forgotPassword(data),
  onSuccess: () => {
    toast.success('Kode OTP telah dikirim ke email Anda');
  },
  onError: () => {
    toast.error('Gagal mengirim kode OTP. Periksa email/username Anda.');
  }
});

export const useVerifyOTP = createMutationHook({
  mutationFn: (data: VerifyOTPDto) => authService.verifyOTP(data),
  onSuccess: () => {
    toast.success('OTP berhasil diverifikasi');
  },
  onError: () => {
    toast.error('Kode OTP tidak valid atau sudah kedaluwarsa');
  }
});

export const useResetPassword = createMutationHook({
  mutationFn: (data: ResetPasswordWithTokenDto) => authService.resetPassword(data),
  onSuccess: () => {
    toast.success('Password berhasil direset. Silakan login dengan password baru.');
  },
  onError: () => {
    toast.error('Gagal mereset password. Token mungkin tidak valid.');
  }
});

// ==================== COMBINED AUTH HOOK ====================

export function useAuthMutations() {
  const login = useAuthLogin();
  const logout = useAuthLogout();
  const refresh = useAuthRefresh();
  const verify = useAuthVerify();
  const updateProfile = useUpdateProfile();
  const forgotPassword = useForgotPassword();
  const verifyOTP = useVerifyOTP();
  const resetPassword = useResetPassword();

  return {
    login: login.mutate,
    loginAsync: login.mutateAsync,
    logout: logout.mutate,
    logoutAsync: logout.mutateAsync,
    refresh: refresh.mutate,
    refreshAsync: refresh.mutateAsync,
    verify: verify.mutate,
    verifyAsync: verify.mutateAsync,
    updateProfile: updateProfile.mutate,
    updateProfileAsync: updateProfile.mutateAsync,
    forgotPassword: forgotPassword.mutate,
    forgotPasswordAsync: forgotPassword.mutateAsync,
    verifyOTP: verifyOTP.mutate,
    verifyOTPAsync: verifyOTP.mutateAsync,
    resetPassword: resetPassword.mutate,
    resetPasswordAsync: resetPassword.mutateAsync,

    isLoggingIn: login.isPending,
    isLoggingOut: logout.isPending,
    isRefreshing: refresh.isPending,
    isVerifying: verify.isPending,
    isUpdatingProfile: updateProfile.isPending,
    isSendingOTP: forgotPassword.isPending,
    isVerifyingOTP: verifyOTP.isPending,
    isResettingPassword: resetPassword.isPending,

    loginError: login.error,
    logoutError: logout.error,
    refreshError: refresh.error,
    verifyError: verify.error,
    updateProfileError: updateProfile.error,
    forgotPasswordError: forgotPassword.error,
    verifyOTPError: verifyOTP.error,
    resetPasswordError: resetPassword.error,
  };
}

// ==================== UTILITY HOOKS ====================

export function usePrefetchAuth() {
  const queryClient = useQueryClient();
  
  return {
    prefetchProfile: () => cacheManager.prefetchProfile(queryClient),
  };
}

export function useInvalidateAuth() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => cacheManager.invalidateAll(queryClient),
    invalidateProfile: () => cacheManager.invalidateProfile(queryClient),
  };
}