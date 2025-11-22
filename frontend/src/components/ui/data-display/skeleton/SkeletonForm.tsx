import Skeleton from "./Skeleton";
import { cn } from "@/core/utils";

// Form Skeleton
export function SkeletonForm({ fields = 4, className }: { fields?: number; className?: string }) {
    return (
        <div className={cn('bg-white rounded-lg border border-gray-200 p-6 space-y-6', className)}>
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton variant="text" width="30%" />
                    <Skeleton variant="rectangular" height={40} className="rounded-md" />
                </div>
            ))}
            <div className="flex gap-3 pt-4">
                <Skeleton variant="rounded" width={100} height={40} />
                <Skeleton variant="rounded" width={80} height={40} />
            </div>
        </div>
    );
}