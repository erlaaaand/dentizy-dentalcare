import React from 'react';
import { cn } from '@/core/utils';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    showInfo?: boolean;
    startIndex?: number;
    endIndex?: number;
    totalItems?: number;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    showInfo = true,
    startIndex,
    endIndex,
    totalItems
}: PaginationProps) {
    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            {showInfo && startIndex !== undefined && endIndex !== undefined && totalItems !== undefined && (
                <span className="text-sm text-gray-700">
                    Menampilkan {startIndex + 1} - {endIndex} dari {totalItems} data
                </span>
            )}
            
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!canGoPrevious}
                    className={cn(
                        "px-3 py-1 text-sm rounded-lg transition-colors",
                        canGoPrevious
                            ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                >
                    Sebelumnya
                </button>
                
                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg font-medium">
                    Halaman {currentPage} dari {totalPages}
                </span>
                
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!canGoNext}
                    className={cn(
                        "px-3 py-1 text-sm rounded-lg transition-colors",
                        canGoNext
                            ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                >
                    Selanjutnya
                </button>
            </div>
        </div>
    );
}