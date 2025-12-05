'use client';

import React, { useState, useEffect } from 'react';
import { ToastContainerProps, ToastMessage } from "./toast.types";
import { positionClasses, animationClasses } from './toast.styles'; // [FIX] Import animationClasses
import { cn } from "@/core";
import { Toast } from './Toast';
import { toastStore } from './toast.store';

export function ToastContainer({
    position = 'top-right',
    className,
}: ToastContainerProps) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        // Subscribe ke global store
        const unsubscribe = toastStore.subscribe((updatedToasts) => {
            // [FIX] Gunakan spread operator [...] untuk membuat array baru
            // Ini memastikan React mendeteksi perubahan state dan melakukan re-render
            setToasts([...updatedToasts]);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div
            className={cn(
                'fixed z-[9999] flex flex-col gap-3 max-w-sm w-full p-4 pointer-events-none', 
                positionClasses[position], // Mengatur posisi (kanan/kiri/atas/bawah)
                className
            )}
        >
            {toasts.map((toast) => (
                <div 
                    key={toast.id} 
                    // [FIX] Gunakan animationClasses berdasarkan posisi agar arah animasi benar
                    className={cn(
                        "pointer-events-auto transition-all duration-300",
                        animationClasses[position] 
                    )}
                >
                    <Toast
                        id={toast.id}
                        type={toast.type}
                        message={toast.message}
                        duration={toast.duration}
                        onClose={(id) => toastStore.remove(id)}
                    />
                </div>
            ))}
        </div>
    );
}