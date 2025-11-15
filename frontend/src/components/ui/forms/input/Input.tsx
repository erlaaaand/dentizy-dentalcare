import React, { forwardRef } from 'react';
import { cn } from '@/core/utils';
import { InputProps } from './input.types';
import { PasswordInput } from './PasswordInput';
import { inputSizeClasses, inputVariantClasses } from './input.styles';
import { ErrorIcon } from './Icon.styles';

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            hint,
            leftIcon,
            rightIcon,
            className,
            containerClassName,
            id,
            type = 'text',
            disabled,
            required,
            size = 'md',
            ...props
        },
        ref
    ) => {
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
                {/* Label */}
                {label && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            'block font-medium',
                            sizeClass.label,
                            variantClass.label
                        )}
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                {/* Input Container */}
                <div className="relative">
                    {/* Left Icon */}
                    {leftIcon && (
                        <div className={cn(
                            'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400',
                            sizeClass.icon
                        )}>
                            {leftIcon}
                        </div>
                    )}

                    {/* Input Field */}
                    <input
                        ref={ref}
                        id={inputId}
                        type={type}
                        disabled={disabled}
                        className={cn(
                            'w-full border rounded-lg transition-colors focus:outline-none focus:ring-2 placeholder:text-gray-400',
                            sizeClass.input,
                            variantClass.input,
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            className
                        )}
                        aria-invalid={!!error}
                        aria-describedby={
                            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
                        }
                        {...props}
                    />

                    {/* Right Icon */}
                    {rightIcon && (
                        <div className={cn(
                            'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400',
                            sizeClass.icon
                        )}>
                            {rightIcon}
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div
                        id={`${inputId}-error`}
                        className={cn('flex items-center gap-1 text-red-600', sizeClass.hint)}
                    >
                        <ErrorIcon />
                        {error}
                    </div>
                )}

                {/* Hint Message */}
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


// Attach specialized components to main Input component
const InputComponent = Object.assign(Input, {
    Password: PasswordInput,
});

export default InputComponent;