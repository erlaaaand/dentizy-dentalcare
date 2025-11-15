import { CompactPageHeaderProps } from "./page-header.types";
import { cn } from "@/core/utils";
import { CloseIcon } from "./Icon.styles";

export function CompactPageHeader({
    title,
    subtitle,
    onClose,
    className,
    showBorder = true,
}: CompactPageHeaderProps) {
    return (
        <div className={cn(
            'flex items-start justify-between pb-4',
            showBorder && 'border-b border-gray-200',
            className
        )}>
            <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-900 truncate">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-1 text-sm text-gray-500">
                        {subtitle}
                    </p>
                )}
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="ml-4 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    aria-label="Close"
                >
                    <CloseIcon />
                </button>
            )}
        </div>
    );
}