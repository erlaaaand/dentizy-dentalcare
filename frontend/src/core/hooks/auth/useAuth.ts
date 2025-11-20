'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/core/services/api';
import { User, Role, UserRole, ID } from '@/core/types/api';

interface UseAuthReturn {
    user: User | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            const userData = getCurrentUser();

            if (userData) {
                const normalizedRoles: Role[] = (userData.roles || []).map((role: string | Role) => {
                    if (typeof role === 'string') {
                        return {
                            id: role,
                            name: role as UserRole
                        };
                    }
                    return role;
                });

                setUser({
                    ...userData,
                    roles: normalizedRoles
                });

            } else {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                setUser(null);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk refresh user data (bisa dipanggil manual jika perlu)
    const refreshUser = async () => {
        setLoading(true);
        await fetchUser();
    };

    useEffect(() => {
        fetchUser();

        // Listen untuk perubahan localStorage (untuk multi-tab sync)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'user' || e.key === 'access_token') {
                fetchUser();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return { user, loading, refreshUser };
}