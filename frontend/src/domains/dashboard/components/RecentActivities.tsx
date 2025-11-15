import React from 'react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/utils';

export interface Activity {
    id: string | number;
    title: string;
    description?: string;
    time: string | Date;
    type?: 'success' | 'info' | 'warning' | 'error';
    user?: {
        name: string;
        avatar?: string;
    };
    icon?: React.ReactNode;
}

export interface RecentActivitiesProps {
    activities: Activity[];
    title?: string;
    maxItems?: number;
    onViewAll?: () => void;
    className?: string;
}

const typeConfig = {
    success: {
        dot: 'bg-green-500',
        bg: 'bg-green-50',
        icon: (
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        )
    },
    info: {
        dot: 'bg-blue-500',
        bg: 'bg-blue-50',
        icon: (
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
        )
    },
    warning: {
        dot: 'bg-yellow-500',
        bg: 'bg-yellow-50',
        icon: (
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
        )
    },
    error: {
        dot: 'bg-red-500',
        bg: 'bg-red-50',
        icon: (
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
        )
    }
};

export default function RecentActivities({
    activities,
    title = 'Aktivitas Terbaru',
    maxItems,
    onViewAll,
    className
}: RecentActivitiesProps) {
    const displayedActivities = maxItems ? activities.slice(0, maxItems) : activities;

    const getRelativeTime = (date: string | Date) => {
        const now = new Date();
        const activityDate = typeof date === 'string' ? new Date(date) : date;
        const diffInSeconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Baru saja';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
        return formatDateTime(activityDate);
    };

    return (
        <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm', className)}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {onViewAll && (
                        <button
                            onClick={onViewAll}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                            Lihat Semua
                        </button>
                    )}
                </div>
            </div>

            {/* Activities List */}
            <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
                {displayedActivities.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-gray-500">Belum ada aktivitas</p>
                    </div>
                ) : (
                    displayedActivities.map((activity) => {
                        const config = typeConfig[activity.type || 'info'];

                        return (
                            <div
                                key={activity.id}
                                className="p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex gap-3">
                                    {/* Icon/Avatar */}
                                    <div className="flex-shrink-0">
                                        {activity.user?.avatar ? (
                                            <img
                                                src={activity.user.avatar}
                                                alt={activity.user.name}
                                                className="w-10 h-10 rounded-full"
                                            />
                                        ) : activity.icon ? (
                                            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', config.bg)}>
                                                {activity.icon}
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <div className={cn('w-2 h-2 rounded-full mt-2', config.dot)} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                            {activity.title}
                                        </p>
                                        {activity.description && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                {activity.description}
                                            </p>
                                        )}
                                        {activity.user && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                oleh {activity.user.name}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-2">
                                            {getRelativeTime(activity.time)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// Timeline variant
export function ActivityTimeline({ activities, className }: { activities: Activity[]; className?: string }) {
    return (
        <div className={cn('space-y-6', className)}>
            {activities.map((activity, index) => {
                const config = typeConfig[activity.type || 'info'];
                const isLast = index === activities.length - 1;

                return (
                    <div key={activity.id} className="relative flex gap-4">
                        {/* Timeline line */}
                        {!isLast && (
                            <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200" />
                        )}

                        {/* Dot */}
                        <div className="relative z-10 flex-shrink-0">
                            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', config.bg)}>
                                {activity.icon || config.icon}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                            <p className="text-sm font-medium text-gray-900">
                                {activity.title}
                            </p>
                            {activity.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {activity.description}
                                </p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                                {formatDateTime(activity.time)}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}