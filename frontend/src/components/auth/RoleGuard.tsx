'use client';

import React from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { UserRole } from '@/types/api';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Component to guard content based on user roles
 */
export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { user, hasRole } = useAuthStore();
  
  if (!user) {
    return <>{fallback}</>;
  }
  
  const hasAccess = allowedRoles.some(role => hasRole(role));
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}