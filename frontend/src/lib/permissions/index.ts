import { UserRole } from '@/lib/store/authStore';

export type Permission = 
  | 'appointments:view:all'
  | 'appointments:view:own'
  | 'appointments:create'
  | 'appointments:update'
  | 'appointments:complete'
  | 'appointments:cancel'
  | 'appointments:delete'
  | 'patients:view'
  | 'patients:create'
  | 'patients:update'
  | 'patients:delete'
  | 'medical-records:view:all'
  | 'medical-records:view:own'
  | 'medical-records:create'
  | 'medical-records:update'
  | 'medical-records:delete'
  | 'users:manage'
  | 'reports:view:all'
  | 'reports:view:own'
  | 'settings:system'
  | 'notifications:view';

// Permission mapping per role
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.KEPALA_KLINIK]: [
    'appointments:view:all',
    'appointments:create',
    'appointments:update',
    'appointments:complete',
    'appointments:cancel',
    'appointments:delete',
    'patients:view',
    'patients:create',
    'patients:update',
    'patients:delete',
    'medical-records:view:all',
    'medical-records:create',
    'medical-records:update',
    'medical-records:delete',
    'users:manage',
    'reports:view:all',
    'settings:system',
    'notifications:view',
  ],
  
  [UserRole.DOKTER]: [
    'appointments:view:own',
    'appointments:complete',
    'appointments:cancel',
    'patients:view',
    'medical-records:view:own',
    'medical-records:create',
    'medical-records:update',
    'reports:view:own',
  ],
  
  [UserRole.STAF]: [
    'appointments:view:all',
    'appointments:create',
    'appointments:update',
    'appointments:cancel',
    'patients:view',
    'patients:create',
    'patients:update',
    'medical-records:view:all',
    'medical-records:create',
    'medical-records:update',
    'notifications:view',
  ],
};

export function hasPermission(
  userRoles: UserRole[],
  permission: Permission
): boolean {
  return userRoles.some(role => 
    ROLE_PERMISSIONS[role]?.includes(permission)
  );
}

export function hasAnyPermission(
  userRoles: UserRole[],
  permissions: Permission[]
): boolean {
  return permissions.some(permission => 
    hasPermission(userRoles, permission)
  );
}

export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}