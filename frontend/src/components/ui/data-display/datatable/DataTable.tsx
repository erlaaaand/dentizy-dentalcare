import React, { useMemo, useCallback } from 'react';
import { cn } from '@/core';

export interface Column<T> {
    header: string | React.ReactNode;
    accessorKey?: keyof T | string;
    cell?: (info: { getValue: () => any; row: { original: T }; }) => React.ReactNode;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    id?: string;
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
    onPageChange?: (page: number) => void;
    onLimitChange?: (limit: number) => void;
    isLoading?: boolean;
    className?: string;
}

export default function DataTable<T extends Record<string, any>>({
    data,
    columns,
    pagination,
    onPageChange,
    onLimitChange,
    isLoading = false,
    className,
}: DataTableProps<T>) {

    return (
        <div className={cn('w-full', className)}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={column.id || column.accessorKey as string || index}
                                    className={cn(
                                        'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                                        column.align === 'center' && 'text-center',
                                        column.align === 'right' && 'text-right'
                                    )}
                                    style={{ width: column.width }}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                                {columns.map((column, colIndex) => {
                                    const value = column.accessorKey
                                        ? row[column.accessorKey as string]
                                        : null;

                                    return (
                                        <td
                                            key={column.id || column.accessorKey as string || colIndex}
                                            className={cn(
                                                'px-4 py-3 whitespace-nowrap text-sm text-gray-900',
                                                column.align === 'center' && 'text-center',
                                                column.align === 'right' && 'text-right'
                                            )}
                                        >
                                            {column.cell
                                                ? column.cell({
                                                    getValue: () => value,
                                                    row: { original: row }
                                                })
                                                : value
                                            }
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Menampilkan {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}
                        {' '}-{' '}
                        {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                        {' '}dari {pagination.totalItems} data
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange?.(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Sebelumnya
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    return page === 1 ||
                                        page === pagination.totalPages ||
                                        Math.abs(page - pagination.currentPage) <= 1;
                                })
                                .map((page, index, array) => {
                                    if (index > 0 && page - array[index - 1] > 1) {
                                        return (
                                            <React.Fragment key={`ellipsis-${page}`}>
                                                <span className="px-2">...</span>
                                                <button
                                                    onClick={() => onPageChange?.(page)}
                                                    className={cn(
                                                        'px-3 py-1 text-sm border rounded',
                                                        page === pagination.currentPage
                                                            ? 'bg-primary-600 text-white border-primary-600'
                                                            : 'hover:bg-gray-50'
                                                    )}
                                                >
                                                    {page}
                                                </button>
                                            </React.Fragment>
                                        );
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => onPageChange?.(page)}
                                            className={cn(
                                                'px-3 py-1 text-sm border rounded',
                                                page === pagination.currentPage
                                                    ? 'bg-primary-600 text-white border-primary-600'
                                                    : 'hover:bg-gray-50'
                                            )}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                        </div>
                        <button
                            onClick={() => onPageChange?.(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}