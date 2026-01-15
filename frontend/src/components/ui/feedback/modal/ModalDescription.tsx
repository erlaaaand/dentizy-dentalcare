import { ModalDescriptionProps } from "./modal.types";
import { cn } from "@/core";

export function ModalDescription({ children, className }: ModalDescriptionProps) {
    return (
        <p className={cn('text-sm text-gray-500 mt-2', className)}>
            {children}
        </p>
    );
}