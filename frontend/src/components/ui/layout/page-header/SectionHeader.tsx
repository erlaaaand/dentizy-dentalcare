// ============================================
// SECTION HEADER COMPONENT (for sub-sections)
// ============================================

import { SectionHeaderProps } from "./page-header.types";
import { cn } from "@/core";

export function SectionHeader({
    title,
    description,
    actions,
    className,
}: SectionHeaderProps) {
    return (
        <div className={cn('flex items-center justify-between mb-6', className)}>
            <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {title}
                </h2>
                {description && (
                    <p className="mt-1 text-sm text-gray-600 max-w-3xl">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex-shrink-0 flex items-center gap-3 ml-4">
                    {actions}
                </div>
            )}
        </div>
    );
}