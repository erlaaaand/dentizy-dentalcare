'use client';

import React from 'react';
import { ToastProvider } from './ToastProvider';
import { ModalProvider } from './ModalProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Main providers wrapper
 * Combines all global providers (Toast, Modal, etc.)
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <ToastProvider />
      <ModalProvider />
    </>
  );
}