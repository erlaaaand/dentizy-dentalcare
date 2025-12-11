// frontend/src/core/errors/api.error.ts

import { HTTP_STATUS } from '@/core/constants/api.constants';

/**
 * Custom API Error Class
 */
export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;
  timestamp: string;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if error is a network error
   */
  isNetworkError(): boolean {
    return this.statusCode === 0 || this.message.includes('Network Error');
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(): boolean {
    return this.statusCode === HTTP_STATUS.UNAUTHORIZED;
  }

  /**
   * Check if error is a permission error
   */
  isPermissionError(): boolean {
    return this.statusCode === HTTP_STATUS.FORBIDDEN;
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(): boolean {
    return (
      this.statusCode === HTTP_STATUS.BAD_REQUEST ||
      this.statusCode === HTTP_STATUS.UNPROCESSABLE_ENTITY
    );
  }

  /**
   * Check if error is a not found error
   */
  isNotFoundError(): boolean {
    return this.statusCode === HTTP_STATUS.NOT_FOUND;
  }

  /**
   * Check if error is a conflict error
   */
  isConflictError(): boolean {
    return this.statusCode === HTTP_STATUS.CONFLICT;
  }

  /**
   * Check if error is a server error
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    if (this.isNetworkError()) {
      return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    }

    if (this.isAuthError()) {
      return 'Sesi Anda telah berakhir. Silakan login kembali.';
    }

    if (this.isPermissionError()) {
      return 'Anda tidak memiliki izin untuk melakukan operasi ini.';
    }

    if (this.isNotFoundError()) {
      return 'Data yang Anda cari tidak ditemukan.';
    }

    if (this.isServerError()) {
      return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
    }

    return this.message || 'Terjadi kesalahan. Silakan coba lagi.';
  }

  /**
   * Get validation errors in a formatted way
   */
  getValidationErrors(): Record<string, string> {
    if (!this.errors) return {};

    const formattedErrors: Record<string, string> = {};
    
    for (const [field, messages] of Object.entries(this.errors)) {
      formattedErrors[field] = Array.isArray(messages) 
        ? messages[0] 
        : String(messages);
    }

    return formattedErrors;
  }

  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errors: this.errors,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Network Error (Connection failed)
 */
export class NetworkError extends ApiError {
  constructor(message: string = 'Tidak dapat terhubung ke server') {
    super(message, 0);
    this.name = 'NetworkError';
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Sesi Anda telah berakhir') {
    super(message, HTTP_STATUS.UNAUTHORIZED);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Anda tidak memiliki izin untuk melakukan operasi ini') {
    super(message, HTTP_STATUS.FORBIDDEN);
    this.name = 'ForbiddenError';
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Data tidak ditemukan') {
    super(message, HTTP_STATUS.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

/**
 * Validation Error (400/422)
 */
export class ValidationError extends ApiError {
  constructor(message: string = 'Data tidak valid', errors?: Record<string, string[]>) {
    super(message, HTTP_STATUS.BAD_REQUEST, errors);
    this.name = 'ValidationError';
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Data sudah ada dalam sistem') {
    super(message, HTTP_STATUS.CONFLICT);
    this.name = 'ConflictError';
  }
}

/**
 * Server Error (500)
 */
export class ServerError extends ApiError {
  constructor(message: string = 'Terjadi kesalahan pada server') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    this.name = 'ServerError';
  }
}

/**
 * Timeout Error
 */
export class TimeoutError extends ApiError {
  constructor(message: string = 'Request timeout. Silakan coba lagi') {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE);
    this.name = 'TimeoutError';
  }
}

/**
 * Create appropriate error from HTTP status code
 */
export function createErrorFromStatus(
  statusCode: number,
  message?: string,
  errors?: Record<string, string[]>
): ApiError {
  switch (statusCode) {
    case HTTP_STATUS.UNAUTHORIZED:
      return new UnauthorizedError(message);
    case HTTP_STATUS.FORBIDDEN:
      return new ForbiddenError(message);
    case HTTP_STATUS.NOT_FOUND:
      return new NotFoundError(message);
    case HTTP_STATUS.BAD_REQUEST:
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return new ValidationError(message, errors);
    case HTTP_STATUS.CONFLICT:
      return new ConflictError(message);
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return new ServerError(message);
    default:
      return new ApiError(message || 'Terjadi kesalahan', statusCode, errors);
  }
}

/**
 * Parse error from Axios error response
 */
export function parseApiError(error: unknown): ApiError {
    // Jika error bukan object, anggap sebagai network error generic
    if (!error || typeof error !== "object") {
        return new NetworkError("Terjadi kesalahan jaringan");
    }

    // Pastikan error punya properti 'response'
    if (!("response" in error)) {
        const message =
            "message" in error && typeof (error as Record<string, unknown>)["message"] === "string"
                ? (error as Record<string, unknown>)["message"] as string
                : "Terjadi kesalahan jaringan";
        return new NetworkError(message);
    }

    const response = (error as { response: { status: number; data?: Record<string, unknown> } }).response;
    const status = response.status;
    const data = response.data;

    const message =
        (data?.["message"] as string) ||
        (typeof (error as Record<string, unknown>)["message"] === "string"
            ? ((error as Record<string, unknown>)["message"] as string)
            : "Terjadi kesalahan");

    const errors =
        data?.["errors"] && typeof data["errors"] === "object"
            ? (data["errors"] as Record<string, string[]>)
            : undefined;
            
    return createErrorFromStatus(status, message, errors);
}