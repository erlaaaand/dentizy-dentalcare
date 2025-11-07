import React, { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface RadioOption {
    value: string | number;
    label: string;
    description?: string;
    disabled?: boolean;
}

export interface RadioGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    label?: string;
    options: RadioOption[];
    value?: string | number;
    onChange?: (value: string | number) => void;
    error?: string;
    orientation?: 'vertical' | 'horizontal';
    containerClassName?: string;
}

export default function RadioGroup({
    label,
    options,
    value,
    onChange,
    error,
    orientation = 'vertical',
    containerClassName,
    name,
    disabled,
    required,
}: RadioGroupProps) {
    const groupName = name || `radio-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (optionValue: string | number) => {
        if (!disabled && onChange) {
            onChange(optionValue);
        }
    };

    return (
        <div className={cn('w-full', containerClassName)}>
            {label && (
                <label className={cn(
                    'block text-sm font-medium text-gray-700 mb-2',
                    disabled && 'text-gray-400'
                )}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className={cn(
                'space-y-3',
                orientation === 'horizontal' && 'flex flex-wrap gap-4 space-y-0'
            )}>
                {options.map((option, index) => {
                    const optionId = `${groupName}-${index}`;
                    const isChecked = value === option.value;
                    const isDisabled = disabled || option.disabled;

                    return (
                        <div key={option.value} className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id={optionId}
                                    name={groupName}
                                    type="radio"
                                    value={option.value}
                                    checked={isChecked}
                                    onChange={() => handleChange(option.value)}
                                    disabled={isDisabled}
                                    className={cn(
                                        'w-4 h-4 border-gray-300 transition-colors cursor-pointer',
                                        'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                                        'text-blue-600',
                                        isDisabled && 'cursor-not-allowed opacity-60',
                                        error && 'border-red-500'
                                    )}
                                    aria-invalid={!!error}
                                />
                            </div>
                            <div className="ml-3">
                                <label
                                    htmlFor={optionId}
                                    className={cn(
                                        'text-sm font-medium text-gray-700 cursor-pointer',
                                        isDisabled && 'text-gray-400 cursor-not-allowed'
                                    )}
                                >
                                    {option.label}
                                </label>
                                {option.description && (
                                    <p className={cn(
                                        'text-sm text-gray-500',
                                        isDisabled && 'text-gray-400'
                                    )}>
                                        {option.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
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