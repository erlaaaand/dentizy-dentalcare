"use client";

import React, { createContext, useContext, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  useAuthControllerLogin, 
  useAuthControllerGetProfile 
} from "@/src/core/api/generated/auth/auth";
import { LoginDto, UserResponseDto } from "@/src/core/api/model";
import { ROUTES } from "@/src/core/constants/routes.constants";

interface AuthContextType {
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginPending: boolean;
  login: (data: LoginDto) => void;
  logout: () => void;
  refreshUser: () => void;
}

interface LoginResponse {
  access_token?: string;
  accessToken?: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    nama_lengkap: string;
    roles: string[];
  };
}

interface ApiError {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isClient = typeof window !== 'undefined';

function isUserResponseDto(data: unknown): data is UserResponseDto {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj.id === 'string' &&
    typeof obj.username === 'string' &&
    typeof obj.nama_lengkap === 'string' &&
    Array.isArray(obj.roles) &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const loginAttemptRef = useRef(false);
  const mountedRef = useRef(false);
  const hasTokenRef = useRef(false);

  // Check if we have a token
  useEffect(() => {
    if (isClient) {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
      hasTokenRef.current = !!tokenCookie;
    }
  }, []);

  const { 
    data: userProfileResponse, 
    isLoading: isUserLoading,
    refetch: refetchProfile,
    isError
  } = useAuthControllerGetProfile({
    query: {
      retry: 1, // Kurangi retry
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Jangan refetch otomatis
      enabled: isClient && hasTokenRef.current, // Hanya fetch jika ada token
    }
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const user = useMemo(() => {
    if (!userProfileResponse) return null;
    
    if ('data' in userProfileResponse && userProfileResponse.data) {
      const userData = userProfileResponse.data;
      if (isUserResponseDto(userData)) {
        return userData;
      }
    }
    
    if (isUserResponseDto(userProfileResponse)) {
      return userProfileResponse;
    }
    
    return null;
  }, [userProfileResponse]);

  useEffect(() => {
    if (isError && isClient && hasTokenRef.current) {
      console.log('❌ Token invalid, clearing auth');
      document.cookie = "access_token=; path=/; max-age=0";
      hasTokenRef.current = false;
      queryClient.clear();
    }
  }, [isError, queryClient]);

  const { mutate: loginMutate, isPending: isLoginPending } = useAuthControllerLogin({
    mutation: {
      onSuccess: (response) => {
        loginAttemptRef.current = false;
        
        console.log('🎉 Login Response:', response);
        
        try {
          let token: string | undefined;
          
          // Parse response yang dari backend
          if (response && typeof response === 'object') {
            const res = response as LoginResponse;
            
            // Backend mengirim access_token (underscore)
            token = res.access_token || res.accessToken || res.token;
          }

          console.log('🔑 Token extracted:', token ? '***EXISTS***' : 'NOT FOUND');

          if (token) {
            // Set cookie dengan secure flags
            const cookieString = `access_token=${token}; path=/; max-age=86400; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
            document.cookie = cookieString;
            hasTokenRef.current = true;
            
            console.log('✅ Cookie set:', document.cookie.includes('access_token'));
            
            toast.success("Login berhasil! Mengalihkan...");
            
            // Clear semua cache
            queryClient.clear();
            
            // Wait sebentar untuk cookie ter-set
            setTimeout(() => {
              if (mountedRef.current) {
                console.log('🚀 Redirecting to dashboard...');
                router.push(ROUTES.DASHBOARD);
                router.refresh();
              }
            }, 500);
          } else {
            console.error('❌ No token in response:', response);
            toast.error("Token tidak ditemukan dalam respons server.");
          }
        } catch (err) {
          console.error('❌ Login success handler error:', err);
          toast.error("Terjadi kesalahan saat memproses login.");
        }
      },
      onError: (error: unknown) => {
        loginAttemptRef.current = false;
        console.error('❌ Login error:', error);
        
        const apiError = error as ApiError;
        const message = apiError.response?.data?.message;
        
        const displayMessage = Array.isArray(message) 
          ? message.join(", ") 
          : message || "Username atau password salah.";
          
        toast.error(displayMessage);
      }
    }
  });

  const login = useCallback((data: LoginDto) => {
    if (loginAttemptRef.current) {
      console.log('⏳ Login already in progress');
      return;
    }
    
    console.log('🔐 Starting login...');
    loginAttemptRef.current = true;
    loginMutate({ data });
  }, [loginMutate]);

  const refreshUser = useCallback(() => {
    if (hasTokenRef.current) {
      refetchProfile();
    }
  }, [refetchProfile]);

  const logout = useCallback(() => {
    document.cookie = "access_token=; path=/; max-age=0";
    localStorage.removeItem('refresh_token');
    hasTokenRef.current = false;
    queryClient.clear();
    loginAttemptRef.current = false;
    toast.info("Anda telah logout.");
    router.replace(ROUTES.LOGIN);
    router.refresh();
  }, [queryClient, router]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading: isUserLoading && hasTokenRef.current, // Loading hanya jika ada token
    isLoginPending,
    login,
    logout,
    refreshUser
  }), [user, isUserLoading, isLoginPending, login, logout, refreshUser]);

  if (!isClient) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
};