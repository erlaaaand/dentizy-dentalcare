import { BreadcrumbItemComponentProps } from "./breadcrumb.types";
import Link from "next/link";
import { cn } from "@/core";
import { sizeClasses, variantClasses } from "./breadcrumb.styles";

export function BreadcrumbItem({
    children,
    href,
    icon,
    isCurrent = false,
    size = 'md',
    variant = 'default',
}: BreadcrumbItemComponentProps) {
    const sizeClass = sizeClasses[size];
    const variantClass = variantClasses[variant];

    const content = (
        <>
            {icon && (
                <span className={cn('flex-shrink-0', sizeClass.icon)}>
                    {icon}
                </span>
            )}
            <span>{children}</span>
        </>
    );

    if (href && !isCurrent) {
        return (
            <Link
                href={href}
                className={cn(
                    'flex items-center gap-1.5 font-medium transition-colors',
                    sizeClass.item,
                    variantClass.link
                )}
                aria-current={isCurrent ? 'page' : undefined}
            >
                {content}
            </Link>
        );
    }

    return (
        <span
            className={cn(
                'flex items-center gap-1.5 font-medium',
                sizeClass.item,
                isCurrent ? variantClass.current : variantClass.inactive
            )}
            aria-current={isCurrent ? 'page' : undefined}
        >
            {content}
        </span>
    );
}
