import { descriptionSizeClasses } from "./card.styles";
import { CardDescriptionProps } from "./card.types";
import { cn } from "@/lib/utils";

export function CardDescription({
    children,
    className,
    size = 'md',
}: CardDescriptionProps) {
    return (
        <p className={cn(
            'text-gray-600 mt-1',
            descriptionSizeClasses[size],
            className
        )}>
            {children}
        </p>
    );
}