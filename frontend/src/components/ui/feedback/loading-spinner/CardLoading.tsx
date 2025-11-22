import { CardLoadingProps } from "./loading-spinner.types";
import { cn } from "@/core";

export function CardLoading({
    variant = 'default',
    showImage = true,
    showActions = true,
}: CardLoadingProps) {
    const isCompact = variant === 'compact';
    const isDetailed = variant === 'detailed';

    return (
        <div className={cn(
            'bg-white rounded-lg border border-gray-200 overflow-hidden',
            isCompact ? 'p-4' : 'p-6'
        )}>
            {showImage && (
                <div className="h-32 bg-gray-200 rounded-lg animate-pulse mb-4" />
            )}

            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />

                {isDetailed && (
                    <>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                        <div className="flex gap-2 mt-4">
                            <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
                            <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
                        </div>
                    </>
                )}

                {showActions && (
                    <div className={cn(
                        'flex gap-2 pt-3',
                        isCompact ? 'justify-between' : 'justify-end'
                    )}>
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
                    </div>
                )}
            </div>
        </div>
    );
}