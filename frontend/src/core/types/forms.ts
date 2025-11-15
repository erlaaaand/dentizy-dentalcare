/**
 * Form-related type definitions
 */

import { ReactNode } from 'react';

// Generic form field props
export interface FormFieldProps {
    name: string;
    label: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    helpText?: string;
}

// Input types
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local';

export interface InputProps extends FormFieldProps {
    type?: InputType;
    value: string | number;
    onChange: (value: string) => void;
    onBlur?: () => void;
    maxLength?: number;
    min?: number | string;
    max?: number | string;
    step?: number | string;
}

// Select props
export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends FormFieldProps {
    value: string | number;
    onChange: (value: string) => void;
    onBlur?: () => void;
    options: SelectOption[];
    emptyOption?: string;
}

// Textarea props
export interface TextareaProps extends FormFieldProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    rows?: number;
    maxLength?: number;
}

// Checkbox props
export interface CheckboxProps {
    name: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    error?: string;
}

// Radio props
export interface RadioOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface RadioGroupProps extends FormFieldProps {
    value: string | number;
    onChange: (value: string) => void;
    options: RadioOption[];
}

// File upload props
export interface FileUploadProps extends FormFieldProps {
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
    onChange: (files: File[]) => void;
}

// Form validation
export interface ValidationError {
    field: string;
    message: string;
}

export interface FormValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

// Form state
export interface FormState<T = any> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isSubmitting: boolean;
    isValid: boolean;
}

// Form handlers
export interface FormHandlers<T = any> {
    handleChange: (field: keyof T, value: any) => void;
    handleBlur: (field: keyof T) => void;
    handleSubmit: (e: React.FormEvent) => void;
    resetForm: () => void;
    setFieldValue: (field: keyof T, value: any) => void;
    setFieldError: (field: keyof T, error: string) => void;
    setFieldTouched: (field: keyof T, touched: boolean) => void;
}

// Form props
export interface FormProps<T = any> {
    initialValues: T;
    validationSchema?: (values: T) => FormValidationResult;
    onSubmit: (values: T) => void | Promise<void>;
    children: (state: FormState<T>, handlers: FormHandlers<T>) => ReactNode;
}