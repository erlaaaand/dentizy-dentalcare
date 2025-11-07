import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
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
            ...props
        },
        ref
    ) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className={cn('w-full', containerClassName)}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            'block text-sm font-medium text-gray-700 mb-1',
                            disabled && 'text-gray-400'
                        )}
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        type={type}
                        disabled={disabled}
                        className={cn(
                            'w-full px-4 py-2 border rounded-lg transition-colors',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                            'placeholder:text-gray-400',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            error && 'border-red-500 focus:ring-red-500',
                            disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
                            !error && !disabled && 'border-gray-300',
                            className
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error && (
                    <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </p>
                )}

                {hint && !error && (
                    <p id={`${inputId}-hint`} className="mt-1 text-sm text-gray-500">
                        {hint}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;