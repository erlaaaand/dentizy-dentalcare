import { LoadingContainerProps } from "./loading-spinner.types";
import { cn } from "@/core";

export function LoadingContainer({
    children,
    className,
    center = true,
    minHeight = '200px',
}: LoadingContainerProps) {
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