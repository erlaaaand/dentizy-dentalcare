import { useState, useMemo, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
    field: string;
    direction: SortDirection;
}

export interface UseTableOptions<T> {
    data: T[];
    initialSort?: SortConfig;
    itemsPerPage?: number;
}

export interface UseTableReturn<T> {
    // Data
    currentData: T[];
    sortedData: T[];

    // Pagination
    currentPage: number;
    totalPages: number;
    goToPage: (page: number) => void;
    goToNextPage: () => void;
    goToPreviousPage: () => void;
    canGoNext: boolean;
    canGoPrevious: boolean;

    // Sorting
    sortConfig: SortConfig | null;
    requestSort: (field: string) => void;
    getSortDirection: (field: string) => SortDirection | null;

    // Selection
    selectedRows: Set<number>;
    toggleRowSelection: (index: number) => void;
    toggleAllRows: () => void;
    clearSelection: () => void;
    isRowSelected: (index: number) => boolean;
    isAllSelected: boolean;
}

/**
 * Hook for table functionality (sorting, pagination, selection)
 */
export function useTable<T>({
    data,
    initialSort,
    itemsPerPage = 10,
}: UseTableOptions<T>): UseTableReturn<T> {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(initialSort || null);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

    // Sorting
    const sortedData = useMemo(() => {
        if (!sortConfig) return data;

        const sorted = [...data].sort((a, b) => {
            const aValue = (a as any)[sortConfig.field];
            const bValue = (b as any)[sortConfig.field];

            if (aValue === bValue) return 0;

            if (aValue == null) return 1;
            if (bValue == null) return -1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return sortConfig.direction === 'asc'
                ? aValue < bValue ? -1 : 1
                : aValue > bValue ? -1 : 1;
        });

        return sorted;
    }, [data, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, sortedData.length);
    const currentData = sortedData.slice(startIndex, endIndex);

    const goToPage = useCallback((page: number) => {
        const pageNumber = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(pageNumber);
    }, [totalPages]);

    const goToNextPage = useCallback(() => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    }, [totalPages]);

    const goToPreviousPage = useCallback(() => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    }, []);

    const canGoNext = currentPage < totalPages;
    const canGoPrevious = currentPage > 1;

    // Sorting handlers
    const requestSort = useCallback((field: string) => {
        setSortConfig((prev) => {
            if (!prev || prev.field !== field) {
                return { field, direction: 'asc' };
            }

            if (prev.direction === 'asc') {
                return { field, direction: 'desc' };
            }

            return null;
        });
    }, []);

    const getSortDirection = useCallback((field: string): SortDirection | null => {
        if (!sortConfig || sortConfig.field !== field) return null;
        return sortConfig.direction;
    }, [sortConfig]);

    // Selection handlers
    const toggleRowSelection = useCallback((index: number) => {
        setSelectedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    }, []);

    const toggleAllRows = useCallback(() => {
        if (selectedRows.size === currentData.length) {
            setSelectedRows(new Set());
        } else {
            const allIndices = currentData.map((_, index) => startIndex + index);
            setSelectedRows(new Set(allIndices));
        }
    }, [currentData.length, selectedRows.size, startIndex]);

    const clearSelection = useCallback(() => {
        setSelectedRows(new Set());
    }, []);

    const isRowSelected = useCallback((index: number) => {
        return selectedRows.has(index);
    }, [selectedRows]);

    const isAllSelected = selectedRows.size === currentData.length && currentData.length > 0;

    return {
        currentData,
        sortedData,
        currentPage,
        totalPages,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        canGoNext,
        canGoPrevious,
        sortConfig,
        requestSort,
        getSortDirection,
        selectedRows,
        toggleRowSelection,
        toggleAllRows,
        clearSelection,
        isRowSelected,
        isAllSelected,
    };
}