'use client';

import React, { useEffect } from 'react';
import { useToastStore } from '@/lib/store/toastStore';
import { ALERT_COLORS } from '@/lib/constants/statusColors';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        const colors = ALERT_COLORS[toast.type];

        return (
          <div
            key={toast.id}
            className={`${colors.bg} ${colors.border} border rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in`}
            role="alert"
          >
            <Icon className={`${colors.icon} w-5 h-5 flex-shrink-0 mt-0.5`} />

            <div className="flex-1">
              <p className={`${colors.text} text-sm font-medium`}>
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className={`${colors.text} hover:opacity-70 transition-opacity`}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}