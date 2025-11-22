'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storageService } from '@/core/services/cache/storage.service';
import { useLogin, useLogout } from '@/core/services/api/auth.api';
import { ROUTES } from '@/core/constants';
import { User } from '@/core/api/model'; // ✅ Menggunakan tipe dari Core

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

    // ✅ Menggunakan React Query Mutations dari Core
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
            // ✅ Menggunakan API Service yang sudah digenerate
            const response = await loginMutation.mutateAsync({ data: credentials });
            // Respons dari API login di Core sepertinya mengembalikan object yang mungkin perlu disesuaikan field-nya
            // Asumsi response memiliki access_token dan user (sesuai LoginResponse standar)
            const data = response as any;

            if (data?.access_token) {
                storageService.setAccessToken(data.access_token);
            }

            if (data?.user) {
                storageService.setUser(data.user);
                setUser(data.user);
            }

            router.push(ROUTES.DASHBOARD);
        } catch (error) {
            console.error('Login failed:', error);
            throw error; // Biarkan komponen UI menangani error display
        }
    };

    const logout = async () => {
        try {
            await logoutMutation.mutateAsync();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Selalu clear storage client-side meski API error
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