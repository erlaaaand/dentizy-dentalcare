'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

// SERVICES & CONFIG
import { storageService } from '@/core/services/cache/storage.service';
import { ROUTES } from '@/core/constants/routes.constants';
import { useToast } from '@/core';

// API HOOKS (GENERATED)
import {
    useAuthControllerLogin,
    useAuthControllerLogout,
    useAuthControllerGetProfile,
} from '@/core/api/generated/auth/auth';

// TYPES
import type { LoginDto } from '@/core/api/model';
import type { AuthUser } from '@/core/types/auth-user.types';

// INTERFACE CONTEXT
interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (credentials: LoginDto) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// COOKIE HELPER
const setAuthCookie = (token: string, expiresInSeconds = 86400) => {
    try {
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `access_token=${token}; Path=/; Max-Age=${expiresInSeconds}; SameSite=Lax${secure}`;
        document.cookie = `dental_clinic_access_token=${token}; Path=/; Max-Age=${expiresInSeconds}; SameSite=Lax${secure}`;
    } catch (e) {
        console.warn('Cookie set failed:', e);
    }
};

const clearAuthCookie = () => {
    document.cookie = `access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `dental_clinic_access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<AuthUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [hasToken, setHasToken] = useState(false);

    // Loading state gabungan (initial check + profile fetch)
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();

    // API Mutations & Queries
    const loginMutation = useAuthControllerLogin();
    const logoutMutation = useAuthControllerLogout();

    const {
        data: profileData,
        isLoading: isLoadingProfile,
        isError: isProfileError,
        error: profileError
    } = useAuthControllerGetProfile({
        query: {
            enabled: hasToken && isInitialized,
            retry: 1,
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
        },
    });

    // 1. INITIALIZATION FROM STORAGE
    useEffect(() => {
        const token = storageService.getAccessToken();
        const storedUser = storageService.getUser();

        if (token) {
            setHasToken(true);
            if (storedUser) {
                // Casting aman
                const u = storedUser as unknown as AuthUser;
                setUserState(u);
                setIsAuthenticated(true);
            }
        }
        setIsInitialized(true);
    }, []);

    // 2. SYNC PROFILE DATA
    useEffect(() => {
        if (!isInitialized) return;

        // Jika tidak ada token, stop loading
        if (!hasToken) {
            setLoading(false);
            return;
        }

        // Jika sedang fetch profile, set loading
        if (isLoadingProfile) {
            setLoading(true);
            return;
        }

        // Handle Error Profile (misal Token Expired)
        if (isProfileError) {
            const axiosErr = profileError as unknown as AxiosError;
            if (axiosErr?.response?.status === 401) {
                handleLogoutCleanup(); // Force logout jika 401
            }
            setLoading(false);
            return;
        }

        // Jika sukses fetch profile
        if (profileData) {
            const u = profileData as AuthUser;
            setUserState(u);
            setIsAuthenticated(true);
            storageService.setUser(u);
        }

        setLoading(false);
    }, [isInitialized, hasToken, isLoadingProfile, isProfileError, profileError, profileData]);

    // CLEANUP HELPER
    const handleLogoutCleanup = useCallback(() => {
        setHasToken(false);
        setUserState(null);
        setIsAuthenticated(false);
        storageService.clearAll();
        clearAuthCookie();
        queryClient.clear();
    }, [queryClient]);

    // LOGIN ACTION
    const login = async (credentials: LoginDto) => {
        try {
            const response = await loginMutation.mutateAsync({ data: credentials });

            // Sesuaikan dengan respon API Anda
            const data = response as any; // Temporary cast jika tipe generated tidak pas
            const accessToken = data.access_token || data.accessToken;
            const refreshToken = data.refresh_token || data.refreshToken;
            const userData = data.user;

            if (accessToken) {
                storageService.setAccessToken(accessToken);
                setAuthCookie(accessToken);
                setHasToken(true);
            }

            if (refreshToken) {
                storageService.setRefreshToken(refreshToken);
            }

            if (userData) {
                const u = userData as AuthUser;
                storageService.setUser(u);
                setUserState(u);
                setIsAuthenticated(true);
            }

            showSuccess('Login berhasil!');
            router.replace(ROUTES.DASHBOARD);
        } catch (error) {
            console.error('Login error:', error);
            showError('Email atau password salah.');
            throw error;
        }
    };

    // LOGOUT ACTION
    const logout = async () => {
        handleLogoutCleanup();
        try {
            await logoutMutation.mutateAsync();
        } catch (e) {
            console.warn('Logout API failed (ignoring):', e);
        }
        router.replace(ROUTES.LOGIN);
    };

    // MANUAL SET USER (untuk update profile tanpa refetch)
    const setUser = (u: AuthUser | null) => {
        setUserState(u);
        if (u) storageService.setUser(u);
        else storageService.removeUser();
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            loading,
            login,
            logout,
            setUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// HOOK UTAMA
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}