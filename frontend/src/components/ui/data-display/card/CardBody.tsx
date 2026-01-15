import { CardBodyProps } from "./card.types";
import { bodyPaddingClasses } from "./card.styles";
import { cn } from "@/core/utils/classnames/cn.utils";

export function CardBody({
    children,
    className,
    padding = 'none',
    noPadding = false,
}: CardBodyProps) {
    return (
        <div
            className={cn(
                !noPadding && bodyPaddingClasses[padding],
                className
            )}
        >
            {children}
        </div>
    );
}
