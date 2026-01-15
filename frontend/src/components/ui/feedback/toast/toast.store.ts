// src/components/toast/toast.store.ts
import { ToastMessage, ToastType } from './toast.types';

// Tipe Listener (Fungsi yang akan dijalankan saat data berubah)
type Listener = (toasts: ToastMessage[]) => void;

const DEFAULT_DURATION = 3000;

class ToastStore {
    private toasts: ToastMessage[] = [];
    private listeners: Listener[] = [];
    private timers = new Map<string, ReturnType<typeof setTimeout>>();

    // Method untuk komponen Container mendaftar (subscribe) perubahan data
    subscribe(listener: Listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    // Method internal untuk memberitahu semua listener
    private notify() {
        this.listeners.forEach((listener) => listener([...this.toasts]));
    }

    // Method Public: Tambah Toast
    add(type: ToastType, message: string, duration?: number) {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: ToastMessage = { id, type, message, duration };
         const toastDuration = duration ?? DEFAULT_DURATION;
        
        this.toasts = [...this.toasts, newToast];
        this.notify();

        if (toastDuration > 0) {
            const timer = setTimeout(() => {
                this.remove(id);
            }, toastDuration);

            this.timers.set(id, timer);
        }
    }

    // Method Public: Hapus Toast
    remove(id: string) {
        // clear timer jika ditutup manual
        const timer = this.timers.get(id);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(id);
        }

        this.toasts = this.toasts.filter((t) => t.id !== id);
        this.notify();
    }
}

export const toastStore = new ToastStore();