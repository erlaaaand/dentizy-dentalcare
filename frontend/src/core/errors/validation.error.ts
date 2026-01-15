import { AppError } from './app.error';
import { ERROR_MESSAGES } from '../constants/error.constants';

export class ValidationError extends AppError {
  public readonly fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message, ERROR_MESSAGES.VALIDATION_ERROR, 400);
    this.fields = fields;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  static fromZodError(error: unknown): ValidationError {
    const fields: Record<string, string> = {};

    // Pastikan error adalah object dengan properti errors (array)
    if (
      error &&
      typeof error === "object" &&
      "errors" in error &&
      Array.isArray((error as Record<string, unknown>)["errors"])
    ) {
      const errors = (error as { errors: unknown[] }).errors;

      errors.forEach((err) => {
        if (
          err &&
          typeof err === "object" &&
          "path" in err &&
          "message" in err &&
          Array.isArray((err as Record<string, unknown>)["path"]) &&
          typeof (err as Record<string, unknown>)["message"] === "string"
        ) {
          const path = (err as { path: string[] }).path.join(".");
          const message = (err as { message: string }).message;
          fields[path] = message;
        }
      });
    }

    return new ValidationError("Validation failed", fields);
  }
}