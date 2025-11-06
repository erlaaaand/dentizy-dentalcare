'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { hasPermission, Permission } from '@/lib/permissions';
import { ReactNode } from 'react';

interface CanProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component untuk conditional rendering berdasarkan permission
 * Usage: <Can permission="patients:create">...</Can>
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  const user = useAuthStore(state => state.user);
  
  if (!user) return <>{fallback}</>;
  
  const allowed = hasPermission(user.roles, permission);
  
  return <>{allowed ? children : fallback}</>;
}

interface CanAnyProps {
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component untuk conditional rendering jika user punya salah satu permission
 */
export function CanAny({ permissions, children, fallback = null }: CanAnyProps) {
  const user = useAuthStore(state => state.user);
  
  if (!user) return <>{fallback}</>;
  
  const allowed = permissions.some(permission => 
    hasPermission(user.roles, permission)
  );
  
  return <>{allowed ? children : fallback}</>;
}