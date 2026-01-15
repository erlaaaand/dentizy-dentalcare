// frontend/src/core/hooks/auth/useRole.ts
import { useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { ROLES } from '@/core/constants/role.constants';

interface UserRole {
    id: number;
    name: string;
    description?: string;
}

export function useRole() {
    const { user } = useAuth();

    const userRoles: UserRole[] = useMemo(() => {
        if (!user || !('roles' in user)) return [];
        return (user as { roles?: UserRole[] }).roles || [];
    }, [user]);

    const hasRole = useCallback(
        (role: string | string[]): boolean => {
            if (userRoles.length === 0) return false;
            const roleNames = userRoles.map((r) => r.name);
            if (Array.isArray(role)) {
                return role.some((r) => roleNames.includes(r));
            }
            return roleNames.includes(role);
        },
        [userRoles]
    );

    const isKepalaKlinik = useMemo(() => hasRole(ROLES.KEPALA_KLINIK), [hasRole]);
    const isDokter = useMemo(() => hasRole(ROLES.DOKTER), [hasRole]);
    const isStaf = useMemo(() => hasRole(ROLES.STAF), [hasRole]);

    return {
        hasRole,
        isKepalaKlinik,
        isDokter,
        isStaf,
        userRoles,
    };
}