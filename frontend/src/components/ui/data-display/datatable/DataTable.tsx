import React, { useState } from 'react';
import { cn } from '@/core';
import { Search, Filter } from 'lucide-react';
import Table, { Column } from '../table/index'; // Base Table Component
import { Pagination } from '../../navigation/Pagination';
import { Button } from '../../button';
import { Input } from '../../forms/input'; // Reusable Input
import { LoadingSpinner } from '../../feedback/loading-spinner/LoadingSpinner';

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];

    // Pagination
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;

    // Search & Filter
    searchable?: boolean;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;

    // Selection
    selectable?: boolean;
    selectedRows?: Set<string | number>;
    onSelectionChange?: (selected: Set<string | number>) => void;
    getRowId?: (row: T) => string | number;

    // Actions
    actions?: React.ReactNode;

    // State
    isLoading?: boolean;
    error?: string;
    emptyMessage?: string;

    // Styling
    className?: string;
    striped?: boolean;
    hoverable?: boolean;
    onRowClick?: (row: T, index: number) => void;
}

export default function DataTable<T extends Record<string, any>>({
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
    className,
    striped = false,
    hoverable = true,
    onRowClick
}: DataTableProps<T>) {

    // --- INTERNAL SELECTION LOGIC ---
    const handleSelectAll = (checked: boolean) => {
        if (!onSelectionChange || !getRowId) return;
        if (checked) {
            const allIds = new Set(data.map(row => getRowId(row)));
            onSelectionChange(allIds);
        } else {
            onSelectionChange(new Set());
        }
    };

    const handleSelectRow = (row: T) => {
        if (!onSelectionChange || !getRowId) return;
        const id = getRowId(row);
        const newSelection = new Set(selectedRows);
        if (newSelection.has(id)) newSelection.delete(id);
        else newSelection.add(id);
        onSelectionChange(newSelection);
    };

    const isAllSelected = data.length > 0 && data.every(row => selectedRows.has(getRowId?.(row) ?? row.id));

    // --- COLUMNS BUILDER ---
    const tableColumns: Column<T>[] = React.useMemo(() => {
        if (!selectable) return columns;
        return [
            {
                key: '_selection',
                header: (
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                ) as any,
                render: (row) => (
                    <input
                        type="checkbox"
                        checked={selectedRows.has(getRowId?.(row) ?? row.id)}
                        onChange={() => handleSelectRow(row)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                ),
                width: '48px',
                align: 'center'
            },
            ...columns
        ];
    }, [columns, selectable, isAllSelected, selectedRows, data]);

    return (
        <div className={cn('space-y-4', className)}>
            {/* Toolbar */}
            {(searchable || actions) && (
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    {searchable && (
                        <div className="w-full sm:max-w-xs relative">
                            <Input
                                placeholder={searchPlaceholder}
                                value={searchValue}
                                onChange={(e) => onSearchChange?.(e.target.value)}
                                leftIcon={<Search className="w-4 h-4" />}
                                size="sm"
                                className="w-full"
                            />
                        </div>
                    )}
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                        {actions}
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    Error: {error}
                </div>
            )}

            {/* Loading / Table */}
            <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
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
                />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange || (() => { })}
                    showInfo={!!totalItems}
                    totalItems={totalItems}
                    startIndex={(currentPage - 1) * pageSize}
                    endIndex={Math.min(currentPage * pageSize, totalItems || 0)}
                />
            )}
        </div>
    );
}