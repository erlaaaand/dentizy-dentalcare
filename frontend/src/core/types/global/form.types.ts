// frontend/src/core/types/forms.ts
import { z } from 'zod';

// Form State
export interface FormState<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Form Config
export interface FormConfig<T extends Record<string, any>> {
  initialValues: T;
  validationSchema?: z.ZodSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// Field Props
export interface FieldConfig {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  type?: string;
}

export type FormFieldValue = string | number | boolean | Date | null | undefined;

export interface FormField {
  name: string;
  value: FormFieldValue;
  error?: string;
  touched: boolean;
}

// Validation
export type ValidationRule<T = unknown> = {
  validate: (value: T) => boolean | string;
  message?: string;
};

export type FieldValidator<T = unknown> = ValidationRule<T> | ValidationRule<T>[];