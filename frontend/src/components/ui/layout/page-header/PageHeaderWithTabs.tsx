import { Breadcrumb } from '@/components/ui/layout/breadcrumb';
import { PageHeaderWithTabsProps } from './page-header.types';
import { cn } from '@/core';
import { sizeClasses, tabVariantClasses } from './page-header.styles';

export function PageHeaderWithTabs({
    title,
    description,
    breadcrumbs,
    tabs,
    activeTab,
    onTabChange,
    actions,
    className,
    size = 'lg',
    tabVariant = 'default',
}: PageHeaderWithTabsProps) {
    const sizeClass = sizeClasses[size];
    const tabClass = tabVariantClasses[tabVariant];

    return (
        <div className={cn('bg-white border-b border-gray-200', className)}>
            {/* Header Content */}
            <div className={sizeClass.padding}>
                {/* Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <div className="mb-3">
                        <Breadcrumb
                            items={breadcrumbs.map(item => ({
                                label: typeof item.children === 'string' ? item.children : '',
                                href: item.href,
                                icon: item.icon,
                                active: item.isCurrent,
                            }))}
                            size={size === 'lg' ? 'md' : 'sm'}
                        />
                    </div>
                )}

                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                        <h1 className={cn('text-gray-900 truncate', sizeClass.title)}>
                            {title}
                        </h1>
                        {description && (
                            <p className={cn('text-gray-600', sizeClass.description)}>
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
            <div className={cn(
                'px-6',
                tabVariant === 'pills' && 'pb-4'
            )}>
                <nav className={cn(
                    'flex gap-8 -mb-px',
                    tabVariant === 'pills' && 'gap-2 mb-0'
                )} aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                'flex items-center gap-2 transition-colors',
                                tabClass.base,
                                activeTab === tab.id ? tabClass.active : tabClass.inactive,
                                tabVariant === 'pills' ? 'py-2 px-3' : 'py-4 px-1'
                            )}
                            aria-current={activeTab === tab.id ? 'page' : undefined}
                        >
                            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span
                                    className={cn(
                                        'px-2 py-0.5 text-xs font-semibold rounded-full',
                                        activeTab === tab.id
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-gray-100 text-gray-600',
                                        tabVariant === 'pills' && activeTab === tab.id && 'bg-white bg-opacity-20'
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