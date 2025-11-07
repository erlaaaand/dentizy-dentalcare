import React from 'react';
import { cn } from '@/lib/utils';

export interface TableSkeletonProps {
    rows?: number;
    columns?: number;
    showHeader?: boolean;
    className?: string;
}

export default function TableSkeleton({
    rows = 5,
    columns = 4,
    showHeader = true,
    className
}: TableSkeletonProps) {
    return (
        <div className={cn('w-full overflow-x-auto rounded-lg border border-gray-200', className)}>
            <table className="min-w-full divide-y divide-gray-200">
                {showHeader && (
                    <thead className="bg-gray-50">
                        <tr>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <th key={colIndex} className="px-6 py-3">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody className="bg-white divide-y divide-gray-200">
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <td key={colIndex} className="px-6 py-4">
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