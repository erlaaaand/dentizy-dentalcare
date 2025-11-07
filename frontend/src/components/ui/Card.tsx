import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    shadow?: 'none' | 'sm' | 'md' | 'lg';
    hoverable?: boolean;
    onClick?: () => void;
}

export interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
}

export interface CardBodyProps {
    children: React.ReactNode;
    className?: string;
}

export interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
};

const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg'
};

export function Card({
    children,
    className,
    padding = 'md',
    shadow = 'md',
    hoverable = false,
    onClick
}: CardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'bg-white rounded-lg border border-gray-200',
                paddingClasses[padding],
                shadowClasses[shadow],
                hoverable && 'hover:shadow-lg transition-shadow cursor-pointer',
                onClick && 'cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
    return (
        <div className={cn('flex items-center justify-between mb-4', className)}>
            <div className="flex-1">{children}</div>
            {action && <div className="ml-4">{action}</div>}
        </div>
    );
}

export function CardBody({ children, className }: CardBodyProps) {
    return <div className={cn('', className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardFooterProps) {
    return (
        <div className={cn('mt-4 pt-4 border-t border-gray-200', className)}>
            {children}
        </div>
    );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;