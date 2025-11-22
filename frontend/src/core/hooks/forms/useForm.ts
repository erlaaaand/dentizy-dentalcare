// frontend/src/core/hooks/forms/useForm.ts
import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { FormState, FormConfig } from '@/core/types/forms';

export function useForm<T extends Record<string, any>>(config: FormConfig<T>) {
    const [values, setValues] = useState<T>(config.initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = useCallback(
        (fieldValues: T = values): Partial<Record<keyof T, string>> => {
            if (!config.validationSchema) return {};

            try {
                config.validationSchema.parse(fieldValues);
                return {};
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const fieldErrors: Partial<Record<keyof T, string>> = {};
                    error.errors.forEach((err) => {
                        const field = err.path[0] as keyof T;
                        if (field) {
                            fieldErrors[field] = err.message;
                        }
                    });
                    return fieldErrors;
                }
                return {};
            }
        },
        [config.validationSchema, values]
    );

    const validateField = useCallback(
        (name: keyof T, value: any): string | undefined => {
            const fieldErrors = validate({ ...values, [name]: value });
            return fieldErrors[name];
        },
        [values, validate]
    );

    const setFieldValue = useCallback(
        (name: keyof T, value: any) => {
            setValues(prev => ({ ...prev, [name]: value }));

            if (config.validateOnChange) {
                const error = validateField(name, value);
                setErrors(prev => ({ ...prev, [name]: error }));
            }
        },
        [config.validateOnChange, validateField]
    );

    const setFieldTouched = useCallback(
        (name: keyof T, isTouched: boolean = true) => {
            setTouched(prev => ({ ...prev, [name]: isTouched }));

            if (config.validateOnBlur && isTouched) {
                const error = validateField(name, values[name]);
                setErrors(prev => ({ ...prev, [name]: error }));
            }
        },
        [config.validateOnBlur, values, validateField]
    );

    const handleChange = useCallback(
        (name: keyof T) => (value: any) => {
            setFieldValue(name, value);
        },
        [setFieldValue]
    );

    const handleBlur = useCallback(
        (name: keyof T) => () => {
            setFieldTouched(name, true);
        },
        [setFieldTouched]
    );

    const resetForm = useCallback(() => {
        setValues(config.initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [config.initialValues]);

    const handleSubmit = useCallback(
        async (e?: React.FormEvent) => {
            e?.preventDefault();

            const validationErrors = validate(values);
            setErrors(validationErrors);

            if (Object.keys(validationErrors).length > 0) {
                return;
            }

            setIsSubmitting(true);

            try {
                await config.onSubmit(values);
            } catch (error) {
                console.error('Form submission error:', error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [values, validate, config]
    );

    const isValid = useMemo(() => {
        return Object.keys(errors).length === 0;
    }, [errors]);

    const formState: FormState<T> = {
        values,
        errors,
        touched,
        isSubmitting,
        isValid,
    };

    return {
        ...formState,
        setFieldValue,
        setFieldTouched,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        validate,
    };
}