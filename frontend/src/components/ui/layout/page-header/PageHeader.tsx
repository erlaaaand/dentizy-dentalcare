import React from 'react';
import { cn } from '@/core';
import { Breadcrumb } from '@/components/ui/layout/breadcrumb';
import { PageHeaderProps } from './page-header.types';
import { CompactPageHeader } from './CompactPageHeader';
import { PageHeaderWithTabs } from './PageHeaderWithTabs';
import { SectionHeader } from './SectionHeader';
import { BackIcon } from './Icon.styles';
import { sizeClasses, alignClasses } from './page-header.styles';

export function PageHeader({
    title,
    description,
    breadcrumbs,
    actions,
    backButton,
    className,
    size = 'lg',
    align = 'left',
}: PageHeaderProps) {
    const sizeClass = sizeClasses[size];
    const alignClass = alignClasses[align];

    return (
        <div className={cn(
            'bg-white border-b border-gray-200',
            sizeClass.padding,
            className
        )}>
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="mb-3">
                    <Breadcrumb items={breadcrumbs} size={size === 'lg' ? 'md' : 'sm'} />
                </div>
            )}

            <div className={cn(
                'flex items-start justify-between gap-4',
                align === 'center' && 'flex-col text-center'
            )}>
                <div className={cn('flex-1 min-w-0', alignClass)}>
                    {/* Back Button */}
                    {backButton && (
                        <button
                            onClick={backButton.onClick}
                            className={cn(
                                'inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors',
                                sizeClass.backButton
                            )}
                        >
                            <BackIcon />
                            <span>{backButton.label || 'Kembali'}</span>
                        </button>
                    )}

                    {/* Title */}
                    <h1 className={cn('text-gray-900 truncate', sizeClass.title)}>
                        {title}
                    </h1>

                    {/* Description */}
                    {description && (
                        <p className={cn('text-gray-600', sizeClass.description)}>
                            {description}
                        </p>
                    )}
                </div>

                {/* Actions */}
                {actions && (
                    <div className={cn(
                        'flex-shrink-0 flex items-center gap-3',
                        align === 'center' && 'justify-center w-full mt-4'
                    )}>
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}

// Create main component with compound pattern
const PageHeaderComponent = Object.assign(PageHeader, {
    Compact: CompactPageHeader,
    WithTabs: PageHeaderWithTabs,
    Section: SectionHeader,
});

export default PageHeaderComponent;