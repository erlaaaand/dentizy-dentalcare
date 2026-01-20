import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

// API & Models
import {
  useAuthControllerLogin,
  useAuthControllerLogout,
  useAuthControllerGetProfile,
  getAuthControllerGetProfileQueryKey,
} from '../../api/generated/auth/auth';
import { UserResponseDto } from '../../api/model';

// Services & Config
import { storageService } from '../../service/cache/storage.service';
import { ROUTES } from '../../constants/routes.constants';

// Types & Utils
import { AuthTokenResponse, ApiErrorResponse } from '../../types/api.types';
import { AuthState, LoginCredentials } from '../../types/auth.types';
import { useToast } from '../toasts/useToast';
import { AxiosError } from 'axios';

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  // 1. Fetch User Profile (Source of Truth)
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useAuthControllerGetProfile({
    query: {
      enabled: !!storageService.getAccessToken(),
      retry: false, // Jangan retry jika 401
      staleTime: 1000 * 60 * 5, // Cache profile selama 5 menit
    },
  });

  const user = (profileResponse?.data as UserResponseDto) || null;

  // 2. Handle Auto-Logout jika Profile Error (Token Expired/Invalid)
  useEffect(() => {
    if (isProfileError) {
      handleLocalLogout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProfileError]);

  // 3. Helper: Bersihkan state lokal
  const handleLocalLogout = () => {
    storageService.clearAuth();
    queryClient.removeQueries({ queryKey: getAuthControllerGetProfileQueryKey() });
  };

  // 4. Mutation Login
  const loginMutation = useAuthControllerLogin({
    mutation: {
      onSuccess: (response) => {
        // Casting response unknown ke tipe yang kita definisikan
        const data = response.data as AuthTokenResponse;

        if (data?.accessToken) {
          storageService.setAccessToken(data.accessToken);
          if (data.refreshToken) {
            storageService.setRefreshToken(data.refreshToken);
          }

          showSuccess('Login berhasil');
          // Invalidate query profile agar fetch ulang
          queryClient.invalidateQueries({ queryKey: getAuthControllerGetProfileQueryKey() });
          router.push(ROUTES.DASHBOARD);
        } else {
          showError('Format respon server tidak valid.');
        }
      },
      onError: (error: AxiosError<ApiErrorResponse>) => {
        const message = error.response?.data?.message || 'Gagal login. Periksa kredensial Anda.';
        showError(Array.isArray(message) ? message[0] : message);
      },
    },
  });

  // 5. Mutation Logout
  const logoutMutation = useAuthControllerLogout({
    mutation: {
      onSuccess: () => {
        handleLocalLogout();
        router.push(ROUTES.LOGIN);
        showSuccess('Anda telah logout.');
      },
      onError: () => {
        // Force logout di client even server error
        handleLocalLogout();
        router.push(ROUTES.LOGIN);
      },
    },
  });

  // Construct Return Object
  const authState: AuthState = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading: isProfileLoading || loginMutation.isPending,
  }), [user, isProfileLoading, loginMutation.isPending]);

  return {
    ...authState,
    login: (credentials: LoginCredentials) => loginMutation.mutate({ data: credentials }),
    logout: () => logoutMutation.mutate(),
  };
};