import { cn } from "@/core";
import { StatusIndicatorGroupProps } from "./status-indicator.types";

export function StatusIndicatorGroup({
    children,
    className,
    direction = 'horizontal',
    gap = 'md',
    align = 'start',
}: StatusIndicatorGroupProps) {
    const gapClasses = {
        none: 'gap-0',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
    };

    const alignClasses = {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
    };

    return (
        <div
            className={cn(
                'flex',
                direction === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
                gapClasses[gap],
                alignClasses[align],
                className
            )}
        >
            {children}
        </div>
    );
}
