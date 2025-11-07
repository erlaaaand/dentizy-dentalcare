import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    description?: string;
    error?: string;
    containerClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    (
        {
            label,
            description,
            error,
            className,
            containerClassName,
            id,
            disabled,
            ...props
        },
        ref
    ) => {
        const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className={cn('w-full', containerClassName)}>
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            ref={ref}
                            id={checkboxId}
                            type="checkbox"
                            disabled={disabled}
                            className={cn(
                                'w-4 h-4 border-gray-300 rounded transition-colors',
                                'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                                'text-blue-600 cursor-pointer',
                                disabled && 'cursor-not-allowed opacity-60',
                                error && 'border-red-500',
                                className
                            )}
                            aria-invalid={!!error}
                            aria-describedby={
                                error ? `${checkboxId}-error` : description ? `${checkboxId}-description` : undefined
                            }
                            {...props}
                        />
                    </div>
                    {(label || description) && (
                        <div className="ml-3">
                            {label && (
                                <label
                                    htmlFor={checkboxId}
                                    className={cn(
                                        'text-sm font-medium text-gray-700 cursor-pointer',
                                        disabled && 'text-gray-400 cursor-not-allowed'
                                    )}
                                >
                                    {label}
                                </label>
                            )}
                            {description && (
                                <p
                                    id={`${checkboxId}-description`}
                                    className={cn(
                                        'text-sm text-gray-500',
                                        disabled && 'text-gray-400'
                                    )}
                                >
                                    {description}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {error && (
                    <p id={`${checkboxId}-error`} className="mt-1 text-sm text-red-600 flex items-center gap-1">
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
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;