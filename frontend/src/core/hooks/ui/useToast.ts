import { useCallback } from 'react';
// Pastikan path import ini sesuai dengan lokasi file toast.store.ts Anda
import { toastStore } from '@/components/ui/feedback/toast/toast.store';

export function useToast() {
    
    const showSuccess = useCallback((message: string, duration?: number) => {
        toastStore.add('success', message, duration);
    }, []);

    const showError = useCallback((message: string, duration?: number) => {
        toastStore.add('error', message, duration);
    }, []);

    const showWarning = useCallback((message: string, duration?: number) => {
        toastStore.add('warning', message, duration);
    }, []);

    const showInfo = useCallback((message: string, duration?: number) => {
        toastStore.add('info', message, duration);
    }, []);

    const removeToast = useCallback((id: string) => {
        toastStore.remove(id);
    }, []);

    return {
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast,
    };
}