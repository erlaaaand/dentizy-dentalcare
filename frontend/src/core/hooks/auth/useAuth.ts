// frontend/src/core/hooks/auth/useAuth.ts
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

interface AuthUser extends User {
    roles?: Array<{ id: number; name: string; description?: string }>;
}

interface LoginResponse {
    access_token?: string;
    refresh_token?: string;
    user?: AuthUser;
}

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

    const checkAuth = useCallback(() => {
        try {
            const token = storageService.getAccessToken();
            if (!token) {
                setLoading(false);
                return;
            }
            if (profileData) {
                const userData = profileData as AuthUser;
                setUser(userData);
                setIsAuthenticated(true);
                storageService.setUser(userData);
            }
        } catch {
            storageService.clearAuth();
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, [profileData]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = useCallback(
        async (credentials: LoginDto) => {
            try {
                const response = (await loginMutation.mutateAsync({ data: credentials })) as LoginResponse;
                if (response?.access_token) {
                    storageService.setAccessToken(response.access_token);
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
                router.push(ROUTES.DASHBOARD);
            } catch {
                showError(ERROR_MESSAGES.INVALID_CREDENTIALS);
                throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
            }
        },
        [loginMutation, router, showSuccess, showError]
    );

    const logout = useCallback(async () => {
        try {
            await logoutMutation.mutateAsync();
            storageService.clearAuth();
            setUser(null);
            setIsAuthenticated(false);
            showSuccess(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
            router.push(ROUTES.LOGIN);
        } catch {
            showError(ERROR_MESSAGES.UNKNOWN_ERROR);
        }
    }, [logoutMutation, router, showSuccess, showError]);

    return {
        user,
        loading: loading || isLoadingProfile,
        isAuthenticated,
        login,
        logout,
        checkAuth,
    };
}