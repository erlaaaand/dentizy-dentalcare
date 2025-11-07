import React from 'react';
import { cn } from '@/lib/utils';
import Breadcrumb, { BreadcrumbItem } from '@/components/ui/Breadcrumb';

export interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: React.ReactNode;
    backButton?: {
        label?: string;
        onClick: () => void;
    };
    className?: string;
}

export default function PageHeader({
    title,
    description,
    breadcrumbs,
    actions,
    backButton,
    className
}: PageHeaderProps) {
    return (
        <div className={cn('bg-white border-b border-gray-200 px-6 py-4', className)}>
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="mb-3">
                    <Breadcrumb items={breadcrumbs} />
                </div>
            )}

            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    {/* Back Button */}
                    {backButton && (
                        <button
                            onClick={backButton.onClick}
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>{backButton.label || 'Kembali'}</span>
                        </button>
                    )}

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-gray-900 truncate">
                        {title}
                    </h1>

                    {/* Description */}
                    {description && (
                        <p className="mt-1 text-sm text-gray-600">
                            {description}
                        </p>
                    )}
                </div>

                {/* Actions */}
                {actions && (
                    <div className="flex-shrink-0 flex items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}

// Compact Page Header (for modal or smaller spaces)
export interface CompactPageHeaderProps {
    title: string;
    subtitle?: string;
    onClose?: () => void;
    className?: string;
}

export function CompactPageHeader({
    title,
    subtitle,
    onClose,
    className
}: CompactPageHeaderProps) {
    return (
        <div className={cn('flex items-start justify-between border-b border-gray-200 pb-4', className)}>
            <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-900 truncate">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-1 text-sm text-gray-500">
                        {subtitle}
                    </p>
                )}
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}

// Page Header with Tabs
export interface PageHeaderWithTabsProps extends Omit<PageHeaderProps, 'actions'> {
    tabs: Array<{
        id: string;
        label: string;
        count?: number;
    }>;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    actions?: React.ReactNode;
}

export function PageHeaderWithTabs({
    title,
    description,
    breadcrumbs,
    tabs,
    activeTab,
    onTabChange,
    actions,
    className
}: PageHeaderWithTabsProps) {
    return (
        <div className={cn('bg-white border-b border-gray-200', className)}>
            <div className="px-6 pt-4">
                {/* Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <div className="mb-3">
                        <Breadcrumb items={breadcrumbs} />
                    </div>
                )}

                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-bold text-gray-900 truncate">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-1 text-sm text-gray-600">
                                {description}
                            </p>
                        )}
                    </div>
                    {actions && (
                        <div className="flex-shrink-0 flex items-center gap-3">
                            {actions}
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6">
                <nav className="flex gap-8 -mb-px" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                                activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            )}
                            aria-current={activeTab === tab.id ? 'page' : undefined}
                        >
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span
                                    className={cn(
                                        'px-2 py-0.5 text-xs font-semibold rounded-full',
                                        activeTab === tab.id
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-gray-100 text-gray-600'
                                    )}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
}