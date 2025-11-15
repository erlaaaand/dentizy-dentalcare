/**
 * Component-specific type definitions
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

// Base component props
export interface BaseProps {
    className?: string;
    children?: ReactNode;
}

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends BaseProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    icon?: LucideIcon;
}

// Card props
export interface CardProps extends BaseProps {
    title?: string;
    subtitle?: string;
    footer?: ReactNode;
    hoverable?: boolean;
    onClick?: () => void;
}

// Badge props
export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface BadgeProps extends BaseProps {
    variant?: BadgeVariant;
    size?: 'sm' | 'md' | 'lg';
}

// Alert props
export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps extends BaseProps {
    type: AlertType;
    title?: string;
    message: string;
    onClose?: () => void;
    closeable?: boolean;
}

// Empty state props
export interface EmptyStateProps extends BaseProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
}

// Loading props
export interface LoadingProps extends BaseProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

// Pagination props
export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    showFirstLast?: boolean;
}

// Stat card props
export interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: LucideIcon;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
    trend?: {
        value: number;
        label: string;
    };
}