import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label?: string;
    error?: string;
    hint?: string;
    options: SelectOption[];
    placeholder?: string;
    containerClassName?: string;
    onChange?: (value: string) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            label,
            error,
            hint,
            options,
            placeholder,
            className,
            containerClassName,
            id,
            disabled,
            required,
            onChange,
            value,
            ...props
        },
        ref
    ) => {
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

        const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            onChange?.(e.target.value);
        };

        return (
            <div className={cn('w-full', containerClassName)}>
                {label && (
                    <label
                        htmlFor={selectId}
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
                    <select
                        ref={ref}
                        id={selectId}
                        disabled={disabled}
                        value={value}
                        onChange={handleChange}
                        className={cn(
                            'w-full px-4 py-2 border rounded-lg transition-colors appearance-none',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                            'bg-white cursor-pointer',
                            error && 'border-red-500 focus:ring-red-500',
                            disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
                            !error && !disabled && 'border-gray-300',
                            className
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {error && (
                    <p id={`${selectId}-error`} className="mt-1 text-sm text-red-600 flex items-center gap-1">
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
                    <p id={`${selectId}-hint`} className="mt-1 text-sm text-gray-500">
                        {hint}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;