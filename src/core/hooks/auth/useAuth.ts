import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  useAuthControllerLogin,
  useAuthControllerRefresh,
  useAuthControllerVerify,
  useAuthControllerGetProfile,
  useAuthControllerUpdateMyProfile,
  useAuthControllerLogout,
  useAuthControllerForgotPassword,
  useAuthControllerVerifyOTP,
  useAuthControllerResetPassword,
  getAuthControllerGetProfileQueryKey
} from '../../api/generated/auth/auth';

/**
 * Hook untuk login user
 */
export const useAuthLogin = () => {
  const queryClient = useQueryClient();
  
  return useAuthControllerLogin({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 200) {
          toast.success('Login berhasil');
          // Invalidate user profile query untuk refetch data terbaru
          queryClient.invalidateQueries({ 
            queryKey: getAuthControllerGetProfileQueryKey() 
          });
        }
      },
      onError: (error) => {
        toast.error('Login gagal. Periksa username dan password Anda.');
        console.error('Login error:', error);
      }
    }
  });
};

/**
 * Hook untuk refresh access token
 */
export const useAuthRefresh = () => {
  return useAuthControllerRefresh({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 200) {
          console.debug('Token berhasil di-refresh');
        }
      },
      onError: (error) => {
        console.error('Refresh token error:', error);
      }
    }
  });
};

/**
 * Hook untuk verifikasi token
 */
export const useAuthVerify = () => {
  return useAuthControllerVerify({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 200) {
          console.log('Token valid');
        }
      },
      onError: (error) => {
        console.error('Token verification error:', error);
      }
    }
  });
};

/**
 * Hook untuk mendapatkan profil user
 */
export const useUser = () => {
  return useAuthControllerGetProfile({
    query: {
      retry: false,
      staleTime: 5 * 60 * 1000, // Cache selama 5 menit
      refetchOnWindowFocus: false,
    }
  });
};

/**
 * Hook untuk update profil user
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useAuthControllerUpdateMyProfile({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 200) {
          toast.success('Profil berhasil diperbarui');
          // Invalidate profile query untuk refetch data terbaru
          queryClient.invalidateQueries({ 
            queryKey: getAuthControllerGetProfileQueryKey() 
          });
        }
      },
      onError: (error) => {
        toast.error('Gagal memperbarui profil');
        console.error('Update profile error:', error);
      }
    }
  });
};

/**
 * Hook untuk logout
 */
export const useAuthLogout = () => {
  const queryClient = useQueryClient();
  
  return useAuthControllerLogout({
    mutation: {
      onSuccess: () => {
        // Clear semua cache
        queryClient.clear();
        toast.info('Anda telah logout');
      },
      onError: (error) => {
        console.error('Logout error:', error);
        // Tetap clear cache meskipun API gagal
        queryClient.clear();
      }
    }
  });
};

/**
 * Hook untuk forgot password - request OTP
 */
export const useForgotPassword = () => {
  return useAuthControllerForgotPassword({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 201) {
          toast.success('Kode OTP telah dikirim ke email Anda');
        }
      },
      onError: (error) => {
        toast.error('Gagal mengirim kode OTP. Periksa email/username Anda.');
        console.error('Forgot password error:', error);
      }
    }
  });
};

/**
 * Hook untuk verifikasi OTP
 */
export const useVerifyOTP = () => {
  return useAuthControllerVerifyOTP({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 201) {
          toast.success('OTP berhasil diverifikasi');
        }
      },
      onError: (error) => {
        toast.error('Kode OTP tidak valid atau sudah kedaluwarsa');
        console.error('Verify OTP error:', error);
      }
    }
  });
};

/**
 * Hook untuk reset password dengan token
 */
export const useResetPassword = () => {
  return useAuthControllerResetPassword({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 201) {
          toast.success('Password berhasil direset. Silakan login dengan password baru.');
        }
      },
      onError: (error) => {
        toast.error('Gagal mereset password. Token mungkin tidak valid.');
        console.error('Reset password error:', error);
      }
    }
  });
};