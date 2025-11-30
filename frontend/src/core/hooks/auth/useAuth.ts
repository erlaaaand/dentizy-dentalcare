'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// IMPORTANT: import langsung dari file implementasi storage
import { storageService } from '@/core/services/cache/storage.service';

import { ROUTES } from '@/core/constants/routes.constants';
import { SUCCESS_MESSAGES } from '@/core/constants/success.constants';
import { ERROR_MESSAGES } from '@/core/constants/error.constants';
import { useToast } from '../ui/useToast';

import {
    useAuthControllerLogin,
    useAuthControllerLogout,
    useAuthControllerGetProfile,
} from '@/core/api/generated/auth/auth';

import type { LoginDto } from '@/core/api/model';
import { useQueryClient } from '@tanstack/react-query';
import type { AuthUser } from '@/core/types/auth-user.types';
import { AxiosError } from 'axios';

// ======================
// AUTH RESPONSE TYPES
// ======================
export interface LoginResponse {
    access_token?: string;
    refresh_token?: string;
    user?: AuthUser;
}

// ======================
// COOKIE SETTER
// ======================
const setAuthCookie = (token: string, expiresInSeconds = 86400) => {
    try {
        document.cookie = `access_token=${token}; Path=/; Max-Age=${expiresInSeconds}; SameSite=Lax`;
        document.cookie = `dental_clinic_access_token=${token}; Path=/; Max-Age=${expiresInSeconds}; SameSite=Lax`;
    } catch (e) {
        console.warn('Could not set cookie:', e);
    }
};

// ======================
// FULL CLEANUP
// ======================
const forceCleanupAll = () => {
    try {
        document.cookie = `access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `dental_clinic_access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    } catch { }

    try {
        storageService.clearAll();
    } catch (e) {
        console.warn("storage cleanup error:", e);
    }

    try {
        Object.keys(sessionStorage).forEach((k) => {
            if (k.startsWith("dental_clinic_")) sessionStorage.removeItem(k);
        });
    } catch { }
};

// ======================
// MAIN HOOK
// ======================
export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [hasToken, setHasToken] = useState(false);

    const router = useRouter();
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();

    // ======================
    // FETCH PROFILE
    // ======================
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
            refetchOnReconnect: false,
        },
    });

    const loginMutation = useAuthControllerLogin();
    const logoutMutation = useAuthControllerLogout();

    // ======================
    // INITIALIZATION (client only)
    // ======================
    useEffect(() => {
        const token = storageService.getAccessToken();
        const stored = storageService.getUser();

        // Safely validate/cast stored to AuthUser
        const storedUser: AuthUser | null =
            stored && typeof stored === 'object' && Object.keys(stored).length > 0
                ? (stored as AuthUser)
                : null;

        if (token) {
            setHasToken(true);
            if (storedUser) {
                setUser(storedUser);
                setIsAuthenticated(true);
            }
        }

        setIsInitialized(true);
        setLoading(false);
    }, []);

    // ======================
    // PROFILE UPDATE & ERROR HANDLING
    // ======================
    useEffect(() => {
        if (!isInitialized) return;

        if (!hasToken) {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        if (isLoadingProfile) {
            setLoading(true);
            return;
        }

        if (isProfileError) {
            // FIX: Cast ke unknown dulu sebelum ke AxiosError untuk mengatasi 'void' mismatch
            const axiosErr = profileError as unknown as AxiosError;
            const status = axiosErr?.response?.status;

            // Hanya logout paksa jika 401 (Unauthorized) yang persisten
            if (status === 401) {
                console.warn('❌ Session expired or invalid token');
                forceCleanupAll();
                setHasToken(false);
                setUser(null);
                setIsAuthenticated(false);
            } else {
                console.warn('⚠️ Profile fetch error (non-auth):', profileError);
            }

            setLoading(false);
            return;
        }

        if (profileData) {
            const u = profileData as AuthUser;
            setUser(u);
            setIsAuthenticated(true);
            try {
                storageService.setUser(u);
            } catch (e) {
                console.warn('setUser failed:', e);
            }
        }

        setLoading(false);
    }, [hasToken, profileData, isLoadingProfile, isProfileError, profileError, isInitialized]);

    // ======================
    // LOGIN
    // ======================
    const login = useCallback(
        async (credentials: LoginDto) => {
            try {
                const response = (await loginMutation.mutateAsync({
                    data: credentials,
                })) as LoginResponse;

                if (response.access_token) {
                    storageService.setAccessToken(response.access_token);
                    setAuthCookie(response.access_token);
                    setHasToken(true);
                }

                if (response.refresh_token) {
                    storageService.setRefreshToken(response.refresh_token);
                }

                if (response.user) {
                    storageService.setUser(response.user as AuthUser);
                    setUser(response.user as AuthUser);
                    setIsAuthenticated(true);
                }

                showSuccess(SUCCESS_MESSAGES.LOGIN_SUCCESS);
                router.replace(ROUTES.DASHBOARD);
            } catch (err) {
                console.error('Login failed:', err);
                showError(ERROR_MESSAGES.INVALID_CREDENTIALS);
                throw err;
            }
        },
        [loginMutation, router, showSuccess, showError]
    );

    // ======================
    // LOGOUT
    // ======================
    const logout = useCallback(async () => {
        setHasToken(false);
        setUser(null);
        setIsAuthenticated(false);

        try {
            queryClient.cancelQueries();
            queryClient.clear();
        } catch (e) {
            console.warn('queryClient cleanup error', e);
        }

        try {
            logoutMutation.mutate(undefined, {
                onSettled: () => console.log('Logout API settled'),
            });
        } catch (e) {
            console.warn('logout mutate error', e);
        }

        forceCleanupAll();

        try {
            router.replace(ROUTES.LOGIN);
        } catch {
            window.location.replace(ROUTES.LOGIN);
        }
    }, [logoutMutation, queryClient, router]);

    return {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        hasToken,
        setHasToken,
    };
}