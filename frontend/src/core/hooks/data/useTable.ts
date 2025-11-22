// frontend/src/core/hooks/data/useTable.ts
import { useState, useMemo, useCallback } from 'react';
import { PaginationParams, SortOrder } from '@/core/types/api';
import { PAGINATION } from '@/core/config/app.config';

interface UseTableOptions {
  defaultPage?: number;
  defaultLimit?: number;
  defaultSortBy?: string;
  defaultSortOrder?: SortOrder;
}

export function useTable(options: UseTableOptions = {}) {
  const [page, setPage] = useState(options.defaultPage || PAGINATION.DEFAULT_PAGE);
  const [limit, setLimit] = useState(options.defaultLimit || PAGINATION.DEFAULT_LIMIT);
  const [sortBy, setSortBy] = useState(options.defaultSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(options.defaultSortOrder || 'asc');

  const params = useMemo<PaginationParams>(
    () => ({
      page,
      limit,
      sortBy,
      sortOrder,
    }),
    [page, limit, sortBy, sortOrder]
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy]);

  const reset = useCallback(() => {
    setPage(options.defaultPage || 1);
    setLimit(options.defaultLimit || PAGINATION.DEFAULT_LIMIT);
    setSortBy(options.defaultSortBy);
    setSortOrder(options.defaultSortOrder || 'asc');
  }, [options]);

  return {
    params,
    page,
    limit,
    sortBy,
    sortOrder,
    setPage: handlePageChange,
    setLimit: handleLimitChange,
    handleSort,
    reset,
  };
}