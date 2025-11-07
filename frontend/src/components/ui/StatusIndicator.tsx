import React from 'react';
import { cn } from '@/lib/utils';

export interface StatusIndicatorProps {
    status: 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning';
    label?: string;
    showDot?: boolean;
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
    className?: string;
}

const statusConfig = {
    active: {
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Aktif'
    },
    inactive: {
        color: 'bg-gray-500',
        textColor: 'text-gray-700',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        label: 'Nonaktif'
    },
    pending: {
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'Menunggu'
    },
    success: {
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Berhasil'
    },
    error: {
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Gagal'
    },
    warning: {
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        label: 'Peringatan'
    }
};

const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
};

export default function StatusIndicator({
    status,
    label,
    showDot = true,
    size = 'md',
    animated = false,
    className
}: StatusIndicatorProps) {
    const config = statusConfig[status];
    const displayLabel = label || config.label;

    if (!showDot && !label) {
        return (
            <span
                className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    config.bgColor,
                    config.textColor,
                    config.borderColor,
                    className
                )}
            >
                {displayLabel}
            </span>
        );
    }

    return (
        <div className={cn('inline-flex items-center gap-2', className)}>
            {showDot && (
                <span className="relative inline-flex">
                    <span
                        className={cn(
                            'rounded-full',
                            sizeClasses[size],
                            config.color
                        )}
                    />
                    {animated && (
                        <span
                            className={cn(
                                'absolute inset-0 rounded-full animate-ping opacity-75',
                                config.color
                            )}
                        />
                    )}
                </span>
            )}
            {displayLabel && (
                <span className={cn('text-sm font-medium', config.textColor)}>
                    {displayLabel}
                </span>
            )}
        </div>
    );
}