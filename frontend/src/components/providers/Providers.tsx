'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // 1. Import ini
import { ToastProvider } from './ToastProvider';
import { ModalProvider } from './ModalProvider';
import { AuthProvider } from './AuthProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // 2. Buat instance QueryClient. 
  // Menggunakan useState agar client tidak dibuat ulang setiap kali komponen re-render.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Opsional: konfigurasi default agar tidak terlalu agresif refetching
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    // 3. Bungkus AuthProvider dengan QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <ToastProvider />
        <ModalProvider />
      </AuthProvider>
    </QueryClientProvider>
  );
}