import React, { useMemo, useCallback } from 'react';
import { cn } from '@/core';
import { Search } from 'lucide-react';
import { Table, Pagination, SearchInput, EmptyState, Card, LoadingSpinner } from '@/components/ui';
import type { Column } from '@/components/ui/data-display/table/table.types';

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    searchable?: boolean;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    selectable?: boolean;
    selectedRows?: Set<string | number>;
    onSelectionChange?: (selected: Set<string | number>) => void;
    getRowId?: (row: T) => string | number;
    actions?: React.ReactNode;
    isLoading?: boolean;
    error?: string;
    emptyMessage?: string;
    emptyState?: React.ReactNode;
    className?: string;
    striped?: boolean;
    hoverable?: boolean;
    onRowClick?: (row: T, index: number) => void;
    compact?: boolean;
}

export default function DataTable<T extends Record<string, unknown>>({
    data,
    columns,
    currentPage = 1,
    totalPages = 1,
    totalItems,
    pageSize = 10,
    onPageChange,
    searchable = false,
    searchValue = '',
    onSearchChange,
    searchPlaceholder = 'Cari data...',
    selectable = false,
    selectedRows = new Set(),
    onSelectionChange,
    getRowId,
    actions,
    isLoading = false,
    error,
    emptyMessage = 'Data tidak ditemukan',
    emptyState,
    className,
    striped = false,
    hoverable = true,
    onRowClick,
    compact = false,
}: DataTableProps<T>) {

    const handleSelectAll = useCallback((checked: boolean) => {
        if (!onSelectionChange || !getRowId) return;
        onSelectionChange(
            checked ? new Set(data.map((row) => getRowId(row))) : new Set()
        );
    }, [data, getRowId, onSelectionChange]);

    const handleSelectRow = useCallback((row: T) => {
        if (!onSelectionChange || !getRowId) return;
        const id = getRowId(row);
        const newSelection = new Set(selectedRows);
        newSelection.has(id) ? newSelection.delete(id) : newSelection.add(id);
        onSelectionChange(newSelection);
    }, [selectedRows, getRowId, onSelectionChange]);

    const isAllSelected = useMemo(() =>
        data.length > 0 && data.every((row) => selectedRows.has(getRowId?.(row) ?? '')),
        [data, selectedRows, getRowId]
    );

    const tableColumns: Column<T>[] = useMemo(() => {
        if (!selectable) return columns;

        const selectionCol: Column<T> = {
            key: '_selection',
            header: (
                <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
            ) as unknown as string,
            render: (row) => (
                <input
                    type="checkbox"
                    checked={selectedRows.has(getRowId?.(row) ?? '')}
                    onChange={() => handleSelectRow(row)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
            ),
            width: '48px',
            align: 'center',
        };
        return [selectionCol, ...columns];
    }, [columns, selectable, isAllSelected, handleSelectAll]);

    return (
        <div className={cn('space-y-4', className)}>
            {(searchable || actions) && (
                <Card padding="md" className="bg-white">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        {searchable && (
                            <div className="w-full sm:max-w-xs">
                                <SearchInput
                                    value={searchValue}
                                    onChange={onSearchChange || (() => { })}
                                    placeholder={searchPlaceholder}
                                    size="sm"
                                />
                            </div>
                        )}
                        {actions && (
                            <div className="flex gap-2 w-full sm:w-auto justify-end">
                                {actions}
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {error && (
                <Card padding="md" className="bg-red-50 border-red-200">
                    <p className="text-red-700 text-sm">Error: {error}</p>
                </Card>
            )}

            <Card padding="none" className="bg-white overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center backdrop-blur-sm">
                        <LoadingSpinner size="lg" variant="primary" />
                    </div>
                )}

                <Table
                    data={data}
                    columns={tableColumns}
                    striped={striped}
                    hoverable={hoverable}
                    onRowClick={onRowClick}
                    emptyMessage={emptyMessage}
                    compact={compact}
                />
            </Card>

            {totalPages > 1 && onPageChange && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    showInfo={!!totalItems}
                    totalItems={totalItems}
                    startIndex={(currentPage - 1) * pageSize}
                    endIndex={Math.min(currentPage * pageSize, totalItems || 0)}
                />
            )}
        </div>
    );
}