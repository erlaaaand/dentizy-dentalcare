// frontend/src/features/dashboard/components/stats/StatCardSkeleton.tsx

import { Card, Skeleton } from '@/components/ui';

export function StatCardSkeleton() {
    return (
        <Card className="border-l-4 border-gray-200">
            <Card.Body padding="lg">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-14 w-14 rounded-xl" />
                </div>
            </Card.Body>
        </Card>
    );
}