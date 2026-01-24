// src/hooks/useAuth.ts
import { useQueryClient } from '@tanstack/react-query';
import { 
  useAuthControllerLogin, 
  useAuthControllerGetProfile,
  useAuthControllerLogout,
  useAuthControllerForgotPassword 
} from '../../api/generated/auth/auth';

export const useAuthLogin = () => {
  return useAuthControllerLogin({
    mutation: {
      onSuccess: (data) => {
        // Logika setelah login sukses (misal: simpan token, redirect)
        console.log('Login berhasil', data);
      },
      onError: (error) => {
        // Logika error handling (misal: tampilkan toast)
        console.error('Login gagal', error);
      }
    }
  });
};

export const useUser = () => {
  return useAuthControllerGetProfile({
    query: {
      // Mengambil data user hanya jika token tersedia (opsional logic)
      retry: false,
      staleTime: 5 * 60 * 1000, // Cache selama 5 menit
    }
  });
};

export const useAuthLogout = () => {
  const queryClient = useQueryClient();
  return useAuthControllerLogout({
    mutation: {
      onSuccess: () => {
        // Hapus cache user saat logout
        queryClient.setQueryData(['/auth/me'], null); 
        queryClient.invalidateQueries();
      }
    }
  });

  export const useForgotPassword = () => {
    
  }
};