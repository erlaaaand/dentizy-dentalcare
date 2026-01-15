// interface/filters/notification-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error?: string;
  details?: unknown;
  stack?: string;
}

interface ValidationErrorResponse {
  message: string[] | string;
  error?: string;
}

interface LogContext {
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  userId: string;
  statusCode: number;
  message: string;
}

interface RequestWithUser extends Request {
  user?: {
    id?: string | number;
  };
}

/**
 * Custom Exception Filter for Notifications Module
 * Provides consistent error responses and logging
 */
@Catch()
export class NotificationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(NotificationExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse = this.getErrorResponse(
      exception,
      status,
      message,
      request,
    );

    // Log error details
    this.logError(exception, request, errorResponse);

    response.status(status).json(errorResponse);
  }

  /**
   * Build standardized error response
   */
  private getErrorResponse(
    exception: unknown,
    status: number,
    message: string,
    request: Request,
  ): ErrorResponse {
    const baseResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    // Add detailed error info in development
    if (process.env.NODE_ENV === 'development') {
      return {
        ...baseResponse,
        error: exception instanceof Error ? exception.name : 'Error',
        details: this.getErrorDetails(exception),
        stack: exception instanceof Error ? exception.stack : undefined,
      };
    }

    // Production: Sanitized response
    return baseResponse;
  }

  /**
   * Extract detailed error information
   */
  private getErrorDetails(exception: unknown): unknown {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      // Handle validation errors from class-validator
      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        const validationResponse = response as ValidationErrorResponse;
        return {
          message: validationResponse.message,
          error: validationResponse.error,
        };
      }

      return response;
    }

    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
      };
    }

    return { raw: String(exception) };
  }

  /**
   * Log error with appropriate level
   */
  private logError(
    exception: unknown,
    request: Request,
    errorResponse: ErrorResponse,
  ) {
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const requestWithUser = request as RequestWithUser;
    const userId = requestWithUser.user?.id
      ? String(requestWithUser.user.id)
      : 'Anonymous';

    const logContext: LogContext = {
      method,
      url,
      ip: ip ?? 'unknown IP',
      userAgent,
      userId,
      statusCode: errorResponse.statusCode,
      message: errorResponse.message,
    };

    // Log based on severity
    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `Server Error: ${errorResponse.message}`,
        exception instanceof Error ? exception.stack : undefined,
        JSON.stringify(logContext, null, 2),
      );
    } else if (errorResponse.statusCode >= 400) {
      this.logger.warn(
        `Client Error: ${errorResponse.message}`,
        JSON.stringify(logContext, null, 2),
      );
    } else {
      this.logger.log(
        `Request processed with status ${errorResponse.statusCode}`,
        JSON.stringify(logContext, null, 2),
      );
    }
  }
}

/**
 * Specific exception filter for notification-related errors
 * Can be used to handle specific notification errors differently
 */
@Catch(HttpException)
export class NotificationHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(NotificationHttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    interface NotificationErrorResponse {
      statusCode: number;
      timestamp: string;
      path: string;
      message: string;
      context?: string;
      suggestion?: string;
    }

    const errorResponse: NotificationErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
      ...(this.isNotificationError(exception) && {
        context: 'notification',
        suggestion: this.getSuggestion(status),
      }),
    };

    // Log with notification context
    this.logger.error(
      `[Notification Error] ${request.method} ${request.url} - ${exception.message}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }

  /**
   * Check if error is notification-related
   */
  private isNotificationError(exception: HttpException): boolean {
    const message = exception.message.toLowerCase();
    return (
      message.includes('notification') ||
      message.includes('email') ||
      message.includes('reminder') ||
      message.includes('send')
    );
  }

  /**
   * Provide helpful suggestions based on error status
   */
  private getSuggestion(status: number): string {
    switch (status) {
      case HttpStatus.NOT_FOUND:
        return 'Check if the notification ID exists';
      case HttpStatus.BAD_REQUEST:
        return 'Verify notification status and retry conditions';
      case HttpStatus.CONFLICT:
        return 'Notification may already be processed';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Rate limit exceeded, please try again later';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Contact system administrator if error persists';
      default:
        return 'Please check the request and try again';
    }
  }
}

/**
 * Exception filter for validation errors
 */
@Catch()
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    interface ExceptionWithResponse {
      response?: {
        message?: string[];
        [key: string]: unknown;
      };
      getStatus?: () => number;
      message?: string;
    }

    const exceptionWithResponse = exception as ExceptionWithResponse;

    // Handle class-validator errors
    if (
      exceptionWithResponse?.response?.message &&
      Array.isArray(exceptionWithResponse.response.message)
    ) {
      const validationErrors = exceptionWithResponse.response.message;

      this.logger.warn(
        `Validation Error: ${request.method} ${request.url}`,
        JSON.stringify(validationErrors),
      );

      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    // Fallback for other errors
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
