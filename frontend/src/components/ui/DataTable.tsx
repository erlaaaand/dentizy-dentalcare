import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Table, { Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    
    // Pagination
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    
    // Search
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
    bulkActions?: Array<{
        label: string;
        icon?: React.ReactNode;
        onClick: (selectedIds: Set<string | number>) => void;
        variant?: 'default' | 'danger';
    }>;
    
    // State
    isLoading?: boolean;
    error?: string;
    emptyMessage?: string;
    
    // Styling
    className?: string;
    striped?: boolean;
    hoverable?: boolean;
    
    // Events
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
    searchPlaceholder = 'Cari...',
    selectable = false,
    selectedRows = new Set(),
    onSelectionChange,
    getRowId,
    actions,
    bulkActions,
    isLoading = false,
    error,
    emptyMessage,
    className,
    striped = false,
    hoverable = true,
    onRowClick
}: DataTableProps<T>) {
    const [localSearch, setLocalSearch] = useState(searchValue);

    // Calculate pagination info
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems || data.length);

    // Handle select all
    const isAllSelected = selectable && data.length > 0 && 
        data.every(row => {
            const id = getRowId?.(row) ?? row.id;
            return selectedRows.has(id);
        });

    const handleSelectAll = () => {
        if (!onSelectionChange || !getRowId) return;

        if (isAllSelected) {
            onSelectionChange(new Set());
        } else {
            const allIds = new Set(data.map(row => getRowId(row)));
            onSelectionChange(allIds);
        }
    };

    const handleSelectRow = (row: T) => {
        if (!onSelectionChange || !getRowId) return;

        const id = getRowId(row);
        const newSelection = new Set(selectedRows);

        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }

        onSelectionChange(newSelection);
    };

    // Build columns with selection
    const tableColumns: Column<T>[] = selectable
        ? [
              {
                  key: '_selection',
                  header: (
                      <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                  ) as any,
                  render: (row) => {
                      const id = getRowId?.(row) ?? row.id;
                      return (
                          <input
                              type="checkbox"
                              checked={selectedRows.has(id)}
                              onChange={() => handleSelectRow(row)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                      );
                  },
                  className: 'w-12'
              },
              ...columns
          ]
        : columns;

    return (
        <div className={cn('space-y-4', className)}>
            {/* Header with Search and Actions */}
            {(searchable || actions || (bulkActions && selectedRows.size > 0)) && (
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        {searchable && (
                            <SearchInput
                                value={localSearch}
                                onChange={(value) => {
                                    setLocalSearch(value);
                                    onSearchChange?.(value);
                                }}
                                placeholder={searchPlaceholder}
                                className="max-w-md"
                            />
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Bulk Actions */}
                        {bulkActions && selectedRows.size > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-sm font-medium text-blue-900">
                                    {selectedRows.size} dipilih
                                </span>
                                {bulkActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => action.onClick(selectedRows)}
                                        className={cn(
                                            'px-3 py-1 text-sm font-medium rounded transition-colors',
                                            action.variant === 'danger'
                                                ? 'bg-red-600 text-white hover:bg-red-700'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                        )}
                                    >
                                        {action.icon && <span className="mr-1">{action.icon}</span>}
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        {actions}
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-800">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{error}</span>
                    </div>
                </div>
            )}

            {/* Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <Table
                    data={data}
                    columns={tableColumns}
                    onRowClick={onRowClick}
                    striped={striped}
                    hoverable={hoverable}
                    emptyMessage={emptyMessage}
                />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange || (() => {})}
                    showInfo={!!totalItems}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalItems={totalItems}
                />
            )}
        </div>
    );
}