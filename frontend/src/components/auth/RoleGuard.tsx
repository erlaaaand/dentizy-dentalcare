'use client';

import { useAuthStore, UserRole } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ReactNode } from 'react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallbackPath?: string;
}

/**
 * Component untuk protect entire page/section berdasarkan role
 * Usage: <RoleGuard allowedRoles={[UserRole.KEPALA_KLINIK]}>...</RoleGuard>
 */
export function RoleGuard({ 
  allowedRoles, 
  children, 
  fallbackPath = '/dashboard' 
}: RoleGuardProps) {
  const user = useAuthStore(state => state.user);
  const router = useRouter();
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    const hasAccess = allowedRoles.some(role => 
      user.roles.includes(role)
    );
    
    if (!hasAccess) {
      router.push(fallbackPath);
    }
  }, [user, allowedRoles, router, fallbackPath]);
  
  if (!user) return null;
  
  const hasAccess = allowedRoles.some(role => 
    user.roles.includes(role)
  );
  
  if (!hasAccess) return null;
  
  return <>{children}</>;
}