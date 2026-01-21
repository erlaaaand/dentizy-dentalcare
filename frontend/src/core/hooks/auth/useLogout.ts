"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/src/core/constants/routes.constants";
import { toast } from "sonner";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = async () => {
    try {
      document.cookie = "access_token=; path=/; max-age=0";
      
      localStorage.removeItem('refresh_token');
      
      queryClient.clear();
      
      toast.info("Anda telah logout.");
      
      router.replace(ROUTES.LOGIN);
      
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Terjadi kesalahan saat logout");
    }
  };

  return logout;
};