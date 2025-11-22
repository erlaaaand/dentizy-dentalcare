// frontend/src/core/hooks/auth/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { storageService } from '@/core/services/cache/storage.service';
import { User } from '@/core/types/api';
import { ROUTES } from '@/core/constants/routes.constants';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/core/constants';
import { useToast } from '../ui/useToast';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const router = useRouter();
    const { showSuccess, showError } = useToast();

    const checkAuth = useCallback(async () => {
        try {
            const token = storageService.getAccessToken();
            if (!token) {
                setLoading(false);
                return;
            }

            const savedUser = storageService.getUser<User>();
            if (savedUser) {
                setUser(savedUser);
                setIsAuthenticated(true);
            }
        } catch (error) {
            storageService.clearAuth();
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = useCallback(async (credentials: { username: string; password: string }) => {
        try {
            setLoading(true);
            // API call will be implemented when API hooks are ready
            showSuccess(SUCCESS_MESSAGES.LOGIN_SUCCESS);
            router.push(ROUTES.DASHBOARD);
        } catch (error) {
            showError(ERROR_MESSAGES.INVALID_CREDENTIALS);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [router, showSuccess, showError]);

    const logout = useCallback(async () => {
        try {
            storageService.clearAuth();
            setUser(null);
            setIsAuthenticated(false);
            showSuccess(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
            router.push(ROUTES.LOGIN);
        } catch (error) {
            showError(ERROR_MESSAGES.UNKNOWN_ERROR);
        }
    }, [router, showSuccess, showError]);

    return {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        checkAuth,
    };
}