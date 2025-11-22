import { z } from 'zod';

// Form State
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Form Config
export interface FormConfig<T> {
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

export type FormFieldValue = string | number | boolean | Date | null | undefined;

export type FieldValidator<T = unknown> = ValidationRule<T> | ValidationRule<T>[];