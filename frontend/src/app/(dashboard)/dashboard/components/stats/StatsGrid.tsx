// frontend/src/features/dashboard/components/stats/StatsGrid.tsx

import { StatCard } from './StatCard';
import { StatCardData } from '../../types/dashboard.types';

interface StatsGridProps {
    stats: StatCardData[];
    loading?: boolean;
}

export function StatsGrid({ stats, loading }: StatsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <StatCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    trend={stat.trend}
                    color={stat.color}
                    loading={loading}
                />
            ))}
        </div>
    );
}