import { AppError } from './app.error';
import { ERROR_CODES } from '../constants/error.constants';

export class ValidationError extends AppError {
  public readonly fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message, ERROR_CODES.VALIDATION_ERROR, 400);
    this.fields = fields;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  static fromZodError(error: any): ValidationError {
    const fields: Record<string, string> = {};
    
    if (error.errors) {
      error.errors.forEach((err: any) => {
        const path = err.path.join('.');
        fields[path] = err.message;
      });
    }

    return new ValidationError('Validation failed', fields);
  }
}