import { SkeletonTextProps } from "./skeleton.types";
import { cn } from "@/core";
import Skeleton from "./Skeleton";

export function SkeletonText({
    lines = 3,
    className,
    randomWidths = true,
    gap = 'md',
}: SkeletonTextProps) {
    const gapClasses = {
        sm: 'space-y-1',
        md: 'space-y-2',
        lg: 'space-y-3',
    };

    const getRandomWidth = (index: number, total: number) => {
        if (!randomWidths) return '100%';

        const widths = ['100%', '90%', '80%', '70%', '60%'];
        // Last line is usually shorter
        if (index === total - 1) {
            return widths[Math.floor(Math.random() * 2) + 3]; // 60% or 70%
        }
        return widths[Math.floor(Math.random() * widths.length)];
    };

    return (
        <div className={cn(gapClasses[gap], className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    width={getRandomWidth(i, lines)}
                    shimmer={i === 0}
                />
            ))}
        </div>
    );
}