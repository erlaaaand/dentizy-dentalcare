import { ModalBodyProps } from "./modal.types";
import { cn } from "@/core/utils";

export function ModalBody({ children, className, scrollable = true }: ModalBodyProps) {
    return (
        <div
            className={cn(
                'p-6',
                scrollable && 'overflow-y-auto max-h-96',
                className
            )}
        >
            {children}
        </div>
    );
}
