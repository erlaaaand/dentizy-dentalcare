import React from 'react';
import { cn } from '@/lib/utils';

export interface MainContentProps {
    children: React.ReactNode;
    className?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const maxWidthClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[1400px]',
    '2xl': 'max-w-[1600px]',
    full: 'max-w-full'
};

const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
};

export default function MainContent({
    children,
    className,
    maxWidth = 'full',
    padding = 'none'
}: MainContentProps) {
    return (
        <div
            className={cn(
                'w-full mx-auto',
                maxWidthClasses[maxWidth],
                paddingClasses[padding],
                className
            )}
        >
            {children}
        </div>
    );
}

// Content Section Component
export interface ContentSectionProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function ContentSection({
    children,
    title,
    description,
    action,
    className
}: ContentSectionProps) {
    return (
        <section className={cn('mb-8', className)}>
            {(title || description || action) && (
                <div className="mb-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            {title && (
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="text-sm text-gray-600">
                                    {description}
                                </p>
                            )}
                        </div>
                        {action && (
                            <div className="flex-shrink-0">
                                {action}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {children}
        </section>
    );
}

// Grid Layout Component
export interface GridLayoutProps {
    children: React.ReactNode;
    columns?: 1 | 2 | 3 | 4 | 5 | 6;
    gap?: 'sm' | 'md' | 'lg';
    className?: string;
}

const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6'
};

const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
};

export function GridLayout({
    children,
    columns = 3,
    gap = 'md',
    className
}: GridLayoutProps) {
    return (
        <div
            className={cn(
                'grid',
                columnClasses[columns],
                gapClasses[gap],
                className
            )}
        >
            {children}
        </div>
    );
}