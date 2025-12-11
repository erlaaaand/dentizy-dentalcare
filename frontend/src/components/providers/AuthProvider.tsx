'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback
} from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

// SERVICES
import { storageService } from '@/core/services/cache/storage.service';
import { ROUTES } from '@/core/constants/routes.constants';
import { useToast } from '@/core';

// API HOOKS
import {
    useAuthControllerLogin,
    useAuthControllerLogout,
    useAuthControllerGetProfile,
} from '@/core/api/generated/auth/auth';

import type { LoginDto } from '@/core/api/model';
import type { AuthUser } from '@/core/types/auth-user.types';

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (credentials: LoginDto) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    const [hasToken, setHasToken] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();

    // API hooks
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

    useEffect(() => {
        const token = storageService.getAccessToken();
        const storedUser = storageService.getUser();

        if (token) {
            setHasToken(true);

            if (storedUser) {
                setUserState(storedUser as AuthUser);
                setIsAuthenticated(true);
            }
        }

        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        if (!hasToken) {
            setLoading(false);
            return;
        }

        if (isLoadingProfile) {
            setLoading(true);
            return;
        }

        function isAxiosError(error: unknown): error is AxiosError {
            return typeof error === "object" && error !== null && "isAxiosError" in error;
        }

        if (isProfileError) {
            if (isAxiosError(profileError)) {
                if (profileError.response?.status === 401) {
                    handleLogoutCleanup();
                }
            }

            setLoading(false);
            return;
        }

        if (profileData) {
            const u = profileData as AuthUser;
            setUserState(u);
            setIsAuthenticated(true);
            storageService.setUser(u);
        }

        setLoading(false);
    }, [
        isInitialized,
        hasToken,
        isLoadingProfile,
        isProfileError,
        profileError,
        profileData
    ]);

    const handleLogoutCleanup = useCallback(() => {
        setHasToken(false);
        setUserState(null);
        setIsAuthenticated(false);
        storageService.clearAll();
        clearAuthCookie();
        queryClient.clear();
    }, [queryClient]);

    const login = async (credentials: LoginDto) => {
        try {
            const response = await loginMutation.mutateAsync({ data: credentials });

            if (!response || typeof response !== "object") {
                throw new Error("Invalid server response");
            }

            const {
                access_token,
                accessToken,
                refresh_token,
                refreshToken,
                user
            } = response as {
                access_token?: string;
                accessToken?: string;
                refresh_token?: string;
                refreshToken?: string;
                user?: AuthUser;
            };

            const accessTokenValue = access_token || accessToken;
            const refreshTokenValue = refresh_token || refreshToken;

            if (accessTokenValue) {
                storageService.setAccessToken(accessTokenValue);
                setAuthCookie(accessTokenValue);
                setHasToken(true);
            }

            if (refreshTokenValue) {
                storageService.setRefreshToken(refreshTokenValue);
            }

            if (user) {
                storageService.setUser(user);
                setUserState(user);
                setIsAuthenticated(true);
            }

            showSuccess("Login berhasil!");
            router.replace(ROUTES.DASHBOARD);

        } catch (error) {
            console.error("Login error:", error);
            showError("Email atau password salah.");
        }
    };


    // =============================
    // LOGOUT FUNCTION
    // =============================
    const logout = async () => {
        handleLogoutCleanup();

        try {
            await logoutMutation.mutateAsync();
        } catch (e) {
            console.warn("Logout API failed, ignoring:", e);
        }

        router.replace(ROUTES.LOGIN);
    };


    // =============================
    // SET USER MANUAL UPDATE
    // =============================
    const setUser = (u: AuthUser | null) => {
        setUserState(u);
        if (u) storageService.setUser(u);
        else storageService.removeUser();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                login,
                logout,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
