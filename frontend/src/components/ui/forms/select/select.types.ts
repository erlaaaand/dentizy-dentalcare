import { SelectHTMLAttributes } from 'react';

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
    group?: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'size'> {
    label?: string;
    error?: string;
    hint?: string;
    options: SelectOption[];
    placeholder?: string;
    containerClassName?: string;
    onChange?: (value: string) => void;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'minimal' | 'filled';
    loading?: boolean;
}

// Select Group for multiple related selects
export interface SelectGroupProps {
    children: React.ReactNode;
    className?: string;
    direction?: 'horizontal' | 'vertical';
}

// Select with search functionality
export interface SearchableSelectProps extends Omit<SelectProps, 'options'> {
    options: SelectOption[];
    searchPlaceholder?: string;
    onSearchChange?: (value: string) => void;
}

// Status Select for status filtering
export interface StatusSelectProps extends Omit<SelectProps, 'options' | 'placeholder'> {
    statusOptions?: Array<'active' | 'inactive' | 'pending' | 'completed'>;
    includeAll?: boolean;
    placeholder?: string;
}