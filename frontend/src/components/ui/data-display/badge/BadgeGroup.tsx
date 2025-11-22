import { BadgeGroupProps } from './badge.types';
import { cn } from '@/core';

export function BadgeGroup({
    children,
    className,
    gap = 'sm',
    wrap = true,
    justify = 'start',
}: BadgeGroupProps) {
    const gapClasses = {
        none: 'gap-0',
        sm: 'gap-1.5',
        md: 'gap-2',
        lg: 'gap-3',
    };

    const justifyClasses = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
    };

    return (
        <div
            className={cn(
                'flex flex-wrap items-center',
                gapClasses[gap],
                justifyClasses[justify],
                !wrap && 'flex-nowrap overflow-hidden',
                className
            )}
        >
            {children}
        </div>
    );
}