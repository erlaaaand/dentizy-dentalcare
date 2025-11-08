'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { hasPermission, Permission } from '@/lib/permissions';

export function usePermission() {
  const user = useAuthStore(state => state.user);

  const can = (permission: Permission): boolean => {
    if (!user) return false;
    const roleNames = user.roles.map(r => r.name);
    return hasPermission(roleNames, permission);
  };

  const canAny = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.some(permission => can(permission));
  };

  const canAll = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.every(permission => can(permission));
  };

  return { can, canAny, canAll };
}