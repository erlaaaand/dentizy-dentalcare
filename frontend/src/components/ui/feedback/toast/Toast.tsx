'use client';

import React, { useEffect } from 'react';
import { cn } from '@/core';
import type { ToastProps } from './toast.types';
import { sizeClasses, toastTypes } from './toast.styles'; // Hapus animationClasses
import { ToastIcons } from './toast.icon';

export function Toast({
    id, message, type = 'info', variant = 'default', size = 'md',
    duration = 5000, showIcon = true, showClose = true, 
    action, onClose, className,
    // Hapus prop 'position' dari sini karena tidak dipakai untuk styling card
}: ToastProps) {
    
    const sizeClass = sizeClasses[size];
    const toastType = toastTypes[type];

    // Auto-close logic
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => onClose(id), duration);
            return () => clearTimeout(timer);
        }
    }, [duration, id, onClose]);

    const getVariantClasses = () => {
        switch (variant) {
            case 'filled': return toastType.filled;
            case 'outlined': return toastType.outlined;
            default: return toastType.base;
        }
    };

    return (
        <div
            className={cn(
                'flex items-start gap-3 rounded-lg border shadow-lg pointer-events-auto', // pointer-events-auto penting
                getVariantClasses(), 
                sizeClass.container, 
                className
            )}
            role="alert"
        >
            {showIcon && (
                <div className={cn(
                    'flex-shrink-0 mt-0.5 w-5 h-5',
                    variant === 'filled' ? 'text-white' : toastType.icon
                )}>
                    {ToastIcons[type]}
                </div>
            )}

            <div className="flex-1 min-w-0">
                <p className={cn('font-medium', sizeClass.message)}>{message}</p>
                {action && (
                    <div className="mt-2">
                        <button
                            onClick={action.onClick}
                            className={cn(
                                'text-sm font-medium underline underline-offset-2 transition-colors',
                                variant === 'filled'
                                    ? 'text-white/90 hover:text-white'
                                    : 'hover:text-opacity-80'
                            )}
                        >
                            {action.label}
                        </button>
                    </div>
                )}
            </div>

            {showClose && (
                <button
                    onClick={() => onClose(id)}
                    className={cn(
                        'flex-shrink-0 transition-colors mt-0.5',
                        variant === 'filled'
                            ? 'text-white/70 hover:text-white'
                            : 'text-gray-400 hover:text-gray-600'
                    )}
                >
                    <svg className={sizeClass.close} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414-1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
        </div>
    );
}