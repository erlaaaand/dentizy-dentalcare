// lib/hooks/usePermission.ts
'use client';

import { useAuth } from '@/lib/hooks/useAuth';  // ← Import ini
import { Permission, hasPermission } from '@/lib/permissions';

export function usePermission() {
  const { user } = useAuth();  // ← Gunakan useAuth() bukan useAuthStore

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
    if (!user) {
      console.log('❌ usePermission: user is null');
      return false;
    }

    const roleNames = extractRoleNames();

    // Debug log
    console.log('🔍 Checking permission:', {
      user,
      roleNames,
      permission,
      result: hasPermission(roleNames, permission),
    });

    return hasPermission(roleNames, permission);
  };

  const canAny = (permissions: Permission[]): boolean =>
    !!user && permissions.some(permission => can(permission));

  const canAll = (permissions: Permission[]): boolean =>
    !!user && permissions.every(permission => can(permission));

  return { can, canAny, canAll };
}