import React from 'react';
import Link from 'next/link';
import { cn } from '@/core';
import { defaultSeparator } from './index';
import { BreadcrumbProps } from './breadcrumb.types';
import { sizeClasses, variantClasses } from './breadcrumb.styles';
import { BreadcrumbItem } from './BreadcrumbItem';
import { PageBreadcrumb } from './PageBreadcrumb';
import { CompactBreadcrumb } from './CompactBreadcrumb';
import { HomeBreadcrumb } from './HomeBreadcrumb';

export function Breadcrumb({
    items,
    separator = defaultSeparator,
    className,
    size = 'md',
    variant = 'default',
    showCurrentPage = true,
}: BreadcrumbProps) {
    const sizeClass = sizeClasses[size];
    const variantClass = variantClasses[variant];

    // Filter items if showCurrentPage is false
    const displayItems = showCurrentPage ? items : items.slice(0, -1);

    if (displayItems.length === 0) return null;

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn('flex items-center', className)}
        >
            <ol className="flex items-center flex-wrap">
                {displayItems.map((item, index) => {
                    const isLast = index === displayItems.length - 1;
                    const isLink = item.href && !isLast;

                    return (
                        <li key={index} className="flex items-center">
                            {/* Separator */}
                            {index > 0 && (
                                <span
                                    className={cn('flex-shrink-0 text-gray-400', sizeClass.separator)}
                                    aria-hidden="true"
                                >
                                    {separator}
                                </span>
                            )}

                            {/* Breadcrumb Item */}
                            {isLink ? (
                                <Link
                                    href={item.href ?? '#'}
                                    className={cn(
                                        'flex items-center gap-1.5 font-medium',
                                        sizeClass.item,
                                        variantClass.link
                                    )}
                                >
                                    {item.icon && (
                                        <span className={cn('flex-shrink-0', sizeClass.icon)}>
                                            {item.icon}
                                        </span>
                                    )}
                                    <span>{item.label}</span>
                                </Link>
                            ) : (
                                <span
                                    className={cn(
                                        'flex items-center gap-1.5 font-medium',
                                        sizeClass.item,
                                        isLast ? variantClass.current : variantClass.inactive
                                    )}
                                    aria-current={isLast ? 'page' : undefined}
                                >
                                    {item.icon && (
                                        <span className={cn('flex-shrink-0', sizeClass.icon)}>
                                            {item.icon}
                                        </span>
                                    )}
                                    <span>{item.label}</span>
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

// Create main component with compound pattern
const BreadcrumbComponent = Object.assign(Breadcrumb, {
    Item: BreadcrumbItem,
    Page: PageBreadcrumb,
    Compact: CompactBreadcrumb,
    Home: HomeBreadcrumb,
});

export default BreadcrumbComponent;