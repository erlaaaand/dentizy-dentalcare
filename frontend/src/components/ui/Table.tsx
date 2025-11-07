import React from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
    key: string;
    header: string;
    render?: (row: T, index: number) => React.ReactNode;
    className?: string;
    sortable?: boolean;
}

export interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    emptyMessage?: string;
    onRowClick?: (row: T, index: number) => void;
    className?: string;
    striped?: boolean;
    hoverable?: boolean;
}

export default function Table<T extends Record<string, any>>({
    data,
    columns,
    isLoading = false,
    emptyMessage = 'Tidak ada data',
    onRowClick,
    className,
    striped = false,
    hoverable = true
}: TableProps<T>) {
    if (isLoading) {
        return (
            <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[...Array(5)].map((_, i) => (
                            <tr key={i}>
                                {columns.map((column) => (
                                    <td key={column.key} className="px-6 py-4">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center justify-center">
                                    <svg
                                        className="w-12 h-12 text-gray-400 mb-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                        />
                                    </svg>
                                    <p className="text-sm text-gray-500">{emptyMessage}</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className={cn('w-full overflow-x-auto rounded-lg border border-gray-200', className)}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={cn(
                                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                                    column.sortable && 'cursor-pointer hover:bg-gray-100',
                                    column.className
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {column.header}
                                    {column.sortable && (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                        </svg>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={cn(
                    'bg-white divide-y divide-gray-200',
                    striped && '[&>tr:nth-child(even)]:bg-gray-50'
                )}>
                    {data.map((row, index) => (
                        <tr
                            key={index}
                            onClick={() => onRowClick?.(row, index)}
                            className={cn(
                                onRowClick && 'cursor-pointer',
                                hoverable && 'hover:bg-gray-50 transition-colors'
                            )}
                        >
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className={cn(
                                        'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                                        column.className
                                    )}
                                >
                                    {column.render ? column.render(row, index) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}