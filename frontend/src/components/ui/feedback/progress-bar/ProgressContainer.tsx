import { ProgressContainerProps } from "./progress-bar.types";
import { cn } from "@/core";

export function ProgressContainer({
    children,
    className,
    center = true,
    minHeight = '200px',
}: ProgressContainerProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-center',
                center && 'w-full',
                className
            )}
            style={{ minHeight }}
        >
            {children}
        </div>
    );
}