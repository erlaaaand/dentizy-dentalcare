"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/src/core/constants/routes.constants";
import { toast } from "sonner";
import { useAuthLogout } from "./useAuth";

/**
 * Hook untuk logout dengan cleanup lengkap
 * Menggabungkan API logout dengan client-side cleanup
 */
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutateAsync: logoutMutation } = useAuthLogout();

  const logout = async () => {
    try {
      // 1. Panggil API logout untuk invalidate token di server
      try {
        await logoutMutation();
      } catch (apiError) {
        // Lanjutkan cleanup meskipun API gagal
        console.warn('API logout failed, continuing with client cleanup:', apiError);
      }

      // 2. Hapus access token dari cookie
      document.cookie = "access_token=; path=/; max-age=0; SameSite=Strict";
      
      // 3. Hapus refresh token dari localStorage
      localStorage.removeItem('refresh_token');
      
      // 4. Clear semua cache React Query
      queryClient.clear();
      
      // 5. Tampilkan notifikasi
      toast.info("Anda telah logout");
      
      // 6. Redirect ke halaman login
      router.replace(ROUTES.LOGIN);
      
      // 7. Force refresh untuk clear state
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Terjadi kesalahan saat logout");
      
      // Tetap lakukan cleanup minimal
      document.cookie = "access_token=; path=/; max-age=0";
      localStorage.removeItem('refresh_token');
      queryClient.clear();
      router.replace(ROUTES.LOGIN);
    }
  };

  return logout;
};

/**
 * Hook alternatif untuk logout tanpa API call
 * Berguna jika token sudah invalid atau untuk force logout
 */
export const useForceLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const forceLogout = () => {
    try {
      // Cleanup client-side saja
      document.cookie = "access_token=; path=/; max-age=0; SameSite=Strict";
      localStorage.removeItem('refresh_token');
      queryClient.clear();
      
      toast.info("Sesi Anda telah berakhir");
      
      router.replace(ROUTES.LOGIN);
      router.refresh();
    } catch (error) {
      console.error('Force logout error:', error);
      // Minimal cleanup
      router.replace(ROUTES.LOGIN);
    }
  };

  return forceLogout;
};