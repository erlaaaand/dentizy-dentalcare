import { InputHTMLAttributes } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
    label?: string;
    description?: string;
    error?: string;
    containerClassName?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
    indeterminate?: boolean;
    align?: 'left' | 'right';
    fullWidth?: boolean;
}

export interface CheckboxGroupProps {
    children: React.ReactNode;
    label?: string;
    description?: string;
    error?: string;
    className?: string;
    required?: boolean;
    orientation?: 'vertical' | 'horizontal';
}
