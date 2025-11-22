import { useMutation as useTanstackMutation, UseMutationOptions } from '@tanstack/react-query';
import { ApiResponse } from '../../types/api';
import { ErrorHandler } from '../../errors/error.handler';
import { useToast } from '../ui/useToast';

interface UseMutationConfig<TData, TVariables> extends Omit
  UseMutationOptions<ApiResponse<TData>, Error, TVariables>,
  'mutationFn'
> {
  successMessage?: string;
  errorMessage?: string;
}

export function useMutation<TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  config?: UseMutationConfig<TData, TVariables>
) {
  const { showSuccess, showError } = useToast();

  return useTanstackMutation({
    mutationFn,
    onSuccess: (response, variables, context) => {
      if (config?.successMessage) {
        showSuccess(config.successMessage);
      }
      config?.onSuccess?.(response, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = config?.errorMessage || ErrorHandler.getErrorMessage(error);
      showError(errorMessage);
      ErrorHandler.logError(error);
      config?.onError?.(error, variables, context);
    },
    ...config,
  });
}