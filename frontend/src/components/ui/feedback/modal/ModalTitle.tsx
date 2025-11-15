import { ModalTitleProps } from "./modal.types";
import { cn } from "@/core/utils";

export function ModalTitle({ children, className, as: Component = 'h3' }: ModalTitleProps) {
    return (
        <Component className={cn('text-xl font-semibold text-gray-900', className)}>
            {children}
        </Component>
    );
}