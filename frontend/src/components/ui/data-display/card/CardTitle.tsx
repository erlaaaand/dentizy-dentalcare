import { CardTitleProps } from "./card.types";
import { cn } from "@/core/utils";
import { titleSizeClasses } from "./card.styles";

export function CardTitle({
    children,
    className,
    as: Component = 'h3',
    size = 'md',
}: CardTitleProps) {
    return (
        <Component className={cn(
            'text-gray-900 font-semibold leading-6',
            titleSizeClasses[size],
            className
        )}>
            {children}
        </Component>
    );
}