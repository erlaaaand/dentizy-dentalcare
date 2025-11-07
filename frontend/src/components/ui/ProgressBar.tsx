import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
    value: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
    showLabel?: boolean;
    label?: string;
    animated?: boolean;
    striped?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
};

const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600'
};

export default function ProgressBar({
    value,
    max = 100,
    size = 'md',
    color = 'blue',
    showLabel = false,
    label,
    animated = false,
    striped = false,
    className
}: ProgressBarProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className={cn('w-full', className)}>
            {(showLabel || label) && (
                <div className="flex items-center justify-between mb-1">
                    {label && (
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                    )}
                    {showLabel && (
                        <span className="text-sm font-medium text-gray-700">
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            )}

            <div
                className={cn(
                    'w-full bg-gray-200 rounded-full overflow-hidden',
                    sizeClasses[size]
                )}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
            >
                <div
                    className={cn(
                        'h-full transition-all duration-300 ease-out rounded-full',
                        colorClasses[color],
                        striped && 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_100%]',
                        animated && striped && 'animate-[progress-stripes_1s_linear_infinite]'
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

// Circular Progress
export interface CircularProgressProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
    showLabel?: boolean;
    className?: string;
}

const circularColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
};

export function CircularProgress({
    value,
    max = 100,
    size = 80,
    strokeWidth = 8,
    color = 'blue',
    showLabel = true,
    className
}: CircularProgressProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className={cn('relative inline-flex items-center justify-center', className)}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-gray-200"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={cn('transition-all duration-300', circularColorClasses[color])}
                />
            </svg>
            {showLabel && (
                <span className="absolute text-sm font-semibold text-gray-700">
                    {Math.round(percentage)}%
                </span>
            )}
        </div>
    );
}