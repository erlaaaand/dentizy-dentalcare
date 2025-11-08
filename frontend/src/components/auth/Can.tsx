'use client';

import React from 'react';
import { usePermission } from '@/lib/hooks/usePermission';
import { Permission } from '@/lib/permissions';

interface CanProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Component to guard content based on permissions
 */
export function Can({ 
  children, 
  permission, 
  permissions, 
  requireAll = false, 
  fallback = null 
}: CanProps) {
  const { can, canAny, canAll } = usePermission();
  
  let hasPermission = false;
  
  if (permission) {
    hasPermission = can(permission);
  } else if (permissions) {
    hasPermission = requireAll ? canAll(permissions) : canAny(permissions);
  }
  
  if (!hasPermission) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}