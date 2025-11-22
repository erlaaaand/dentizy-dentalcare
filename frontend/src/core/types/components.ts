// frontend/src/core/types/components.ts
import { ReactNode, CSSProperties } from 'react';

export interface BaseComponentProps {
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
    id?: string;
}

export interface ButtonProps extends BaseComponentProps {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
    placeholder?: string;
    value?: string | number;
    onChange?: (value: string) => void;
    disabled?: boolean;
    error?: string;
    label?: string;
    required?: boolean;
}

export interface ModalProps extends BaseComponentProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface TableColumn<T> {
    key: keyof T | string;
    label: string;
    render?: (value: unknown, row: T) => ReactNode;
    sortable?: boolean;
    width?: string;
}

export interface TableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    loading?: boolean;
    onRowClick?: (row: T) => void;
    pagination?: PaginationConfig;
}

export interface PaginationConfig {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
}