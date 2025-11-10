'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { Permission, hasPermission } from '@/lib/permissions';

export function usePermission() {
  const user = useAuthStore(state => state.user);

  const extractRoleNames = (): string[] => {
    if (!user || !Array.isArray(user.roles)) return [];

    return user.roles
      .map(role => {
        if (typeof role === 'object' && 'name' in role) {
          return role.name;
        }
        if (typeof role === 'string') {
          return role;
        }
        console.warn('⚠️ Unknown role format:', role);
        return '';
      })
      .filter(Boolean);
  };

  const can = (permission: Permission): boolean => {
    if (!user) return false;

    const roleNames = extractRoleNames();

    // Debug log (nonaktifkan di production)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Checking permission:', {
        user,
        roleNames,
        permission,
        result: hasPermission(roleNames, permission),
      });
    }

    return hasPermission(roleNames, permission);
  };

  const canAny = (permissions: Permission[]): boolean =>
    !!user && permissions.some(permission => can(permission));

  const canAll = (permissions: Permission[]): boolean =>
    !!user && permissions.every(permission => can(permission));

  return { can, canAny, canAll };
}
