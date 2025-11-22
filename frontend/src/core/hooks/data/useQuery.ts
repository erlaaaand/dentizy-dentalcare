// frontend/src/core/hooks/data/useQuery.ts (Optional - for React Query)
import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '@/core/types/api';
import { errorHandler } from '@/core/errors/error.handler';

interface UseQueryOptions<T> {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
}

export function useQuery<T>(
    queryKey: string[],
    queryFn: () => Promise<ApiResponse<T>>,
    options: UseQueryOptions<T> = {}
) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const { enabled = true, refetchOnWindowFocus = false, onSuccess, onError } = options;

    const fetchData = useCallback(async () => {
        if (!enabled) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await queryFn();
            setData(response.data);
            onSuccess?.(response.data);
        } catch (err) {
            const handledError = errorHandler.handle(err);
            setError(handledError);
            onError?.(handledError);
        } finally {
            setIsLoading(false);
        }
    }, [queryFn, enabled, onSuccess, onError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!refetchOnWindowFocus) return;

        const handleFocus = () => {
            fetchData();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [refetchOnWindowFocus, fetchData]);

    const refetch = useCallback(() => {
        return fetchData();
    }, [fetchData]);

    return {
        data,
        isLoading,
        error,
        refetch,
    };
}