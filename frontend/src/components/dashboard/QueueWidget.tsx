import React from 'react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
        label?: string;
    };
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
    onClick?: () => void;
    className?: string;
}

const colorClasses = {
    blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        icon: 'text-blue-600'
    },
    green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        icon: 'text-green-600'
    },
    yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        icon: 'text-yellow-600'
    },
    red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        icon: 'text-red-600'
    },
    purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        icon: 'text-purple-600'
    },
    indigo: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-600',
        icon: 'text-indigo-600'
    }
};

export default function StatCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    color = 'blue',
    onClick,
    className
}: StatCardProps) {
    const colors = colorClasses[color];

    return (
        <div
            onClick={onClick}
            className={cn(
                'bg-white rounded-lg border border-gray-200 p-6 shadow-sm transition-all',
                onClick && 'cursor-pointer hover:shadow-md hover:scale-105',
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <p className="text-sm font-medium text-gray-600 mb-1 truncate">
                        {title}
                    </p>

                    {/* Value */}
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                        {value}
                    </p>

                    {/* Subtitle or Trend */}
                    {subtitle && !trend && (
                        <p className="text-sm text-gray-500">
                            {subtitle}
                        </p>
                    )}

                    {trend && (
                        <div className="flex items-center gap-1">
                            {trend.isPositive ? (
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                                </svg>
                            )}
                            <span className={cn(
                                'text-sm font-medium',
                                trend.isPositive ? 'text-green-600' : 'text-red-600'
                            )}>
                                {trend.value}%
                            </span>
                            {trend.label && (
                                <span className="text-sm text-gray-500 ml-1">
                                    {trend.label}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Icon */}
                {icon && (
                    <div className={cn('p-3 rounded-full', colors.bg)}>
                        <div className={cn('w-6 h-6', colors.icon)}>
                            {icon}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Compact Stat Card
export interface CompactStatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
    className?: string;
}

export function CompactStatCard({
    label,
    value,
    icon,
    color = 'blue',
    className
}: CompactStatCardProps) {
    const colors = colorClasses[color];

    return (
        <div className={cn('flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200', className)}>
            {icon && (
                <div className={cn('p-2 rounded-lg', colors.bg)}>
                    <div className={cn('w-5 h-5', colors.icon)}>
                        {icon}
                    </div>
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}