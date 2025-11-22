'use client';

import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

import { useToast, cn } from '@/core';

// Mapping Icon
const ICON_MAP = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_VARIANTS = {
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    text: 'text-green-800',
    close: 'text-green-600 hover:bg-green-100',
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    text: 'text-red-800',
    close: 'text-red-600 hover:bg-red-100',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-600',
    text: 'text-yellow-800',
    close: 'text-yellow-600 hover:bg-yellow-100',
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-800',
    close: 'text-blue-600 hover:bg-blue-100',
  },
};

export function ToastProvider() {
  // ✅ Menggunakan Hook dari Core
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-full max-w-md pointer-events-none pr-4 pl-4 md:p-0">
      {toasts.map((toast) => {
        const Icon = ICON_MAP[toast.type] || Info;
        const styles = TOAST_VARIANTS[toast.type] || TOAST_VARIANTS.info;

        return (
          <div
            key={toast.id}
            // ✅ Menggunakan 'cn' untuk merging class yang aman (Best Practice)
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 animate-slide-in",
              styles.container
            )}
            role="alert"
          >
            <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", styles.icon)} />

            <div className="flex-1">
              <p className={cn("text-sm font-medium leading-5", styles.text)}>
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className={cn(
                "p-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1",
                styles.close
              )}
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}