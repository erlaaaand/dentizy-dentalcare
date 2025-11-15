import { cn } from "@/lib/utils";
import { TableFooterProps } from "./table.types";

export function TableFooter({ children, className }: TableFooterProps) {
    return (
        <div className={cn('flex items-center justify-between p-4 bg-gray-50 border-t border-gray-200', className)}>
            {children}
        </div>
    );
}
