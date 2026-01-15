'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn, useClickOutside } from '@/core';
import { formatDate } from '@/core/formatters';
import { DatePickerProps } from './date-picker.types';
import { sizeClasses, variantClasses } from './date-picker.styles';
import { Calendar as CalendarIcon } from 'lucide-react';

// Import sub-components untuk Compound Pattern
import { DatePickerContainer } from './DatePickerContainer';
import { AppointmentDatePicker } from './AppointmentDatePicker';
import { BirthDatePicker } from './BirthDatePicker';
import { DateRangePicker } from './DateRangePicker';

export default function DatePicker({
    value,
    onChange,
    label,
    error,
    hint,
    placeholder = 'Pilih tanggal',
    min,
    max,
    disabled = false,
    required = false,
    size = 'md',
    variant = 'default',
    className,
    containerClassName,
}: DatePickerProps) {
    // Format value ke YYYY-MM-DD untuk input native
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
        if (value) {
            // Pastikan format yang masuk valid
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                setDisplayValue(value);
            }
        }
    }, [value]);

    const sizeClass = sizeClasses[size];
    const variantClass = variantClasses[variant];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setDisplayValue(newValue);
        onChange?.(newValue);
    };

    const inputId = React.useId();

    return (
        <div className={cn('relative w-full', containerClassName)}>
            {/* Label */}
            {label && (
                <label
                    htmlFor={inputId}
                    className={cn(
                        'block font-medium text-gray-700',
                        sizeClass.label,
                        disabled && 'text-gray-400'
                    )}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Input Container */}
            <div className="relative">
                <input
                    type="date"
                    id={inputId}
                    value={displayValue}
                    onChange={handleInputChange}
                    min={min}
                    max={max}
                    disabled={disabled}
                    required={required}
                    className={cn(
                        'w-full border rounded-lg transition-colors duration-200 appearance-none', // appearance-none penting untuk styling konsisten
                        'focus:outline-none',
                        sizeClass.input,
                        variantClass.base,
                        variantClass.focus,
                        error && 'border-red-500 focus:ring-red-500',
                        disabled && variantClass.disabled,
                        !error && !disabled && 'hover:border-gray-400',
                        className
                    )}
                />

                {/* Custom Calendar Icon (Optional Overlay) */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                    <CalendarIcon className={cn(sizeClass.icon)} />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-slide-down">
                    {error}
                </p>
            )}

            {/* Hint Message */}
            {hint && !error && (
                <p className="mt-1 text-sm text-gray-500">{hint}</p>
            )}
        </div>
    );
}

// Assign Sub-components
DatePicker.Container = DatePickerContainer;
DatePicker.Appointment = AppointmentDatePicker;
DatePicker.BirthDate = BirthDatePicker;
DatePicker.Range = DateRangePicker;