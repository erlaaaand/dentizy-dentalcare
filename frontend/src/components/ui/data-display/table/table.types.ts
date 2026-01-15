export interface Column<T> {
    key: string;
    header: string;
    render?: (row: T, index: number) => React.ReactNode;
    className?: string;
    headerClassName?: string;
    cellClassName?: string;
    sortable?: boolean;
    width?: number | string;
    align?: 'left' | 'center' | 'right';
    truncate?: boolean;
}

export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

export interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    loadingRows?: number;
    emptyMessage?: string;
    emptyState?: React.ReactNode;
    onRowClick?: (row: T, index: number) => void;
    onSort?: (sortConfig: SortConfig | null) => void;
    sortConfig?: SortConfig | null;
    className?: string;
    tableClassName?: string;
    striped?: boolean;
    hoverable?: boolean;
    compact?: boolean;
    bordered?: boolean;
    selectable?: boolean;
    selectedRows?: Set<number>;
    onRowSelect?: (index: number, selected: boolean) => void;
    onSelectAll?: (selected: boolean) => void;
    allSelected?: boolean;
    someSelected?: boolean;
    rowClassName?: (row: T, index: number) => string;
    footer?: React.ReactNode;
    stickyHeader?: boolean;
    scrollable?: boolean;
    maxHeight?: string;
}

export interface TableSkeletonProps {
    columns: number;
    rows: number;
    compact?: boolean;
}

export interface SortIconProps {
    sortConfig?: SortConfig | null;
    columnKey: string;
}

// Table Actions Component
export interface TableActionsProps {
    children: React.ReactNode;
    className?: string;
}


// Table Footer Component
export interface TableFooterProps {
    children: React.ReactNode;
    className?: string;
}

// Table Container Component
export interface TableContainerProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
    actions?: React.ReactNode;
}