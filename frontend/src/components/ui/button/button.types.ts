import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline' | 'link';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    loading?: boolean;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    iconOnly?: boolean;
    fullWidth?: boolean;
    children?: ReactNode;
    rounded?: 'default' | 'full' | 'none';
    shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export interface ButtonGroupProps {
    children: React.ReactNode;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

export interface IconButtonProps extends Omit<ButtonProps, 'iconOnly' | 'children'> {
    icon: ReactNode;
    'aria-label': string;
}