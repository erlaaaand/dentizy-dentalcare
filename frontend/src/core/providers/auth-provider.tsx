"use client";

import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useCallback, 
  useRef, 
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

// ... (Interface dan Helper Functions tetap sama, tidak perlu diubah) ...
// Saya menyalin Interface dan Helper function agar konteks tetap lengkap
// namun fokus perbaikan ada di AuthProvider

interface AuthContextType {
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginPending: boolean;
  login: (data: LoginDto) => void;
  logout: () => void;
  refreshUser: () => void;
}

interface LoginSuccessResponse {
  access_token?: string;
  accessToken?: string;
  token?: string;
  user?: UserResponseDto;
  data?: {
    access_token?: string;
    accessToken?: string;
    token?: string;
    user?: UserResponseDto;
  };
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string | string[];
      statusCode?: number;
    };
    status?: number;
  };
  message?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isClient = typeof window !== 'undefined';

// ... (Helper functions isUserResponseDto, extractToken, getTokenFromCookie, setTokenInCookie, clearAuthCookies tetap sama) ...
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

function extractToken(response: unknown): string | null {
  if (!response || typeof response !== 'object') return null;
  const res = response as LoginSuccessResponse;
  if (res.access_token) return res.access_token;
  if (res.accessToken) return res.accessToken;
  if (res.token) return res.token;
  if (res.data) {
    if (res.data.access_token) return res.data.access_token;
    if (res.data.accessToken) return res.data.accessToken;
    if (res.data.token) return res.data.token;
  }
  return null;
}

function getTokenFromCookie(): string | null {
  if (!isClient) return null;
  try {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
    if (!tokenCookie) return null;
    const token = tokenCookie.split('=')[1];
    return token ? decodeURIComponent(token.trim()) : null;
  } catch (error) {
    console.error('Error reading token from cookie:', error);
    return null;
  }
}

function setTokenInCookie(token: string): boolean {
  if (!isClient) return false;
  try {
    const isSecure = window.location.protocol === 'https:';
    const cookieString = `access_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax${isSecure ? '; Secure' : ''}`;
    document.cookie = cookieString;
    const verification = getTokenFromCookie();
    return verification === token;
  } catch (error) {
    console.error('Error setting token in cookie:', error);
    return false;
  }
}

function clearAuthCookies(): void {
  if (!isClient) return;
  try {
    document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  } catch (error) {
    console.error('Error clearing auth cookies:', error);
  }
}

// === KOMPONEN UTAMA YANG DIPERBAIKI ===

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // PERBAIKAN 1: Gunakan useState untuk hasToken karena ini mempengaruhi render (enabled: true/false)
  const [hasToken, setHasToken] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    return !!getTokenFromCookie();
  });
  
  const loginAttemptRef = useRef(false);
  const mountedRef = useRef(false);
  const loginTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize token state
  useEffect(() => {
    if (hasToken) {
      console.log('✅ Token found in cookie on mount');
    } else {
      console.log('ℹ️ No token found on mount');
    }
  }, [hasToken]); // Empty dependency array ensures this runs once on mount

  const { 
    data: userProfileResponse, 
    isLoading: isUserLoading,
    refetch: refetchProfile,
    isError: isProfileError,
    error: profileError
  } = useAuthControllerGetProfile({
    query: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      enabled: hasToken, 
    }
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
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
    // Pengecekan defensif: Pastikan error terjadi, token aktif, dan objek error tidak null
    if (isProfileError && hasToken && profileError) {
      
      // Lakukan Type Casting agar TypeScript mengerti struktur errornya
      // Kita anggap error tersebut sesuai interface ApiErrorResponse
      const apiError = profileError as ApiErrorResponse;
      
      // Ambil status code dengan aman menggunakan Optional Chaining (?.)
      const status = apiError.response?.status;

      console.log('🔍 Error Profile Detected:', { status, message: apiError.message });

      // LOGIC UTAMA: Hanya logout jika status 401 (Unauthorized)
      if (status === 401) {
        console.log('❌ Token expired/invalid (401). Melakukan auto-logout...');
        
        // 1. Bersihkan Cookie & Storage
        clearAuthCookies();
        
        // 2. Matikan State 'hasToken' agar query berhenti mencoba fetch
        setHasToken(false); 
        
        // 3. Bersihkan Cache React Query
        queryClient.clear(); 
        
        // 4. Beri feedback ke user
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        
        // 5. Redirect ke login
        router.push(ROUTES.LOGIN);
      } else {
        // Jika errornya BUKAN 401 (misal 500 atau Network Error),
        // JANGAN logout user. Cukup log errornya saja.
        console.warn('⚠️ Gagal mengambil profil (Bukan 401):', apiError);
      }
    }
  }, [isProfileError, hasToken, profileError, queryClient, router]);

  const { mutate: loginMutate, isPending: isLoginPending } = useAuthControllerLogin({
    mutation: {
      onSuccess: (response) => {
        try {
          console.log('🎉 Login successful, processing response...');
          
          const token = extractToken(response);
          
          if (!token) {
            console.error('❌ No token found in response:', response);
            toast.error("Token tidak ditemukan dalam respons server.");
            loginAttemptRef.current = false;
            return;
          }

          console.log('🔑 Token extracted successfully');

          const cookieSet = setTokenInCookie(token);
          
          if (!cookieSet) {
            console.error('❌ Failed to set cookie');
            toast.error("Gagal menyimpan sesi login.");
            loginAttemptRef.current = false;
            return;
          }

          console.log('✅ Cookie set successfully');
          
          // PERBAIKAN 5: Update state agar query profile berjalan
          setHasToken(true);
          
          queryClient.clear();
          
          toast.success("Login berhasil! Mengalihkan...");
          
          if (loginTimeoutRef.current) {
            clearTimeout(loginTimeoutRef.current);
          }
          
          loginTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              console.log('🚀 Redirecting to dashboard...');
              router.push(ROUTES.DASHBOARD);
              router.refresh();
              loginAttemptRef.current = false;
            }
          }, 500);
          
        } catch (err) {
          console.error('❌ Error in login success handler:', err);
          toast.error("Terjadi kesalahan saat memproses login.");
          loginAttemptRef.current = false;
        }
      },
      onError: (error: unknown) => {
        loginAttemptRef.current = false;
        console.error('❌ Login error:', error);
        
        const apiError = error as ApiErrorResponse;
        let errorMessage = "Username atau password salah.";
        
        if (apiError.response?.data?.message) {
          const message = apiError.response.data.message;
          errorMessage = Array.isArray(message) 
            ? message.join(", ") 
            : message;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
        
        if (apiError.response?.status === 401) {
          errorMessage = "Username atau password salah.";
        } else if (apiError.response?.status === 429) {
          errorMessage = "Terlalu banyak percobaan login. Silakan coba lagi nanti.";
        } else if (apiError.response?.status === 500) {
          errorMessage = "Terjadi kesalahan pada server. Silakan coba lagi.";
        }
        
        toast.error(errorMessage);
      }
    }
  });

  const login = useCallback((data: LoginDto) => {
    if (loginAttemptRef.current) {
      console.log('⏳ Login already in progress');
      return;
    }
    
    if (!data.username || !data.password) {
      toast.error("Username dan password harus diisi.");
      return;
    }
    
    console.log('🔐 Starting login process...');
    loginAttemptRef.current = true;
    
    clearAuthCookies();
    setHasToken(false); // Reset state
    queryClient.clear();
    
    loginMutate({ data });
  }, [loginMutate, queryClient]);

  const refreshUser = useCallback(() => {
    // PERBAIKAN 6: Gunakan hasToken state
    if (hasToken) {
      console.log('🔄 Refreshing user profile...');
      refetchProfile();
    }
  }, [refetchProfile, hasToken]);

  const logout = useCallback(() => {
    console.log('👋 Logging out...');
    
    if (loginTimeoutRef.current) {
      clearTimeout(loginTimeoutRef.current);
    }
    
    clearAuthCookies();
    setHasToken(false); // Update state
    loginAttemptRef.current = false;
    
    queryClient.clear();
    
    toast.info("Anda telah logout.");
    
    router.replace(ROUTES.LOGIN);
    router.refresh();
  }, [queryClient, router]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    // PERBAIKAN 7: Gunakan hasToken state di sini juga
    isLoading: isUserLoading && hasToken,
    isLoginPending,
    login,
    logout,
    refreshUser
  }), [user, isUserLoading, isLoginPending, login, logout, refreshUser, hasToken]);

  // Hapus return null if (!isClient) untuk menghindari hydration mismatch, 
  // biarkan merender children (biasanya loading state di handle UI)
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