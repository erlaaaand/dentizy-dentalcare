import { SkeletonAvatar } from "./SkeletonAvatar";
import Skeleton from "./Skeleton";
import { cn } from "@/core";
import { SkeletonText } from "./SkeletonText";

// Profile Skeleton
export function SkeletonProfile({ className }: { className?: string }) {
    return (
        <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
            <div className="flex items-start space-x-4">
                <SkeletonAvatar size="lg" />
                <div className="flex-1 space-y-3">
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="60%" />
                    <div className="flex gap-2">
                        <Skeleton variant="rounded" width={80} height={24} />
                        <Skeleton variant="rounded" width={100} height={24} />
                    </div>
                </div>
            </div>
            <div className="mt-6 space-y-4">
                <SkeletonText lines={4} />
            </div>
        </div>
    );
}