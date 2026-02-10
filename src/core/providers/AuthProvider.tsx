// src/core/providers/auth-provider.tsx
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useAuthControllerLogin,
  useAuthControllerGetProfile,
} from "@/src/core/api/generated/auth/auth";
import type { LoginDto, UserResponseDto } from "@/src/core/api/model";
import { ROUTES } from "@/src/core/constants/routes.constants";
import { AuthTokenManager } from "@/src/core/service/api/auth/helpers/token.manager";
import axiosInstance from "@/src/core/service/http/axiosInstance";
import { AuthCacheManager } from "../service/api/auth";
import { AxiosError } from "axios";

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

const tokenManager = new AuthTokenManager();
const cacheManager = new AuthCacheManager();

function isUserResponseDto(data: unknown): data is UserResponseDto {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return typeof obj.id === "string" && typeof obj.username === "string" && Array.isArray(obj.roles);
}

function extractToken(response: unknown): string | null {
  if (!response || typeof response !== "object") return null;
  const res = response as Record<string, unknown>;
  const source =
    res.data && typeof res.data === "object" ? (res.data as Record<string, unknown>) : res;

  const token = source.access_token || source.accessToken || source.token;
  return typeof token === "string" ? token : null;
}

// ✅ Type guard: aman untuk narrowing error
function isAxiosError(error: unknown): error is AxiosError {
  return error instanceof AxiosError;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [hasToken, setHasToken] = useState<boolean>(() => {
    return !!tokenManager.getTokenFromCookie();
  });

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
  } = useAuthControllerGetProfile({
    query: {
      enabled: hasToken,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  });

  const { mutate: loginMutate, isPending: isLoginPending } = useAuthControllerLogin({
    mutation: {
      onSuccess: async (response) => {
        const token = extractToken(response);

        if (!token) {
          toast.error("Token tidak ditemukan");
          return;
        }

        tokenManager.setTokenInCookie(token);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setHasToken(true);
        cacheManager.invalidateProfile(queryClient);

        try {
          await refetchProfile();
          toast.success("Login berhasil!");
          router.replace(ROUTES.DASHBOARD);
        } catch {
          toast.error("Gagal mengambil profil pengguna");
        }
      },
      onError: (error: unknown) => {
        if (isAxiosError(error)) {
          const msg = error.response?.data;
          const errorMessage = Array.isArray(msg) ? msg[0] : msg || "Gagal masuk ke sistem";
          toast.error(errorMessage);
        } else {
          toast.error("Gagal masuk ke sistem");
        }
      },
    },
  });

  const user = useMemo(() => {
    const data = (profileData as { data?: unknown })?.data ?? profileData;
    return isUserResponseDto(data) ? data : null;
  }, [profileData]);

  useEffect(() => {
    if (!hasToken || !isProfileError) return;

    if (isAxiosError(profileError) && profileError.response?.status === 401) {
      tokenManager.clearAuthData();
      queryClient.clear();

      // ✅ Hindari cascading renders
      queueMicrotask(() => {
        setHasToken(false);
        router.replace(ROUTES.LOGIN);
      });
    }
  }, [hasToken, isProfileError, profileError, queryClient, router]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading: hasToken && isProfileLoading,
      isLoginPending,
      login: (data: LoginDto) => loginMutate({ data }),
      logout: () => {
        tokenManager.clearAuthData();
        setHasToken(false);
        queryClient.clear();
        router.replace(ROUTES.LOGIN);
      },
      refreshUser: () => {
        refetchProfile();
      },
    }),
    [user, hasToken, isProfileLoading, isLoginPending, loginMutate, refetchProfile, queryClient, router]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
