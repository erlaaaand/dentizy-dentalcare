'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from './ToastProvider';
import { ModalProvider } from './ModalProvider';

// Inisialisasi React Query Client
// Sebaiknya di luar komponen agar tidak re-init saat re-render parent
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 menit
    },
  },
});

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Centralized App Providers Wrapper
 * Membungkus aplikasi dengan semua context yang dibutuhkan:
 * 1. React Query (Data Fetching)
 * 2. Auth (User State)
 * 3. UI Feedback (Toasts, Modals)
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        {/* UI Overlays ditempatkan di sini agar bisa diakses global */}
        <ToastProvider />
        <ModalProvider />
      </AuthProvider>
    </QueryClientProvider>
  );
}