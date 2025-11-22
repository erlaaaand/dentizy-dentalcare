import { useState, useCallback, useMemo } from 'react';
import { usePagination } from './usePagination';
import { PAGINATION_CONFIG } from '../config/ui.config';

interface UseTableOptions {
    initialPage?: number;
    initialPageSize?: number;
    initialSortBy?: string;
    initialSortOrder?: 'asc' | 'desc';
}

interface UseTableReturn<T> {
    // Data
    data: T[];
    setData: (data: T[]) => void;
    
    // Pagination
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    canGoNext: boolean;
    canGoPrev: boolean;
    
    // Sorting
    sortBy: string | null;
    sortOrder: 'asc' | 'desc';
    setSorting: (field: string) => void;
    
    // Selection
    selectedRows: Set<number>;
    selectRow: (id: number) => void;
    selectAllRows: () => void;
    clearSelection: () => void;
    isRowSelected: (id: number) => boolean;
    isAllSelected: boolean;
    
    // Search/Filter
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filters: Record<string, any>;
    setFilter: (key: string, value: any) => void;
    clearFilters: () => void;
    
    // Loading state
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

/**
 * Hook for table state management
 */
export function useTable<T extends { id: number }>(
    options: UseTableOptions = {}
): UseTableReturn<T> {
    const {
        initialPage = PAGINATION_CONFIG.defaultPage,
        initialPageSize = PAGINATION_CONFIG.defaultLimit,
        initialSortBy = null,
        initialSortOrder = 'asc',
    } = options;

    // Data state
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);

    // Pagination
    const pagination = usePagination(initialPage, initialPageSize);

    // Sorting
    const [sortBy, setSortBy] = useState<string | null>(initialSortBy);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

    const setSorting = useCallback((field: string) => {
        setSortBy(prevSortBy => {
            if (prevSortBy === field) {
                setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                return field;
            }
            setSortOrder('asc');
            return field;
        });
    }, []);

    // Selection
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

    const selectRow = useCallback((id: number) => {
        setSelectedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const selectAllRows = useCallback(() => {
        if (selectedRows.size === data.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(data.map(item => item.id)));
        }
    }, [data, selectedRows.size]);

    const clearSelection = useCallback(() => {
        setSelectedRows(new Set());
    }, []);

    const isRowSelected = useCallback((id: number) => {
        return selectedRows.has(id);
    }, [selectedRows]);

    const isAllSelected = useMemo(() => {
        return data.length > 0 && selectedRows.size === data.length;
    }, [data.length, selectedRows.size]);

    // Search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Record<string, any>>({});

    const setFilter = useCallback((key: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({});
        setSearchQuery('');
    }, []);

    return {
        // Data
        data,
        setData,
        
        // Pagination
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        setPage: pagination.setPage,
        setPageSize: pagination.setPageSize,
        nextPage: pagination.nextPage,
        prevPage: pagination.prevPage,
        canGoNext: pagination.canGoNext,
        canGoPrev: pagination.canGoPrev,
        
        // Sorting
        sortBy,
        sortOrder,
        setSorting,
        
        // Selection
        selectedRows,
        selectRow,
        selectAllRows,
        clearSelection,
        isRowSelected,
        isAllSelected,
        
        // Search/Filter
        searchQuery,
        setSearchQuery,
        filters,
        setFilter,
        clearFilters,
        
        // Loading
        loading,
        setLoading,
    };
}