import { ModalFooterProps } from "./modal.types";
import { cn } from "@/core";

export function ModalFooter({ children, className, align = 'right' }: ModalFooterProps) {
    const alignClasses = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
        between: 'justify-between',
    };

    return (
        <div
            className={cn(
                'flex items-center gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl',
                alignClasses[align],
                className
            )}
        >
            {children}
        </div>
    );
}