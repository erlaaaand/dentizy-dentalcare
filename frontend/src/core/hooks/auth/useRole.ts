// frontend/src/core/hooks/auth/useRole.ts
import { useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { ROLES } from '@/core/constants/role.constants';

export function useRole() {
    const { user } = useAuth();

    const hasRole = useCallback((role: string | string[]): boolean => {
        if (!user?.roles) return false;
        const userRoles = user.roles.map(r => r.name);
        if (Array.isArray(role)) {
            return role.some(r => userRoles.includes(r));
        }
        return userRoles.includes(role);
    }, [user]);

    const isKepalaKlinik = useMemo(() => hasRole(ROLES.KEPALA_KLINIK), [hasRole]);
    const isDokter = useMemo(() => hasRole(ROLES.DOKTER), [hasRole]);
    const isStaf = useMemo(() => hasRole(ROLES.STAF), [hasRole]);

    return {
        hasRole,
        isKepalaKlinik,
        isDokter,
        isStaf,
        userRoles: user?.roles || [],
    };
}