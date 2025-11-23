// frontend/src/core/hooks/auth/useAuth.ts
'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import type { User, LoginDto } from '@/core/api/model';

// -- Interfaces --
interface AuthUser extends User {
    roles?: Array<{ id: number; name: string; description?: string }>;
}

interface LoginResponse {
    access_token?: string;
    refresh_token?: string;
    user?: AuthUser;
}

// -- Helper Functions: Cookie Management --
const setAuthCookie = (token: string, expiresInSeconds: number = 86400) => {
    try {
        document.cookie = `access_token=${token}; path=/; max-age=${expiresInSeconds}; SameSite=Lax`;
        document.cookie = `dental_clinic_access_token=${token}; path=/; max-age=${expiresInSeconds}; SameSite=Lax`;
    } catch (error) {
        console.error('Error setting cookies:', error);
    }
};

// Force cleanup
const forceCleanupAll = () => {
    console.log('🧹 === FORCE CLEANUP STARTED ===');

    try {
        document.cookie.split(';').forEach(c => {
            const name = c.split('=')[0].trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            document.cookie = `${name}=; max-age=0; path=/;`;
        });
        console.log('✅ Cookies cleared');
    } catch (error) {
        console.error('Cookie clear error:', error);
    }

    try {
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ Storage cleared');
    } catch (error) {
        console.error('Storage clear error:', error);
    }

    try {
        storageService.clearAuth();
        console.log('✅ StorageService cleared');
    } catch (error) {
        console.error('StorageService clear error:', error);
    }

    console.log('🧹 === FORCE CLEANUP COMPLETED ===');
};

// -- Main Hook --
export function useAuth() {
    // ✅ FIX: Start with null/false to match SSR
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const router = useRouter();
    const { showSuccess, showError } = useToast();

    // ✅ FIX: Check token only on client-side
    const [hasToken, setHasToken] = useState(false);

    const { data: profileData, isLoading: isLoadingProfile, isError: profileError } = useAuthControllerGetProfile({
        query: {
            enabled: hasToken && isInitialized,
            retry: false,
            staleTime: 5 * 60 * 1000,
        },
    });

    const loginMutation = useAuthControllerLogin();
    const logoutMutation = useAuthControllerLogout();

    // ✅ FIX: Initialize auth state on client-side ONLY (useEffect runs only on client)
    useEffect(() => {
        console.log('🔧 Initializing auth state (client-side only)...');

        try {
            const token = storageService.getAccessToken();
            const storedUser = storageService.getUser();

            console.log('🔍 Initial check:', { hasToken: !!token, hasStoredUser: !!storedUser });

            if (token) {
                setHasToken(true);

                // If we have stored user, use it immediately
                if (storedUser) {
                    console.log('✅ Restoring session from storage');
                    setUser(storedUser as AuthUser);
                    setIsAuthenticated(true);
                }
            }
        } catch (error) {
            console.error('❌ Initialization error:', error);
        } finally {
            setIsInitialized(true);
            setLoading(false);
        }
    }, []); // Run once on mount

    // ✅ Handle profile data updates
    useEffect(() => {
        // Don't run until initialized
        if (!isInitialized) return;

        console.log('🔄 Auth state update:', {
            hasToken,
            profileData: !!profileData,
            isLoadingProfile,
            profileError,
        });

        // Case 1: No token - not authenticated
        if (!hasToken) {
            console.log('❌ No token');
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        // Case 2: Profile loading - maintain current state
        if (isLoadingProfile) {
            console.log('⏳ Profile loading...');
            setLoading(true);
            return;
        }

        // Case 3: Profile error - cleanup
        if (profileError) {
            console.log('❌ Profile error - cleaning up');
            forceCleanupAll();
            setUser(null);
            setIsAuthenticated(false);
            setHasToken(false);
            setLoading(false);
            return;
        }

        // Case 4: Profile data received
        if (profileData) {
            console.log('✅ Profile data received');
            setUser(profileData as AuthUser);
            setIsAuthenticated(true);
            setLoading(false);
            storageService.setUser(profileData);
            return;
        }

        setLoading(false);

    }, [hasToken, profileData, isLoadingProfile, profileError, isInitialized]);

    // -- FUNGSI LOGIN --
    const login = useCallback(
        async (credentials: LoginDto) => {
            try {
                console.log('🔐 Starting login process...');

                const response = (await loginMutation.mutateAsync({ data: credentials })) as LoginResponse;

                if (response?.access_token) {
                    storageService.setAccessToken(response.access_token);
                    setAuthCookie(response.access_token);
                    setHasToken(true);
                    console.log('✅ Token saved');
                }

                if (response?.refresh_token) {
                    storageService.setRefreshToken(response.refresh_token);
                }

                if (response?.user) {
                    storageService.setUser(response.user);
                    setUser(response.user);
                    setIsAuthenticated(true);
                    console.log('✅ User data saved');
                }

                showSuccess(SUCCESS_MESSAGES.LOGIN_SUCCESS);

                console.log('🔄 Redirecting to dashboard...');
                router.push(ROUTES.DASHBOARD);
                router.refresh();

            } catch (error) {
                console.error('❌ Login failed:', error);
                showError(ERROR_MESSAGES.INVALID_CREDENTIALS);
                throw error;
            }
        },
        [loginMutation, router, showSuccess, showError]
    );

    // -- FUNGSI LOGOUT --
    const logout = useCallback(async () => {
        console.log('🚪 === LOGOUT FROM useAuth STARTED ===');

        logoutMutation.mutate(undefined, {
            onSuccess: () => console.log('✅ Logout API success'),
            onError: (error) => console.warn('⚠️ Logout API error:', error)
        });

        forceCleanupAll();

        setUser(null);
        setIsAuthenticated(false);
        setHasToken(false);

        console.log('🚪 === LOGOUT FROM useAuth COMPLETED ===');

    }, [logoutMutation]);

    const checkAuth = useCallback(() => {
        console.log('🔍 checkAuth called (deprecated - using useEffect)');
    }, []);

    return {
        user,
        loading: loading || isLoadingProfile,
        isAuthenticated,
        login,
        logout,
        checkAuth,
    };
}