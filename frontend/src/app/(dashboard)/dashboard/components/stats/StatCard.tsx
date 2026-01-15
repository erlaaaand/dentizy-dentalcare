// frontend/src/features/dashboard/components/stats/StatCard.tsx

import { Card } from '@/components/ui';
import { cn } from '@/core';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { StatCardSkeleton } from './StatCardSkeleton';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
        label?: string;
    };
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';
    loading?: boolean;
}

const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
};

export function StatCard({
    title,
    value,
    icon,
    trend,
    color = 'blue',
    loading
}: StatCardProps) {
    if (loading) {
        return <StatCardSkeleton />;
    }

    return (
        <Card
            className="hover:shadow-lg transition-all duration-300 border-l-4"
            style={{ borderLeftColor: `var(--${color}-500)` }}
        >
            <Card.Body padding="lg">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-2">
                            {title}
                        </p>
                        <h3 className="text-3xl font-bold text-gray-900 mb-3">
                            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
                        </h3>

                        {trend && (
                            <div className="flex items-center gap-1.5">
                                {trend.isPositive ? (
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                )}
                                <span className={cn(
                                    'text-sm font-semibold',
                                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                                )}>
                                    {trend.value}%
                                </span>
                                {trend.label && (
                                    <span className="text-sm text-gray-500">
                                        {trend.label}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className={cn(
                        'p-3 rounded-xl border',
                        colorClasses[color]
                    )}>
                        {icon}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}