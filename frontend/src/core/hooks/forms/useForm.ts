import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
    initialValues: T;
    validate?: (values: T) => Partial<Record<keyof T, string>>;
    onSubmit: (values: T) => void | Promise<void>;
}

interface UseFormReturn<T> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isSubmitting: boolean;
    isDirty: boolean;
    isValid: boolean;
    handleChange: (field: keyof T, value: any) => void;
    handleBlur: (field: keyof T) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    setFieldValue: (field: keyof T, value: any) => void;
    setFieldError: (field: keyof T, error: string) => void;
    setFieldTouched: (field: keyof T, touched: boolean) => void;
    resetForm: () => void;
    setValues: (values: T) => void;
}

/**
 * Hook for form state management
 */
export function useForm<T extends Record<string, any>>(
    options: UseFormOptions<T>
): UseFormReturn<T> {
    const { initialValues, validate, onSubmit } = options;

    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);
    const isValid = Object.keys(errors).length === 0;

    const handleChange = useCallback((field: keyof T, value: any) => {
        setValues(prev => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [errors]);

    const handleBlur = useCallback((field: keyof T) => {
        setTouched(prev => ({
            ...prev,
            [field]: true,
        }));

        // Validate field on blur
        if (validate) {
            const validationErrors = validate(values);
            if (validationErrors[field]) {
                setErrors(prev => ({
                    ...prev,
                    [field]: validationErrors[field],
                }));
            }
        }
    }, [values, validate]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce((acc, key) => {
            acc[key as keyof T] = true;
            return acc;
        }, {} as Partial<Record<keyof T, boolean>>);
        setTouched(allTouched);

        // Validate
        if (validate) {
            const validationErrors = validate(values);
            setErrors(validationErrors);

            if (Object.keys(validationErrors).length > 0) {
                return;
            }
        }

        // Submit
        setIsSubmitting(true);
        try {
            await onSubmit(values);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [values, validate, onSubmit]);

    const setFieldValue = useCallback((field: keyof T, value: any) => {
        handleChange(field, value);
    }, [handleChange]);

    const setFieldError = useCallback((field: keyof T, error: string) => {
        setErrors(prev => ({
            ...prev,
            [field]: error,
        }));
    }, []);

    const setFieldTouched = useCallback((field: keyof T, touchedValue: boolean) => {
        setTouched(prev => ({
            ...prev,
            [field]: touchedValue,
        }));
    }, []);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        isDirty,
        isValid,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        setFieldError,
        setFieldTouched,
        resetForm,
        setValues,
    };
}