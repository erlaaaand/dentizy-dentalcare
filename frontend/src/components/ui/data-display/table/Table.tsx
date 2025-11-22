// components/ui/data-display/Table.tsx
import React from 'react';
import { cn } from '@/core';
import { TableProps } from './table.types';
import { sizeClasses, alignClasses } from './table.styles';
import { Column } from './table.types';
import TableSkeleton from '@/domains/shared/components/TableSkeleton';
import { TableFooter } from './TableFooter';
import { TableActions } from './TableActions';
import { TableContainer } from './TableContainer';
import Checkbox from '../../forms/checkbox';
import { SortIcon } from './SortIcon';

export default function Table<T extends Record<string, any>>({
    data,
    columns,
    isLoading = false,
    loadingRows = 5,
    emptyMessage = 'No data available',
    emptyState,
    onRowClick,
    onSort,
    sortConfig,
    className,
    tableClassName,
    striped = false,
    hoverable = true,
    compact = false,
    bordered = true,
    selectable = false,
    selectedRows = new Set(),
    onRowSelect,
    onSelectAll,
    allSelected = false,
    someSelected = false,
    rowClassName,
    footer,
    stickyHeader = false,
    scrollable = false,
    maxHeight = '400px',
}: TableProps<T>) {
    const sizeClass = compact ? sizeClasses.compact : sizeClasses.normal;

    const handleSort = (column: Column<T>) => {
        if (!column.sortable || !onSort) return;

        if (sortConfig?.key === column.key) {
            if (sortConfig.direction === 'asc') {
                onSort({ key: column.key, direction: 'desc' });
            } else {
                onSort(null);
            }
        } else {
            onSort({ key: column.key, direction: 'asc' });
        }
    };

    const handleSelectAll = (checked: boolean) => {
        onSelectAll?.(checked);
    };

    const handleRowSelect = (index: number, checked: boolean) => {
        onRowSelect?.(index, checked);
    };

    // Render empty state
    const renderEmptyState = () => {
        if (emptyState) {
            return (
                <tr>
                    <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-8">
                        {emptyState}
                    </td>
                </tr>
            );
        }

        return (
            <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                />
                            </svg>
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-2">No data found</p>
                        <p className="text-sm text-gray-500 max-w-md">{emptyMessage}</p>
                    </div>
                </td>
            </tr>
        );
    };

    const tableContent = (
        <table className={cn('min-w-full divide-y divide-gray-200', tableClassName)}>
            {/* Table Header */}
            <thead className={cn(
                'bg-gray-50',
                stickyHeader && 'sticky top-0 z-10'
            )}>
                <tr>
                    {/* Select All Checkbox */}
                    {selectable && (
                        <th className={cn(
                            sizeClass.header,
                            'text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50'
                        )}>
                            <Checkbox
                                checked={allSelected}
                                indeterminate={someSelected && !allSelected}
                                onChange={(event) => handleSelectAll(event.target.checked)}
                                className="mx-auto"
                            />
                        </th>
                    )}

                    {/* Column Headers */}
                    {columns.map((column) => (
                        <th
                            key={column.key}
                            className={cn(
                                sizeClass.header,
                                sizeClass.text,
                                'font-medium text-gray-500 uppercase tracking-wider',
                                alignClasses[column.align || 'left'],
                                column.sortable && 'cursor-pointer hover:bg-gray-100 transition-colors',
                                column.headerClassName
                            )}
                            style={{ width: column.width }}
                            onClick={() => handleSort(column)}
                        >
                            <div className={cn(
                                'flex items-center gap-2',
                                column.align === 'center' && 'justify-center',
                                column.align === 'right' && 'justify-end'
                            )}>
                                {column.header}
                                {column.sortable && (
                                    <SortIcon sortConfig={sortConfig} columnKey={column.key} />
                                )}
                            </div>
                        </th>
                    ))}
                </tr>
            </thead>

            {/* Table Body */}
            <tbody className={cn(
                'bg-white divide-y divide-gray-200',
                striped && '[&>tr:nth-child(even)]:bg-gray-50'
            )}>
                {/* Loading State */}
                {isLoading && (
                    <TableSkeleton
                        columns={columns.length + (selectable ? 1 : 0)}
                        rows={loadingRows}
                        compact={compact}
                    />
                )}

                {/* Empty State */}
                {!isLoading && (!data || data.length === 0) && renderEmptyState()}

                {/* Data Rows */}
                {!isLoading && data.map((row, index) => (
                    <tr
                        key={index}
                        onClick={() => onRowClick?.(row, index)}
                        className={cn(
                            'transition-colors',
                            onRowClick && 'cursor-pointer',
                            hoverable && 'hover:bg-gray-50',
                            selectedRows.has(index) && 'bg-blue-50 border-l-2 border-l-blue-600',
                            rowClassName?.(row, index)
                        )}
                    >
                        {/* Row Selection Checkbox */}
                        {selectable && (
                            <td className={cn(
                                sizeClass.cell,
                                'whitespace-nowrap'
                            )}>
                                <Checkbox
                                    checked={selectedRows.has(index)}
                                    onChange={(event) => handleRowSelect(index, event.target.checked)}
                                    className="mx-auto"
                                />
                            </td>
                        )}

                        {/* Data Cells */}
                        {columns.map((column) => (
                            <td
                                key={column.key}
                                className={cn(
                                    sizeClass.cell,
                                    sizeClass.text,
                                    'text-gray-900',
                                    alignClasses[column.align || 'left'],
                                    column.truncate && 'truncate max-w-0',
                                    column.cellClassName
                                )}
                                style={{ width: column.width }}
                                title={column.truncate && typeof row[column.key] === 'string' ? row[column.key] : undefined}
                            >
                                <div className={cn(
                                    column.truncate && 'truncate',
                                    column.align === 'center' && 'flex justify-center',
                                    column.align === 'right' && 'flex justify-end'
                                )}>
                                    {column.render ? column.render(row, index) : row[column.key]}
                                </div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>

            {/* Table Footer */}
            {footer && (
                <tfoot className="bg-gray-50 border-t border-gray-200">
                    {footer}
                </tfoot>
            )}
        </table>
    );

    return (
        <div
            className={cn(
                'w-full overflow-hidden',
                bordered && 'rounded-lg border border-gray-200',
                scrollable && 'overflow-auto',
                className
            )}
            style={scrollable ? { maxHeight } : undefined}
        >
            {tableContent}
        </div>
    );
}

// Assign extensions to Table component
Table.Actions = TableActions;
Table.Footer = TableFooter;
Table.Container = TableContainer;