'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storageService } from '@/core/services/cache/storage.service';
import { useLogin, useLogout } from '@/core/services/api/auth.api';
import { ROUTES } from '@/core/constants';
import { User } from '@/core/api/model';

interface LoginResponse {
    access_token: string;
    user: User;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (credentials: { username: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loginMutation = useLogin();
    const logoutMutation = useLogout();

    useEffect(() => {
        const initAuth = () => {
            const storedUser = storageService.getUser<User>();
            const token = storageService.getAccessToken();

            if (storedUser && token) {
                setUser(storedUser);
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials: { username: string; password: string }) => {
        try {
            const response = await loginMutation.mutateAsync({ data: credentials }) as unknown as LoginResponse;

            if (response?.access_token) {
                storageService.setAccessToken(response.access_token);
            }

            if (response?.user) {
                storageService.setUser(response.user);
                setUser(response.user);
            }

            router.push(ROUTES.DASHBOARD);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await logoutMutation.mutateAsync();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            storageService.clearAuth();
            setUser(null);
            router.push(ROUTES.LOGIN);
        }
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        storageService.setUser(updatedUser);
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}