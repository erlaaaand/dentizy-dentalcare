"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/src/core/providers/AuthProvider';
import { ROUTES } from '@/src/core/constants/routes.constants';
import { getRoleKey } from '@/src/core/constants/navigation.constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const loginUrl = `${ROUTES.LOGIN}?redirect=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0 && user) {
      const userRoleKey = getRoleKey(user.roles[0].name);
      
      if (!userRoleKey || !allowedRoles.includes(userRoleKey)) {
        router.replace(ROUTES.DASHBOARD);
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && user) {
    const userRoleKey = getRoleKey(user.roles[0].name);
    if (!userRoleKey || !allowedRoles.includes(userRoleKey)) {
      return null;
    }
  }

  return <>{children}</>;
}