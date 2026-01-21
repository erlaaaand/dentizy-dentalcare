"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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
  accessToken?: string;
  token?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
}

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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch User Profile
  const { 
    data: userProfileResponse, 
    isLoading: isUserLoading,
    refetch: refetchProfile,
    isError
  } = useAuthControllerGetProfile({
    query: {
      retry: false,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      enabled: isClient, // Only fetch when client-side
    }
  });

  // Extract user data safely - Handle both direct data and nested response
  const user = React.useMemo(() => {
    if (!userProfileResponse) return null;
    
    // Check if data is nested (Orval response format)
    if ('data' in userProfileResponse && userProfileResponse.data) {
      return userProfileResponse.data as UserResponseDto;
    }
    
    // Direct data format
    return userProfileResponse as UserResponseDto;
  }, [userProfileResponse]);

  // Handle profile fetch error (likely token expired)
  useEffect(() => {
    if (isError && isClient) {
      // Token might be expired, clear auth state
      document.cookie = "access_token=; path=/; max-age=0";
      queryClient.clear();
    }
  }, [isError, isClient, queryClient]);

  // Mark as initialized once we've attempted to fetch user
  useEffect(() => {
    if (isClient && !isUserLoading) {
      setIsInitialized(true);
    }
  }, [isClient, isUserLoading]);

  // Login Mutation
  const { mutate: loginMutate, isPending: isLoginPending } = useAuthControllerLogin({
    mutation: {
      onSuccess: (response) => {
        try {
          // Handle various response formats
          let responseData;
          
          if ('data' in response && response.data) {
            responseData = response.data as unknown as LoginResponse;
          } else {
            responseData = response as unknown as LoginResponse;
          }

          const token = responseData.accessToken || responseData.token || responseData.access_token;
          const refreshToken = responseData.refreshToken || responseData.refresh_token;

          if (token) {
            // Set access token cookie
            document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
            
            // Store refresh token if available
            if (refreshToken) {
              localStorage.setItem('refresh_token', refreshToken);
            }
            
            toast.success("Login berhasil! Mengalihkan...");
            
            // Invalidate and refetch user profile
            queryClient.invalidateQueries({ queryKey: ['/auth/profile'] });
            queryClient.invalidateQueries({ queryKey: ['/auth/me'] });
            
            // Wait a bit for cookie to be set, then redirect
            setTimeout(() => {
              router.push(ROUTES.DASHBOARD);
              router.refresh();
            }, 300);
          } else {
            toast.error("Token tidak ditemukan dalam respons server.");
          }
        } catch (err) {
          console.error('Login success handler error:', err);
          toast.error("Terjadi kesalahan saat memproses login.");
        }
      },
      onError: (error: unknown) => {
        console.error('Login error:', error);
        const apiError = error as ApiError;
        const message = apiError.response?.data?.message;
        
        const displayMessage = Array.isArray(message) 
          ? message.join(", ") 
          : message || "Username atau password salah.";
          
        toast.error(displayMessage);
      }
    }
  });

  // Login function
  const login = useCallback((data: LoginDto) => {
    loginMutate({ data });
  }, [loginMutate]);

  // Refresh user function
  const refreshUser = useCallback(() => {
    refetchProfile();
  }, [refetchProfile]);

  // Logout function
  const logout = useCallback(() => {
    // Clear cookies
    document.cookie = "access_token=; path=/; max-age=0";
    
    // Clear local storage
    localStorage.removeItem('refresh_token');
    
    // Clear all query cache
    queryClient.clear();
    
    toast.info("Anda telah logout.");
    
    // Redirect to login
    router.replace(ROUTES.LOGIN);
    router.refresh();
  }, [queryClient, router]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: isUserLoading || !isInitialized,
    isLoginPending,
    login,
    logout,
    refreshUser
  };

  // Prevent hydration mismatch by not rendering until client-side
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