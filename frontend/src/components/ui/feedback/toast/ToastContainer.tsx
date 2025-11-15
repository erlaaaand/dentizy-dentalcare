import { ToastContainerProps } from "./toast.types";
import { positionClasses } from './toast.styles'
import { cn } from "@/core/utils";

export function ToastContainer({
    children,
    position = 'top-right',
    className,
}: ToastContainerProps) {
    return (
        <div
            className={cn(
                'fixed z-50 flex flex-col gap-3 max-w-sm w-full',
                positionClasses[position],
                className
            )}
        >
            {children}
        </div>
    );
}