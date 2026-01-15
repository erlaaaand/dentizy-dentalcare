// frontend/src/core/types/components.ts
import { ReactNode, CSSProperties } from 'react';

export interface BaseComponentProps {
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
    id?: string;
}

export interface ButtonProps extends BaseComponentProps {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    fullWidth?: boolean;
}

export interface InputProps extends BaseComponentProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'time';
    placeholder?: string;
    value?: string | number;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    error?: string;
    label?: string;
    required?: boolean;
    name?: string;
}

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends Omit<InputProps, 'type' | 'onChange'> {
    options: SelectOption[];
    onChange?: (value: string | number) => void;
    multiple?: boolean;
}

export interface ModalProps extends BaseComponentProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closable?: boolean;
    footer?: ReactNode;
}

export interface TableColumn<T> {
    key: keyof T | string;
    label: string;
    render?: (value: unknown, row: T, index: number) => ReactNode;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
}

export interface TableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    loading?: boolean;
    error?: string | null;
    emptyText?: string;
    onRowClick?: (row: T, index: number) => void;
    rowClassName?: (row: T, index: number) => string;
    pagination?: PaginationConfig;
    className?: string;
}

export interface PaginationConfig {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
    showSizeChanger?: boolean;
    pageSizeOptions?: number[];
}