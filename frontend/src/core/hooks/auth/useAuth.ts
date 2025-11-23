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
// PENTING: Middleware hanya bisa membaca Token dari sini!
const setAuthCookie = (token: string, expiresInSeconds: number = 86400) => {
    // Simpan cookie 'access_token'
    document.cookie = `access_token=${token}; path=/; max-age=${expiresInSeconds}; SameSite=Lax`;
};

const removeAuthCookie = () => {
    document.cookie = `access_token=; path=/; max-age=0;`;
};

// -- Main Hook --
export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const { showSuccess, showError } = useToast();

    const { data: profileData, isLoading: isLoadingProfile } = useAuthControllerGetProfile({
        query: { enabled: !!storageService.getAccessToken() },
    });

    const loginMutation = useAuthControllerLogin();
    const logoutMutation = useAuthControllerLogout();

    // Cek status auth saat mount
    const checkAuth = useCallback(() => {
        try {
            const token = storageService.getAccessToken();
            if (!token) {
                setLoading(false);
                return;
            }
            if (profileData) {
                setUser(profileData as AuthUser);
                setIsAuthenticated(true);
                storageService.setUser(profileData);
            }
        } catch {
            storageService.clearAuth();
            removeAuthCookie(); // Pastikan cookie juga bersih
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, [profileData]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // -- FUNGSI LOGIN --
    const login = useCallback(
        async (credentials: LoginDto) => {
            try {
                // 1. Panggil API Login
                const response = (await loginMutation.mutateAsync({ data: credentials })) as LoginResponse;

                // 2. Simpan Token
                if (response?.access_token) {
                    // A. Simpan ke LocalStorage (Untuk Axios Client-Side)
                    storageService.setAccessToken(response.access_token);

                    // B. Simpan ke Cookie (Untuk Middleware Server-Side) -> BAGIAN INI YANG HILANG SEBELUMNYA
                    setAuthCookie(response.access_token);
                }

                if (response?.refresh_token) {
                    storageService.setRefreshToken(response.refresh_token);
                }

                if (response?.user) {
                    storageService.setUser(response.user);
                    setUser(response.user);
                    setIsAuthenticated(true);
                }

                showSuccess(SUCCESS_MESSAGES.LOGIN_SUCCESS);

                // 3. Redirect ke Dashboard
                router.push(ROUTES.DASHBOARD);

                // 4. Refresh agar Middleware membaca Cookie baru
                router.refresh();

            } catch (error) {
                console.error('Login failed:', error);
                showError(ERROR_MESSAGES.INVALID_CREDENTIALS);
                // Jangan throw error jika ingin handle di sini, tapi throw jika form butuh catch
                throw error;
            }
        },
        [loginMutation, router, showSuccess, showError]
    );

    // -- FUNGSI LOGOUT --
    const logout = useCallback(async () => {
        try {
            await logoutMutation.mutateAsync();
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Bersihkan semua penyimpanan
            storageService.clearAuth();
            removeAuthCookie(); // Hapus Cookie agar Middleware memblokir akses

            setUser(null);
            setIsAuthenticated(false);
            showSuccess(SUCCESS_MESSAGES.LOGOUT_SUCCESS);

            router.push(ROUTES.LOGIN);
            router.refresh();
        }
    }, [logoutMutation, router, showSuccess]);

    return {
        user,
        loading: loading || isLoadingProfile,
        isAuthenticated,
        login,
        logout,
        checkAuth,
    };
}