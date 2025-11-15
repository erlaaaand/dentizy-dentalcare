import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastAction {
    label: string;
    onClick: () => void;
}

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    action?: ToastAction;
}

interface UseToastReturn {
    toasts: Toast[];
    success: (message: string, action?: ToastAction) => void;
    error: (message: string, action?: ToastAction) => void;
    warning: (message: string, action?: ToastAction) => void;
    info: (message: string, action?: ToastAction) => void;
    remove: (id: string) => void;
}

/**
 * Simple toast notification hook
 */
export function useToast(): UseToastReturn {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType, action?: ToastAction) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type, action }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 5000);
    }, []);

    const remove = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return {
        toasts,
        success: (message, action) => addToast(message, 'success', action),
        error: (message, action) => addToast(message, 'error', action),
        warning: (message, action) => addToast(message, 'warning', action),
        info: (message, action) => addToast(message, 'info', action),
        remove,
    };
}
