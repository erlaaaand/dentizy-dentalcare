import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/lib/hooks';

export interface DatePickerProps {
    value?: string;
    onChange?: (date: string) => void;
    label?: string;
    error?: string;
    hint?: string;
    placeholder?: string;
    min?: string;
    max?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    containerClassName?: string;
}

export default function DatePicker({
    value,
    onChange,
    label,
    error,
    hint,
    placeholder = 'Pilih tanggal',
    min,
    max,
    disabled,
    required,
    className,
    containerClassName
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        value ? new Date(value) : null
    );
    const [viewDate, setViewDate] = useState<Date>(
        value ? new Date(value) : new Date()
    );

    const pickerRef = useRef<HTMLDivElement>(null);
    const inputId = `datepicker-${Math.random().toString(36).substr(2, 9)}`;

    useClickOutside(pickerRef, () => setIsOpen(false));

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        const dateString = date.toISOString().split('T')[0];
        onChange?.(dateString);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value;
        if (dateValue) {
            const date = new Date(dateValue);
            setSelectedDate(date);
            setViewDate(date);
            onChange?.(dateValue);
        }
    };

    const formatDisplayDate = (date: Date | null) => {
        if (!date) return '';
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const changeMonth = (delta: number) => {
        setViewDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + delta);
            return newDate;
        });
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(viewDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            viewDate.getMonth() === today.getMonth() &&
            viewDate.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        return (
            day === selectedDate.getDate() &&
            viewDate.getMonth() === selectedDate.getMonth() &&
            viewDate.getFullYear() === selectedDate.getFullYear()
        );
    };

    return (
        <div ref={pickerRef} className={cn('relative w-full', containerClassName)}>
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
                    type="date"
                    id={inputId}
                    value={value || ''}
                    onChange={handleInputChange}
                    min={min}
                    max={max}
                    disabled={disabled}
                    placeholder={placeholder}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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