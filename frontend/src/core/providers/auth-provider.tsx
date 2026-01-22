"use client";

import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useCallback, 
  useMemo,
  useState 
} from "react";
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: Cek apakah object adalah UserResponseDto
function isUserResponseDto(data: unknown): data is UserResponseDto {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.username === 'string' &&
    typeof obj.nama_lengkap === 'string' &&
    Array.isArray(obj.roles)
  );
}

// Helper: Extract token dari response
function extractToken(response: unknown): string | null {
  if (!response || typeof response !== 'object') return null;
  const res = response as Record<string, unknown>;
  
  // Coba berbagai kemungkinan struktur response
  if (typeof res.access_token === 'string') return res.access_token;
  if (typeof res.accessToken === 'string') return res.accessToken;
  if (typeof res.token === 'string') return res.token;
  
  if (res.data && typeof res.data === 'object') {
    const data = res.data as Record<string, unknown>;
    if (typeof data.access_token === 'string') return data.access_token;
    if (typeof data.accessToken === 'string') return data.accessToken;
    if (typeof data.token === 'string') return data.token;
  }
  
  return null;
}

// Helper: Ambil token dari cookie
function getTokenFromCookie(): string | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
  
  if (!tokenCookie) return null;
  
  const token = tokenCookie.split('=')[1];
  return token ? decodeURIComponent(token.trim()) : null;
}

// Helper: Simpan token ke cookie
function setTokenInCookie(token: string): void {
  if (typeof window === 'undefined') return;
  
  const isSecure = window.location.protocol === 'https:';
  const cookieString = `access_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax${isSecure ? '; Secure' : ''}`;
  document.cookie = cookieString;
}

// Helper: Hapus semua data auth
function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  // Hapus cookie
  document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
  
  // Hapus localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // State untuk tracking token
  const [hasToken, setHasToken] = useState(() => !!getTokenFromCookie());

  // Query untuk get profile
  const { 
    data: profileData, 
    isLoading: isProfileLoading,
    refetch: refetchProfile,
    isError: isProfileError,
    error: profileError,
  } = useAuthControllerGetProfile({
    query: {
      enabled: hasToken,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  });

  // Mutation untuk login
  const { mutate: loginMutate, isPending: isLoginPending } = useAuthControllerLogin({
    mutation: {
      onSuccess: (response) => {
        const token = extractToken(response);
        
        if (!token) {
          toast.error("Token tidak ditemukan dalam respons server");
          return;
        }

        // Simpan token
        setTokenInCookie(token);
        setHasToken(true);
        
        // Clear cache agar query ulang bersih
        queryClient.clear();
        
        toast.success("Login berhasil!");
        
        // Redirect ke dashboard
        setTimeout(() => {
          router.push(ROUTES.DASHBOARD);
          router.refresh();
        }, 300);
      },
      onError: (error: unknown) => {
        const apiError = error as { response?: { status?: number; data?: { message?: string | string[] } }; message?: string };
        
        let errorMessage = "Username atau password salah";
        
        if (apiError.response?.data?.message) {
          const msg = apiError.response.data.message;
          errorMessage = Array.isArray(msg) ? msg.join(", ") : msg;
        } else if (apiError.response?.status === 429) {
          errorMessage = "Terlalu banyak percobaan login. Silakan coba lagi nanti";
        } else if (apiError.response?.status === 500) {
          errorMessage = "Terjadi kesalahan pada server";
        }
        
        toast.error(errorMessage);
      }
    }
  });

  // Extract user dari response
  const user = useMemo(() => {
    if (!profileData) return null;
    
    // Cek jika data langsung UserResponseDto
    if (isUserResponseDto(profileData)) {
      return profileData;
    }
    
    // Cek jika data wrapped dalam object
    if (typeof profileData === 'object' && 'data' in profileData) {
      const wrapped = profileData as { data: unknown };
      if (isUserResponseDto(wrapped.data)) {
        return wrapped.data;
      }
    }
    
    return null;
  }, [profileData]);

  useEffect(() => {
    if (hasToken && isProfileError && profileError) {
      const apiError = profileError as { response?: { status?: number } };
      
      if (apiError.response?.status === 401) {
        clearAuthData();
        queryClient.clear();
        
        toast.error("Sesi Anda telah berakhir. Silakan login kembali");
        router.push(ROUTES.LOGIN);

        setTimeout(() => {
          setHasToken(false);
        }, 0);
      }
    }
  }, [hasToken, isProfileError, profileError, queryClient, router]);

  // Login function
  const login = useCallback((data: LoginDto) => {
    if (!data.username || !data.password) {
      toast.error("Username dan password harus diisi");
      return;
    }
    
    clearAuthData();
    setHasToken(false);
    queryClient.clear();
    
    loginMutate({ data });
  }, [loginMutate, queryClient]);

  // Logout function
  const logout = useCallback(() => {
    clearAuthData();
    setHasToken(false);
    queryClient.clear();
    
    toast.info("Anda telah logout");
    router.replace(ROUTES.LOGIN);
    router.refresh();
  }, [queryClient, router]);

  // Refresh user function
  const refreshUser = useCallback(() => {
    if (hasToken) {
      refetchProfile();
    }
  }, [hasToken, refetchProfile]);

  // Context value
  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading: isProfileLoading && hasToken,
    isLoginPending,
    login,
    logout,
    refreshUser
  }), [user, isProfileLoading, hasToken, isLoginPending, login, logout, refreshUser]);

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