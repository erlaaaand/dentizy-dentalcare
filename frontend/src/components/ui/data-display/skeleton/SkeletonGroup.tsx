import { SkeletonGroupProps } from "./skeleton.types";
import { gapClasses } from "./skeleton.styles";
import { cn } from "@/lib/utils";

export function SkeletonGroup({
    children,
    className,
    gap = 'md',
    direction = 'vertical',
}: SkeletonGroupProps) {
    return (
        <div
            className={cn(
                'flex',
                direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
                gapClasses[gap],
                className
            )}
        >
            {children}
        </div>
    );
}