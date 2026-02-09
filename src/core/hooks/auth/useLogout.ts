"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ROUTES } from "@/src/core/constants/routes.constants";
import { authService } from "@/src/core/service/api/auth/auth.api";

/**
 * Hook untuk logout dengan cleanup lengkap
 * Menggunakan auth service untuk konsistensi
 */
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = async () => {
    try {
      // 1. Panggil API logout untuk invalidate token di server
      try {
        await authService.logout();
      } catch (apiError) {
        // Lanjutkan cleanup meskipun API gagal
        console.warn('API logout failed, continuing with client cleanup:', apiError);
      }

      // 2. Clear auth data (cookies & localStorage)
      authService.clearAuthData();
      
      // 3. Clear semua cache React Query
      queryClient.clear();
      
      // 4. Tampilkan notifikasi
      toast.info("Anda telah logout");
      
      // 5. Redirect ke halaman login
      router.replace(ROUTES.LOGIN);
      
      // 6. Force refresh untuk clear state
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Terjadi kesalahan saat logout");
      
      // Tetap lakukan cleanup minimal
      authService.clearAuthData();
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
      authService.clearAuthData();
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

/**
 * Hook untuk logout dengan confirmation
 */
export const useLogoutWithConfirmation = () => {
  const logout = useLogout();

  const logoutWithConfirmation = async (confirmCallback?: () => Promise<boolean>) => {
    try {
      // If confirmation callback provided, call it
      if (confirmCallback) {
        const confirmed = await confirmCallback();
        if (!confirmed) {
          return false;
        }
      }

      await logout();
      return true;
    } catch (error) {
      console.error('Logout with confirmation error:', error);
      return false;
    }
  };

  return logoutWithConfirmation;
};

/**
 * Hook untuk auto logout saat token expired
 */
export const useAutoLogout = () => {
  const forceLogout = useForceLogout();
  const queryClient = useQueryClient();

  const checkAndLogout = () => {
    const token = authService.getTokenFromCookie();
    
    if (!token) {
      forceLogout();
      return;
    }

    // Check if token is expired
    if (authService.isTokenExpired(token)) {
      authService.clearAuthData();
      queryClient.clear();
      
      toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
      forceLogout();
    }
  };

  return checkAndLogout;
};