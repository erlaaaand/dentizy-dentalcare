import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
    return (
        <div className={cn("relative", className)}>
            <div className={cn(
                "animate-spin rounded-full border-gray-200",
                sizeClasses[size]
            )} />
            <div className={cn(
                "animate-spin rounded-full border-blue-600 border-t-transparent absolute top-0 left-0",
                sizeClasses[size]
            )} />
        </div>
    );
}