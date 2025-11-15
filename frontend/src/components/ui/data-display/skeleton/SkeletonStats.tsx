import { cn } from "@/lib/utils";
import Skeleton from "./Skeleton";

// Dashboard Stats Skeleton
export function SkeletonStats({ cards = 4, className }: { cards?: number; className?: string }) {
    return (
        <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
            {Array.from({ length: cards }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="text" width="40%" className="text-2xl" />
                        </div>
                        <Skeleton variant="circular" width={48} height={48} className="bg-blue-100" />
                    </div>
                    <div className="mt-4">
                        <Skeleton variant="text" width="70%" />
                    </div>
                </div>
            ))}
        </div>
    );
}
