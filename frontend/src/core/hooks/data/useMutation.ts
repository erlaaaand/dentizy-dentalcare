// frontend/src/core/hooks/data/useMutation.ts (Optional - for React Query)
import { useState, useCallback } from 'react';
import { ApiResponse } from '@/core/types/api';
import { errorHandler } from '@/core/errors/error.handler';
import { useToast } from '../ui/useToast';

interface UseMutationConfig<TData, TVariables> {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    successMessage?: string;
    errorMessage?: string;
}

export function useMutation<TData = unknown, TVariables = void>(
    mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
    config?: UseMutationConfig<TData, TVariables>
) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const { showSuccess, showError } = useToast();

    const mutate = useCallback(async (variables: TVariables) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await mutationFn(variables);

            if (config?.successMessage) {
                showSuccess(config.successMessage);
            }

            config?.onSuccess?.(response.data, variables);
            return response.data;
        } catch (err) {
            const handledError = errorHandler.handle(err);
            setError(handledError);

            const errorMessage = config?.errorMessage || handledError.getUserMessage();
            showError(errorMessage);

            config?.onError?.(handledError, variables);
            throw handledError;
        } finally {
            setIsLoading(false);
        }
    }, [mutationFn, config, showSuccess, showError]);

    return {
        mutate,
        isLoading,
        error,
    };
}