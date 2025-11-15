'use client';

import { useAuthStore, UserRole } from '@/stores/authStore';

export function useRole() {
  const { hasRole, isKepalaKlinik, isDokter, isStaf } = useAuthStore();
  
  return {
    hasRole,
    isKepalaKlinik,
    isDokter,
    isStaf,
  };
}