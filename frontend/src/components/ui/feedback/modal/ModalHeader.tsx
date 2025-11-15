import { ModalHeaderProps } from "./modal.types";
import { cn } from "@/core/utils";
import { X } from "lucide-react";

export function ModalHeader({
    children,
    className,
    showCloseButton = true,
    onClose
}: ModalHeaderProps) {
    return (
        <div className={cn('flex items-start justify-between p-6 border-b border-gray-200', className)}>
            <div className="flex-1 min-w-0">
                {children}
            </div>
            {showCloseButton && onClose && (
                <button
                    onClick={onClose}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}