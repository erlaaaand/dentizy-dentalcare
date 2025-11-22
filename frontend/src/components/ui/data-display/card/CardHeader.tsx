import { cn } from "@/core/utils";
import { CardHeaderProps } from "./card.types";
import { headerPaddingClasses } from "./card.styles";

export function CardHeader({
    children,
    className,
    action,
    divider = false,
    padding = 'none',
}: CardHeaderProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-between',
                headerPaddingClasses[padding],
                divider && 'border-b border-gray-200 pb-4',
                className
            )}
        >
            <div className="flex-1 min-w-0">{children}</div>
            {action && <div className="flex-shrink-0 ml-4">{action}</div>}
        </div>
    );
}
