// frontend/src/core/types/forms.ts
import { z } from 'zod';

export interface FormState<T> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isSubmitting: boolean;
    isValid: boolean;
}

export interface FormConfig<T> {
    initialValues: T;
    validationSchema?: z.ZodSchema<T>;
    onSubmit: (values: T) => Promise<void> | void;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
}

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
