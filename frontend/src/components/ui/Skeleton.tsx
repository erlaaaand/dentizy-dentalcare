import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps {
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    className?: string;
    animated?: boolean;
}

export default function Skeleton({
    variant = 'text',
    width,
    height,
    className,
    animated = true
}: SkeletonProps) {
    const baseClasses = cn(
        'bg-gray-200',
        animated && 'animate-pulse'
    );

    const variantClasses = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-lg'
    };

    const style: React.CSSProperties = {
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'circular' ? width : undefined)
    };

    return (
        <div
            className={cn(baseClasses, variantClasses[variant], className)}
            style={style}
        />
    );
}

// Preset Skeleton Components
export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn('bg-white rounded-lg border border-gray-200 p-6 space-y-4', className)}>
            <Skeleton variant="rectangular" height={200} />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="80%" />
        </div>
    );
}

export function SkeletonAvatar({ size = 40, className }: { size?: number; className?: string }) {
    return (
        <Skeleton
            variant="circular"
            width={size}
            height={size}
            className={className}
        />
    );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    width={i === lines - 1 ? '80%' : '100%'}
                />
            ))}
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {Array.from({ length: cols }).map((_, i) => (
                            <th key={i} className="px-6 py-3">
                                <Skeleton variant="text" width="60%" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            {Array.from({ length: cols }).map((_, colIndex) => (
                                <td key={colIndex} className="px-6 py-4">
                                    <Skeleton variant="text" />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}