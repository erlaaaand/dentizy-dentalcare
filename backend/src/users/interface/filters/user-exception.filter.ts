import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class UserExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UserExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';
    let details: any = undefined;

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
        details = (exceptionResponse as any).details;
      }
    } else if (exception instanceof QueryFailedError) {
      // Handle database errors
      status = HttpStatus.BAD_REQUEST;
      const dbError = this.handleDatabaseError(exception);
      message = dbError.message;
      error = dbError.error;
      details = dbError.details;
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Error: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Build response
    const errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
    };

    // Add details if available
    if (details) {
      errorResponse.details = details;
    }

    // Add validation errors if present
    if (status === HttpStatus.BAD_REQUEST && Array.isArray(message)) {
      errorResponse.validationErrors = message;
      errorResponse.message = 'Validation failed';
    }

    // Don't expose stack trace in production
    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      errorResponse.stack = exception.stack;
    }

    response.status(status).json(errorResponse);
  }

  /**
   * Handle database-specific errors
   */
  private handleDatabaseError(error: QueryFailedError): {
    message: string;
    error: string;
    details?: any;
  } {
    const dbError = error as any;

    // PostgreSQL error codes
    switch (dbError.code) {
      case '23505': // Unique violation
        return {
          message: this.extractUniqueViolationMessage(dbError),
          error: 'ConflictError',
          details: {
            constraint: dbError.constraint,
            table: dbError.table,
          },
        };

      case '23503': // Foreign key violation
        return {
          message: 'Data terkait tidak ditemukan atau sedang digunakan',
          error: 'ForeignKeyViolation',
          details: {
            constraint: dbError.constraint,
            table: dbError.table,
          },
        };

      case '23502': // Not null violation
        return {
          message: 'Field yang required tidak boleh kosong',
          error: 'NotNullViolation',
          details: {
            column: dbError.column,
            table: dbError.table,
          },
        };

      case '22P02': // Invalid text representation
        return {
          message: 'Format data tidak valid',
          error: 'InvalidDataFormat',
        };

      default:
        this.logger.error(`Unhandled database error: ${dbError.code}`, dbError);
        return {
          message: 'Database error occurred',
          error: 'DatabaseError',
          details:
            process.env.NODE_ENV === 'development'
              ? { code: dbError.code, detail: dbError.detail }
              : undefined,
        };
    }
  }

  /**
   * Extract user-friendly message from unique violation error
   */
  private extractUniqueViolationMessage(error: any): string {
    if (error.constraint?.includes('username')) {
      return 'Username sudah digunakan';
    }

    if (error.constraint?.includes('email')) {
      return 'Email sudah terdaftar';
    }

    // Extract the duplicate value if available
    if (error.detail) {
      const match = error.detail.match(/Key \((.+?)\)=\((.+?)\)/);
      if (match) {
        return `${match[1]} "${match[2]}" sudah digunakan`;
      }
    }

    return 'Data sudah ada dalam sistem';
  }
}
