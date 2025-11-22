import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { ROLES } from '../../constants/role.constants';

export function useRole() {
  const { user } = useAuth();

  const hasRole = (role: string | string[]): boolean => {
    if (!user?.roles) return false;

    const userRoles = user.roles.map(r => r.name);
    
    if (Array.isArray(role)) {
      return role.some(r => userRoles.includes(r));
    }
    
    return userRoles.includes(role);
  };

  const isKepalaKlinik = useMemo(
    () => hasRole(ROLES.KEPALA_KLINIK),
    [user]
  );

  const isDokter = useMemo(
    () => hasRole(ROLES.DOKTER),
    [user]
  );

  const isStaf = useMemo(
    () => hasRole(ROLES.STAF),
    [user]
  );

  return {
    hasRole,
    isKepalaKlinik,
    isDokter,
    isStaf,
    userRoles: user?.roles || [],
  };
}