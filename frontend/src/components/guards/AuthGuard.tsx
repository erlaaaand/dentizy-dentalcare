'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Import services/storage Anda di sini

// 1. Definisikan Tipe Context
interface AuthContextType {
    user: any | null; // Ganti 'any' dengan tipe User Anda
    login: (data: any) => Promise<void>;
    logout: () => void;
    isLoading: boolean; // <--- WAJIB ADA
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);

    // 2. State Loading (Default True)
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const initAuth = () => {
            try {
                // Cek LocalStorage (gunakan helper storage Anda yang sudah diperbaiki)
                // Contoh: const storedUser = userStorage.getUser();
                // if (storedUser) setUser(storedUser);
            } catch (error) {
                console.error(error);
            } finally {
                // 3. Matikan Loading setelah pengecekan selesai
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (data: any) => {
        // Logic login...
    };

    const logout = () => {
        // Logic logout...
        setUser(null);
        router.push('/login');
    };

    // 4. Pass isLoading ke value
    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};