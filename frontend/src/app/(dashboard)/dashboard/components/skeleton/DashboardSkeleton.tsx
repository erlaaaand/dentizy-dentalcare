// frontend/src/app/(dashboard)/dashboard/components/DashboardSkeleton.tsx
'use client';

import { Skeleton } from '@/components/ui';

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-6 w-full min-h-screen pb-24 animate-in fade-in duration-500">
            {/* Welcome Banner Skeleton */}
            <Skeleton className="h-32 w-full rounded-xl" />

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-96 w-full rounded-xl" />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}