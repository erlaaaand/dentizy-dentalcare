import React from 'react';
import { cn } from '@/lib/utils';

export interface TimePickerProps {
    value?: string;
    onChange?: (time: string) => void;
    label?: string;
    error?: string;
    hint?: string;
    placeholder?: string;
    min?: string;
    max?: string;
    step?: number;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    containerClassName?: string;
}

export default function TimePicker({
    value,
    onChange,
    label,
    error,
    hint,
    placeholder = 'Pilih waktu',
    min,
    max,
    step = 1,
    disabled,
    required,
    className,
    containerClassName
}: TimePickerProps) {
    const inputId = `timepicker-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

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
                <input
                    type="time"
                    id={inputId}
                    value={value || ''}
                    onChange={handleChange}
                    min={min}
                    max={max}
                    step={step}
                    disabled={disabled}
                    placeholder={placeholder}
                    required={required}
                    className={cn(
                        'w-full px-4 py-2 pr-10 border rounded-lg transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        error && 'border-red-500 focus:ring-red-500',
                        disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
                        !error && !disabled && 'border-gray-300',
                        className
                    )}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
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
                <p className="mt-1 text-sm text-gray-500">{hint}</p>
            )}
        </div>
    );
}