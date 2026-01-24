import { useState } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

/**
 * Hook untuk memanage state halaman dan limit tabel
 */
export function usePagination(defaultPage = 1, defaultLimit = 10): PaginationState {
  const [page, setPage] = useState<number>(defaultPage);
  const [limit, setLimit] = useState<number>(defaultLimit);

  const onPageChange = (newPage: number) => {
    setPage(newPage);
  };

  const onLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset ke halaman 1 jika limit berubah
  };

  return {
    page,
    limit,
    onPageChange,
    onLimitChange,
  };
}