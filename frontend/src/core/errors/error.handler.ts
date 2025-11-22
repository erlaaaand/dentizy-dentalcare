// frontend/src/core/errors/error.handler.ts

import { ApiError, parseApiError } from './api.error';
import { ERROR_MESSAGES } from '@/core/constants/error.constants';

/**
 * Global error handler
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorListeners: Array<(error: ApiError) => void> = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle error and return user-friendly message
   */
  handle(error: any): ApiError {
    const apiError = this.parseError(error);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', apiError);
    }

    // Notify listeners
    this.notifyListeners(apiError);

    return apiError;
  }

  /**
   * Parse error to ApiError
   */
  private parseError(error: any): ApiError {
    // Already an ApiError
    if (error instanceof ApiError) {
      return error;
    }

    // Axios error
    if (error.isAxiosError) {
      return parseApiError(error);
    }

    // Standard Error
    if (error instanceof Error) {
      return new ApiError(error.message);
    }

    // Unknown error
    return new ApiError(ERROR_MESSAGES.UNKNOWN_ERROR);
  }

  /**
   * Add error listener
   */
  addListener(listener: (error: ApiError) => void) {
    this.errorListeners.push(listener);
  }

  /**
   * Remove error listener
   */
  removeListener(listener: (error: ApiError) => void) {
    this.errorListeners = this.errorListeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(error: ApiError) {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }

  /**
   * Handle authentication error (redirect to login)
   */
  handleAuthError() {
    // Clear tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    // Redirect to login
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
      window.location.href = redirectUrl;
    }
  }

  /**
   * Handle permission error
   */
  handlePermissionError() {
    // Show toast or redirect to home
    console.warn('Permission denied');
  }
}

/**
 * Global error handler instance
 */
export const errorHandler = ErrorHandler.getInstance();

/**
 * Handle async errors with try-catch wrapper
 */
export async function handleAsync<T>(
  promise: Promise<T>,
  errorMessage?: string
): Promise<[Error | null, T | null]> {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    const handledError = errorHandler.handle(error);
    
    if (errorMessage) {
      handledError.message = errorMessage;
    }

    return [handledError, null];
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      const apiError = errorHandler.handle(error);
      if (apiError.isAuthError() || apiError.isPermissionError() || apiError.isValidationError()) {
        throw apiError;
      }

      // Wait before retry
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw errorHandler.handle(lastError);
}

/**
 * Safe execution wrapper
 */
export function safeExecute<T>(
  fn: () => T,
  fallback: T,
  onError?: (error: Error) => void
): T {
  try {
    return fn();
  } catch (error) {
    const handledError = errorHandler.handle(error);
    
    if (onError) {
      onError(handledError);
    }

    return fallback;
  }
}