import { useState, useEffect } from 'react';

interface UseFetchOptions {
    immediate?: boolean;
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}

interface UseFetchReturn<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Hook for data fetching with loading and error states
 */
export function useFetch<T>(
    fetchFn: () => Promise<T>,
    options: UseFetchOptions = {}
): UseFetchReturn<T> {
    const { immediate = true, onSuccess, onError } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchFn();
            setData(result);
            onSuccess?.(result);
        } catch (err) {
            const error = err as Error;
            setError(error);
            onError?.(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (immediate) {
            fetchData();
        }
    }, []);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
    };
}