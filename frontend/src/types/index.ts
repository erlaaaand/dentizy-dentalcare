/**
 * Main types export file
 * Re-exports all type definitions for easy importing
 */

// API Types
export * from './api';

// Component Props Types
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
}

export interface LoadingProps {
    isLoading?: boolean;
    loadingText?: string;
}

export interface ErrorProps {
    error?: string | null;
    onRetry?: () => void;
}

// Form Types
export interface FormFieldProps {
    label: string;
    name: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

// Table Types
export interface Column<T = any> {
    key: string;
    title: string;
    render?: (value: any, record: T, index: number) => React.ReactNode;
    sortable?: boolean;
    width?: string | number;
}

export interface TableProps<T = any> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    emptyText?: string;
    rowKey?: string | ((record: T) => string | number);
    onRowClick?: (record: T) => void;
}

// Modal Types
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeable?: boolean;
}

// Utility Types
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
    Pick<T, Exclude<keyof T, Keys>> &
    { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

// Status Types
export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any> {
    status: Status;
    data: T | null;
    error: string | null;
}

// Filter Types
export interface DateRangeFilter {
    startDate?: string;
    endDate?: string;
}

export interface SearchFilter {
    query: string;
    fields?: string[];
}

// Sort Types
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
    field: string;
    direction: SortDirection;
}

// Pagination Types (re-export from api)
export type { PaginationMeta, PaginatedResponse } from './api';