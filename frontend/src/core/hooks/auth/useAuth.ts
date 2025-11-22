// frontend/src/core/hooks/auth/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { storageService } from '@/core/services/cache/storage.service';
import { User } from '@/core/api/model';
import { ROUTES } from '@/core/constants/routes.constants';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/core/constants';
import { useToast } from '../ui/useToast';
import { useAuthControllerLogin, useAuthControllerLogout, useAuthControllerGetProfile } from '@/core/api/generated/auth/auth';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const router = useRouter();
    const { showSuccess, showError } = useToast();

    // Get profile query
    const { data: profileData, isLoading: isLoadingProfile } = useAuthControllerGetProfile({
        query: {
            enabled: !!storageService.getAccessToken(),
        }
    });

    // Login mutation
    const loginMutation = useAuthControllerLogin();

    // Logout mutation
    const logoutMutation = useAuthControllerLogout();

    const checkAuth = useCallback(async () => {
        try {
            const token = storageService.getAccessToken();
            if (!token) {
                setLoading(false);
                return;
            }

            if (profileData) {
                setUser(profileData);
                setIsAuthenticated(true);
                storageService.setUser(profileData);
            }
        } catch (error) {
            storageService.clearAuth();
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, [profileData]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = useCallback(async (credentials: { username: string; password: string }) => {
        try {
            const response = await loginMutation.mutateAsync({ data: credentials });
            
            // Assuming response contains { access_token, refresh_token, user }
            if (response && typeof response === 'object' && 'data' in response) {
                const data = response.data as any;
                if (data.access_token) {
                    storageService.setAccessToken(data.access_token);
                }
                if (data.refresh_token) {
                    storageService.setRefreshToken(data.refresh_token);
                }
                if (data.user) {
                    storageService.setUser(data.user);
                    setUser(data.user);
                    setIsAuthenticated(true);
                }
            }
            
            showSuccess(SUCCESS_MESSAGES.LOGIN_SUCCESS);
            router.push(ROUTES.DASHBOARD);
        } catch (error) {
            showError(ERROR_MESSAGES.INVALID_CREDENTIALS);
            throw error;
        }
    }, [loginMutation, router, showSuccess, showError]);

    const logout = useCallback(async () => {
        try {
            await logoutMutation.mutateAsync();
            storageService.clearAuth();
            setUser(null);
            setIsAuthenticated(false);
            showSuccess(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
            router.push(ROUTES.LOGIN);
        } catch (error) {
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