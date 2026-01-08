import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let validationErrors: any[] = [];
    let message = 'Validation failed';

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseBody = exceptionResponse as any;

      // Handle class-validator errors
      if (Array.isArray(responseBody.message)) {
        validationErrors = this.formatValidationErrors(responseBody.message);
        message = 'Input validation failed';
      } else if (typeof responseBody.message === 'string') {
        message = responseBody.message;
      }
    }

    this.logger.warn(
      `Validation failed for ${request.method} ${request.url}`,
      validationErrors,
    );

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: 'ValidationError',
      message,
      ...(validationErrors.length > 0 && { validationErrors }),
    };

    response.status(status).json(errorResponse);
  }

  /**
   * Format validation errors into user-friendly format
   */
  private formatValidationErrors(errors: any[]): any[] {
    return errors.map((error) => {
      if (typeof error === 'string') {
        return { message: error };
      }

      return {
        field: error.property,
        message: Object.values(error.constraints || {}).join(', '),
        value: error.value,
      };
    });
  }
}
