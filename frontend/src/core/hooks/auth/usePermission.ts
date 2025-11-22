import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useRole } from './useRole';
import { ROLE_PERMISSIONS } from '../../constants/permission.constants';

export function usePermission() {
  const { user } = useAuth();
  const { userRoles } = useRole();

  const permissions = useMemo(() => {
    if (!user?.roles) return [];

    const allPermissions = new Set<string>();
    
    userRoles.forEach(role => {
      const rolePerms = ROLE_PERMISSIONS[role.name as keyof typeof ROLE_PERMISSIONS];
      if (rolePerms) {
        rolePerms.forEach(perm => allPermissions.add(perm));
      }
    });

    return Array.from(allPermissions);
  }, [user]);

  const hasPermission = (permission: string | string[]): boolean => {
    if (Array.isArray(permission)) {
      return permission.some(p => permissions.includes(p));
    }
    
    return permissions.includes(permission);
  };

  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every(p => permissions.includes(p));
  };

  return {
    permissions,
    hasPermission,
    hasAllPermissions,
  };
}