import { SkeletonCardProps } from "./skeleton.types";
import { cn } from "@/core/utils";
import Skeleton from "./Skeleton";

export function SkeletonCard({
    className,
    variant = 'default',
    hasImage = true,
    hasActions = true,
}: SkeletonCardProps) {
    const isCompact = variant === 'compact';
    const isDetailed = variant === 'detailed';

    return (
        <div
            className={cn(
                'bg-white rounded-lg border border-gray-200 overflow-hidden',
                isCompact ? 'p-4' : 'p-6',
                className
            )}
        >
            {hasImage && (
                <Skeleton
                    variant="rectangular"
                    height={isCompact ? 120 : 200}
                    className="mb-4"
                    shimmer
                />
            )}

            <div className="space-y-3">
                <Skeleton variant="text" width={isCompact ? '70%' : '60%'} />
                <Skeleton variant="text" width={isCompact ? '90%' : '100%'} />
                <Skeleton variant="text" width={isCompact ? '80%' : '90%'} />

                {isDetailed && (
                    <>
                        <Skeleton variant="text" width="50%" />
                        <div className="flex gap-2 mt-4">
                            <Skeleton variant="rounded" width={60} height={24} />
                            <Skeleton variant="rounded" width={80} height={24} />
                        </div>
                    </>
                )}

                {hasActions && (
                    <div className={cn(
                        'flex gap-2 pt-3',
                        isCompact ? 'justify-between' : 'justify-end'
                    )}>
                        <Skeleton variant="rounded" width={80} height={32} />
                        <Skeleton variant="rounded" width={100} height={32} />
                    </div>
                )}
            </div>
        </div>
    );
}