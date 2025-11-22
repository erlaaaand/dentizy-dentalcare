// frontend/src/core/hooks/data/useFetch.ts
import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '@/core/types/api';
import { errorHandler } from '@/core/errors/error.handler';

interface UseFetchOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    enabled?: boolean;
}

export function useFetch<T>(
    fetcher: () => Promise<ApiResponse<T>>,
    options: UseFetchOptions<T> = {}
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const { onSuccess, onError, enabled = true } = options;

    const fetchData = useCallback(async () => {
        if (!enabled) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetcher();
            setData(response.data);
            onSuccess?.(response.data);
        } catch (err) {
            const appError = errorHandler.handle(err);
            setError(appError);
            onError?.(appError);
        } finally {
            setLoading(false);
        }
    }, [fetcher, enabled, onSuccess, onError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = useCallback(() => {
        return fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refetch,
    };
}