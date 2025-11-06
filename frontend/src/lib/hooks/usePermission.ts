'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { hasPermission, Permission } from '@/lib/permissions';

export function usePermission() {
  const user = useAuthStore(state => state.user);
  
  const can = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.roles, permission);
  };
  
  const canAny = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.some(permission => 
      hasPermission(user.roles, permission)
    );
  };
  
  const canAll = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.every(permission => 
      hasPermission(user.roles, permission)
    );
  };
  
  return { can, canAny, canAll };
}