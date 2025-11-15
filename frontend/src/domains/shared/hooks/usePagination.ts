import { useState, useMemo, useCallback } from 'react';

interface UsePaginationProps {
    totalItems: number;
    itemsPerPage?: number;
    initialPage?: number;
}

interface UsePaginationReturn {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    startIndex: number;
    endIndex: number;
    canGoNext: boolean;
    canGoPrevious: boolean;
    goToPage: (page: number) => void;
    goToNextPage: () => void;
    goToPreviousPage: () => void;
    goToFirstPage: () => void;
    goToLastPage: () => void;
    setItemsPerPage: (items: number) => void;
}

/**
 * Handle pagination logic
 */
export function usePagination({
    totalItems,
    itemsPerPage = 10,
    initialPage = 1
}: UsePaginationProps): UsePaginationReturn {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [perPage, setPerPage] = useState(itemsPerPage);

    const totalPages = useMemo(() => {
        return Math.ceil(totalItems / perPage);
    }, [totalItems, perPage]);

    const startIndex = useMemo(() => {
        return (currentPage - 1) * perPage;
    }, [currentPage, perPage]);

    const endIndex = useMemo(() => {
        return Math.min(startIndex + perPage, totalItems);
    }, [startIndex, perPage, totalItems]);

    const canGoNext = currentPage < totalPages;
    const canGoPrevious = currentPage > 1;

    const goToPage = useCallback((page: number) => {
        const pageNumber = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(pageNumber);
    }, [totalPages]);

    const goToNextPage = useCallback(() => {
        if (canGoNext) {
            setCurrentPage(prev => prev + 1);
        }
    }, [canGoNext]);

    const goToPreviousPage = useCallback(() => {
        if (canGoPrevious) {
            setCurrentPage(prev => prev - 1);
        }
    }, [canGoPrevious]);

    const goToFirstPage = useCallback(() => {
        setCurrentPage(1);
    }, []);

    const goToLastPage = useCallback(() => {
        setCurrentPage(totalPages);
    }, [totalPages]);

    const setItemsPerPage = useCallback((items: number) => {
        setPerPage(items);
        setCurrentPage(1);
    }, []);

    return {
        currentPage,
        totalPages,
        itemsPerPage: perPage,
        startIndex,
        endIndex,
        canGoNext,
        canGoPrevious,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        goToFirstPage,
        goToLastPage,
        setItemsPerPage
    };
}