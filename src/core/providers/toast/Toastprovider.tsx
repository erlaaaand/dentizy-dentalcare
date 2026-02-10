'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toastStore } from '@/src/core/hooks/toasts/toast.stores';
import type { ToastMessage } from '@/src/core/types/toasts/toast.types';

// ==================== TYPES ====================

interface ToastContextType {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

// ==================== CONTEXT ====================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ==================== PROVIDER ====================

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    // Subscribe ke toastStore agar provider selalu sinkron
    const unsubscribe = toastStore.subscribe((updatedToasts) => {
      setToasts(updatedToasts);
    });

    return () => unsubscribe();
  }, []);

  const removeToast = (id: string) => {
    toastStore.remove(id);
  };

  return (
    <ToastContext.Provider value={{ toasts, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// ==================== TOAST CONTAINER UI ====================

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const TOAST_STYLES: Record<string, string> = {
  success: 'bg-green-50 border-green-500 text-green-800',
  error: 'bg-red-50 border-red-500 text-red-800',
  warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
  info: 'bg-blue-50 border-blue-500 text-blue-800',
};

const TOAST_ICONS: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const styleClass = TOAST_STYLES[toast.type] ?? TOAST_STYLES.info;
  const icon = TOAST_ICONS[toast.type] ?? TOAST_ICONS.info;

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-[400px]
        border-l-4 rounded-md px-4 py-3 shadow-md animate-in slide-in-from-right-5
        ${styleClass}`}
    >
      <span className="text-sm font-bold mt-0.5">{icon}</span>
      <p className="text-sm flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Tutup notifikasi"
        className="text-current opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

export function useToastContext(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToastContext harus digunakan di dalam ToastProvider');
  }
  return ctx;
}