import { CardFooterProps } from "./card.types";
import { footerAlignClasses, footerPaddingClasses } from "./card.styles";
import { cn } from "@/core";

export function CardFooter({
    children,
    className,
    divider = true,
    padding = 'none',
    align = 'between',
}: CardFooterProps) {
    return (
        <div
            className={cn(
                'flex items-center',
                footerAlignClasses[align],
                footerPaddingClasses[padding],
                divider && 'border-t border-gray-200 pt-4',
                className
            )}
        >
            {children}
        </div>
    );
}
