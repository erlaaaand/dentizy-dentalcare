import React, { useState } from 'react';
import { cn } from '@/core';

export interface TabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    badge?: string | number;
}

export interface TabsProps {
    tabs: TabItem[];
    defaultTab?: string;
    onChange?: (tabId: string) => void;
    children: React.ReactNode;
    className?: string;
    variant?: 'line' | 'pills';
}

export interface TabPanelProps {
    tabId: string;
    children: React.ReactNode;
    className?: string;
}

export function Tabs({
    tabs,
    defaultTab,
    onChange,
    children,
    className,
    variant = 'line'
}: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        onChange?.(tabId);
    };

    return (
        <div className={cn('w-full', className)}>
            {/* Tab Headers */}
            <div
                className={cn(
                    'flex gap-1',
                    variant === 'line' && 'border-b border-gray-200',
                    variant === 'pills' && 'bg-gray-100 p-1 rounded-lg'
                )}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => !tab.disabled && handleTabChange(tab.id)}
                        disabled={tab.disabled}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg',
                            variant === 'line' && [
                                'border-b-2 -mb-px',
                                activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            ],
                            variant === 'pills' && [
                                'rounded-md',
                                activeTab === tab.id
                                    ? 'bg-white text-blue-600 shadow'
                                    : 'text-gray-500 hover:text-gray-700'
                            ],
                            tab.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                    >
                        {tab.icon && <span>{tab.icon}</span>}
                        <span>{tab.label}</span>
                        {tab.badge && (
                            <span
                                className={cn(
                                    'ml-1 px-2 py-0.5 text-xs font-semibold rounded-full',
                                    activeTab === tab.id
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-gray-200 text-gray-600'
                                )}
                            >
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Panels */}
            <div className="mt-4">
                {React.Children.map(children, (child) => {
                    if (React.isValidElement<TabPanelProps>(child)) {
                        return React.cloneElement(child, {
                            ...child.props,
                            className: cn(
                                child.props.className,
                                child.props.tabId !== activeTab && 'hidden'
                            )
                        });
                    }
                    return child;
                })}
            </div>
        </div>
    );
}

export function TabPanel({ tabId, children, className }: TabPanelProps) {
    return (
        <div
            id={`panel-${tabId}`}
            role="tabpanel"
            className={cn('animate-in fade-in duration-200', className)}
        >
            {children}
        </div>
    );
}