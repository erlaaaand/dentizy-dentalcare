import React from 'react';
import { cn } from '@/lib/utils';

export interface QuickAction {
    id: string;
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
    onClick: () => void;
    badge?: string | number;
}

export interface QuickActionsProps {
    actions: QuickAction[];
    title?: string;
    columns?: 2 | 3 | 4;
    className?: string;
}

const colorClasses = {
    blue: {
        border: 'border-blue-500',
        bg: 'bg-blue-100',
        icon: 'text-blue-600',
        hover: 'hover:border-blue-600'
    },
    green: {
        border: 'border-green-500',
        bg: 'bg-green-100',
        icon: 'text-green-600',
        hover: 'hover:border-green-600'
    },
    yellow: {
        border: 'border-yellow-500',
        bg: 'bg-yellow-100',
        icon: 'text-yellow-600',
        hover: 'hover:border-yellow-600'
    },
    red: {
        border: 'border-red-500',
        bg: 'bg-red-100',
        icon: 'text-red-600',
        hover: 'hover:border-red-600'
    },
    purple: {
        border: 'border-purple-500',
        bg: 'bg-purple-100',
        icon: 'text-purple-600',
        hover: 'hover:border-purple-600'
    },
    indigo: {
        border: 'border-indigo-500',
        bg: 'bg-indigo-100',
        icon: 'text-indigo-600',
        hover: 'hover:border-indigo-600'
    }
};

const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
};

export default function QuickActions({
    actions,
    title = 'Aksi Cepat',
    columns = 4,
    className
}: QuickActionsProps) {
    return (
        <div className={cn('', className)}>
            {title && (
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {title}
                </h2>
            )}

            <div className={cn('grid gap-4', columnClasses[columns])}>
                {actions.map((action) => {
                    const colors = colorClasses[action.color || 'blue'];

                    return (
                        <button
                            key={action.id}
                            onClick={action.onClick}
                            className={cn(
                                'relative bg-white p-6 rounded-lg border-l-4 shadow-sm transition-all',
                                'hover:shadow-md hover:-translate-y-1',
                                colors.border,
                                colors.hover
                            )}
                        >
                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className={cn('p-2 rounded-lg flex-shrink-0', colors.bg)}>
                                    <div className={cn('w-6 h-6', colors.icon)}>
                                        {action.icon}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 text-left min-w-0">
                                    <h3 className="font-semibold text-gray-900">
                                        {action.title}
                                    </h3>
                                    {action.subtitle && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {action.subtitle}
                                        </p>
                                    )}
                                </div>

                                {/* Badge */}
                                {action.badge !== undefined && (
                                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {action.badge}
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// Compact Quick Actions (Icon Only)
export interface CompactQuickActionsProps {
    actions: QuickAction[];
    className?: string;
}

export function CompactQuickActions({ actions, className }: CompactQuickActionsProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            {actions.map((action) => {
                const colors = colorClasses[action.color || 'blue'];

                return (
                    <button
                        key={action.id}
                        onClick={action.onClick}
                        className={cn(
                            'relative p-3 rounded-lg transition-all',
                            colors.bg,
                            colors.icon,
                            'hover:shadow-md hover:scale-110'
                        )}
                        title={action.title}
                    >
                        <div className="w-5 h-5">
                            {action.icon}
                        </div>
                        {action.badge !== undefined && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                {action.badge}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}