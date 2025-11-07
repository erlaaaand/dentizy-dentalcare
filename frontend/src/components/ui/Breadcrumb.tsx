import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
}

export interface BreadcrumbProps {
    items: BreadcrumbItem[];
    separator?: React.ReactNode;
    className?: string;
}

const defaultSeparator = (
    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
);

export default function Breadcrumb({
    items,
    separator = defaultSeparator,
    className
}: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
            <ol className="flex items-center space-x-2">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className="flex items-center">
                            {index > 0 && (
                                <span className="mx-2 flex-shrink-0" aria-hidden="true">
                                    {separator}
                                </span>
                            )}

                            {item.href && !isLast ? (
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-2 text-sm font-medium transition-colors',
                                        'text-gray-500 hover:text-gray-700'
                                    )}
                                >
                                    {item.icon && <span>{item.icon}</span>}
                                    <span>{item.label}</span>
                                </Link>
                            ) : (
                                <span
                                    className={cn(
                                        'flex items-center gap-2 text-sm font-medium',
                                        isLast ? 'text-gray-900' : 'text-gray-500'
                                    )}
                                    aria-current={isLast ? 'page' : undefined}
                                >
                                    {item.icon && <span>{item.icon}</span>}
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