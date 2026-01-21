"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  useAuthControllerLogin, 
  useAuthControllerGetProfile 
} from "@/src/core/api/generated/auth/auth";
import { LoginDto, UserResponseDto } from "@/src/core/api/model";
import { ROUTES } from "@/src/core/constants/routes.constants";

// Definisi tipe Context agar tidak ada 'any'
interface AuthContextType {
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Loading profile
  isLoginPending: boolean; // Loading saat submit login
  login: (data: LoginDto) => void;
  logout: () => void;
}

// Tipe untuk response login yang mungkin memiliki variasi nama token
interface LoginResponse {
  accessToken?: string;
  token?: string;
  access_token?: string;
}

// Error type definition
interface ApiError {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isClient, setIsClient] = useState(false);

  // Hindari hydration mismatch
  useEffect(() => {
  const id = setTimeout(() => setIsClient(true), 0);
  return () => clearTimeout(id);
}, []);

  // 1. Fetch User Profile
  // Menggunakan 'retry: false' agar jika gagal (401), tidak terus-terusan request
  const { data: userProfileResponse, isLoading: isUserLoading } = useAuthControllerGetProfile({
    query: {
      retry: false,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  });

  // Casting data dengan aman dari response Orval
  // Asumsi response Orval adalah { data: UserResponseDto, status: ... } atau UserResponseDto langsung
  // Kita cek keberadaan properti untuk memastikan
  const user = (userProfileResponse as unknown as { data: UserResponseDto })?.data || null;

  // 2. Setup Mutation Login
  const { mutate: loginMutate, isPending: isLoginPending } = useAuthControllerLogin({
    mutation: {
      onSuccess: (response) => {
        // Type narrowing untuk data response
        const responseData = response.data as unknown as LoginResponse;
        const token = responseData.accessToken || responseData.token || responseData.access_token;

        if (token) {
          // Simpan token ke cookie
          document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
          
          toast.success("Login berhasil! Mengalihkan...");
          
          // Invalidate query user agar data profile ter-refresh otomatis
          queryClient.invalidateQueries({ queryKey: ['/auth/profile'] });
          queryClient.invalidateQueries({ queryKey: ['/auth/me'] }); // Jaga-jaga jika key berbeda
          
          // Redirect ke dashboard
          router.push(ROUTES.DASHBOARD);
        } else {
          toast.error("Token tidak ditemukan dalam respons server.");
        }
      },
      onError: (error: unknown) => {
        const apiError = error as ApiError;
        const message = apiError.response?.data?.message;
        
        // Handle message yang bisa berupa string atau array string
        const displayMessage = Array.isArray(message) 
          ? message.join(", ") 
          : message || "Terjadi kesalahan saat login.";
          
        toast.error(displayMessage);
      }
    }
  });

  // Wrapper function untuk login
  const login = (data: LoginDto) => {
    loginMutate({ data });
  };

  // Wrapper function untuk logout
  const logout = () => {
    // Hapus cookie
    document.cookie = "access_token=; path=/; max-age=0";
    
    // Hapus semua cache data (user, patients, appointments, dll)
    queryClient.clear();
    
    toast.info("Anda telah logout.");
    router.replace(ROUTES.LOGIN);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: isUserLoading,
    isLoginPending,
    login,
    logout
  };

  if (!isClient) return null; // Prevent hydration error

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook untuk menggunakan Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
};