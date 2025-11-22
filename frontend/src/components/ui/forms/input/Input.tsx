import React, { forwardRef } from 'react';
import { cn } from '@/core';
import { InputProps } from './input.types';
import { PasswordInput } from './PasswordInput';
import { inputSizeClasses, inputVariantClasses } from './input.styles';

const ErrorIcon = () => (
    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, leftIcon, rightIcon, className, containerClassName, id, type = 'text', disabled, required, size = 'md', ...props }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

        const sizeClass = inputSizeClasses[size as keyof typeof inputSizeClasses] || inputSizeClasses.md;

        const getVariantClass = () => {
            if (disabled) return inputVariantClasses.disabled;
            if (error) return inputVariantClasses.error;
            return inputVariantClasses.default;
        };

        const variantClass = getVariantClass();

        return (
            <div className={cn('w-full', containerClassName)}>
                {label && (
                    <label htmlFor={inputId} className={cn('block font-medium', sizeClass.label, variantClass.label)}>
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && <div className={cn('absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400', sizeClass.icon)}>{leftIcon}</div>}
                    <input
                        ref={ref}
                        id={inputId}
                        type={type}
                        disabled={disabled}
                        className={cn('w-full border rounded-lg transition-colors focus:outline-none focus:ring-2 placeholder:text-gray-400', sizeClass.input, variantClass.input, leftIcon && 'pl-10', rightIcon && 'pr-10', className)}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                        {...props}
                    />
                    {rightIcon && <div className={cn('absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400', sizeClass.icon)}>{rightIcon}</div>}
                </div>
                {error && (
                    <div id={`${inputId}-error`} className={cn('flex items-center gap-1 text-red-600', sizeClass.hint)}>
                        <ErrorIcon />
                        {error}
                    </div>
                )}
                {hint && !error && (
                    <p id={`${inputId}-hint`} className={cn('text-gray-500', sizeClass.hint)}>
                        {hint}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

const InputComponent = Object.assign(Input, { Password: PasswordInput });
export default InputComponent;