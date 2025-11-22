import React from 'react';
import { cn } from '@/core';
import { TableProps, Column } from './table.types';
import { sizeClasses, alignClasses } from './table.styles';
import { SkeletonTable } from '@/components/ui/data-display/skeleton/SkeletonTable';
import { TableFooter } from './TableFooter';
import { TableActions } from './TableActions';
import { TableContainer } from './TableContainer';
import Checkbox from '../../forms/checkbox';
import { SortIcon } from './SortIcon';

function EmptyState({ colSpan, message, customState }: { colSpan: number; message: string; customState?: React.ReactNode }) {
    if (customState) return <tr><td colSpan={colSpan} className="p-8">{customState}</td></tr>;
    return (
        <tr>
            <td colSpan={colSpan} className="p-12 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">No data found</p>
                    <p className="text-sm text-gray-500 max-w-md">{message}</p>
                </div>
            </td>
        </tr>
    );
}

export default function Table<T extends Record<string, unknown>>({
    data, columns, isLoading = false, loadingRows = 5, emptyMessage = 'No data available', emptyState,
    onRowClick, onSort, sortConfig, className, tableClassName, striped = false, hoverable = true,
    compact = false, bordered = true, selectable = false, selectedRows = new Set(), onRowSelect,
    onSelectAll, allSelected = false, someSelected = false, rowClassName, footer, stickyHeader = false,
    scrollable = false, maxHeight = '400px',
}: TableProps<T>) {
    const sizeClass = compact ? sizeClasses.compact : sizeClasses.normal;
    const colSpan = columns.length + (selectable ? 1 : 0);

    const handleSort = (column: Column<T>) => {
        if (!column.sortable || !onSort) return;
        if (sortConfig?.key === column.key) {
            onSort(sortConfig.direction === 'asc' ? { key: column.key, direction: 'desc' } : null);
        } else {
            onSort({ key: column.key, direction: 'asc' });
        }
    };

    return (
        <div className={cn('w-full overflow-hidden', bordered && 'rounded-lg border border-gray-200', scrollable && 'overflow-auto', className)} style={scrollable ? { maxHeight } : undefined}>
            <table className={cn('min-w-full divide-y divide-gray-200', tableClassName)}>
                <thead className={cn('bg-gray-50', stickyHeader && 'sticky top-0 z-10')}>
                    <tr>
                        {selectable && (
                            <th className={cn(sizeClass.header, 'text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50')}>
                                <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={(e) => onSelectAll?.(e.target.checked)} className="mx-auto" />
                            </th>
                        )}
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={cn(sizeClass.header, sizeClass.text, 'font-medium text-gray-500 uppercase tracking-wider', alignClasses[col.align || 'left'], col.sortable && 'cursor-pointer hover:bg-gray-100 transition-colors', col.headerClassName)}
                                style={{ width: col.width }}
                                onClick={() => handleSort(col)}
                            >
                                <div className={cn('flex items-center gap-2', col.align === 'center' && 'justify-center', col.align === 'right' && 'justify-end')}>
                                    {col.header}
                                    {col.sortable && <SortIcon sortConfig={sortConfig} columnKey={col.key} />}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={cn('bg-white divide-y divide-gray-200', striped && '[&>tr:nth-child(even)]:bg-gray-50')}>
                    {isLoading && <SkeletonTable rows={loadingRows} cols={colSpan} compact={compact} />}
                    {!isLoading && (!data || data.length === 0) && <EmptyState colSpan={colSpan} message={emptyMessage} customState={emptyState} />}
                    {!isLoading && data.map((row, idx) => (
                        <tr
                            key={idx}
                            onClick={() => onRowClick?.(row, idx)}
                            className={cn('transition-colors', onRowClick && 'cursor-pointer', hoverable && 'hover:bg-gray-50', selectedRows.has(idx) && 'bg-blue-50 border-l-2 border-l-blue-600', rowClassName?.(row, idx))}
                        >
                            {selectable && (
                                <td className={cn(sizeClass.cell, 'whitespace-nowrap')}>
                                    <Checkbox checked={selectedRows.has(idx)} onChange={(e) => onRowSelect?.(idx, e.target.checked)} className="mx-auto" />
                                </td>
                            )}
                            {columns.map((col) => (
                                <td key={col.key} className={cn(sizeClass.cell, sizeClass.text, 'text-gray-900', alignClasses[col.align || 'left'], col.truncate && 'truncate max-w-0', col.cellClassName)} style={{ width: col.width }}>
                                    <div className={cn(col.truncate && 'truncate', col.align === 'center' && 'flex justify-center', col.align === 'right' && 'flex justify-end')}>
                                        {col.render ? col.render(row, idx) : (row[col.key] as React.ReactNode)}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                {footer && <tfoot className="bg-gray-50 border-t border-gray-200">{footer}</tfoot>}
            </table>
        </div>
    );
}

Table.Actions = TableActions;
Table.Footer = TableFooter;
Table.Container = TableContainer;