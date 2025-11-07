import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
    containerClassName?: string;
    showCharCount?: boolean;
    maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            label,
            error,
            hint,
            className,
            containerClassName,
            id,
            disabled,
            required,
            showCharCount,
            maxLength,
            value,
            ...props
        },
        ref
    ) => {
        const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
        const currentLength = value ? String(value).length : 0;

        return (
            <div className={cn('w-full', containerClassName)}>
                {label && (
                    <label
                        htmlFor={textareaId}
                        className={cn(
                            'block text-sm font-medium text-gray-700 mb-1',
                            disabled && 'text-gray-400'
                        )}
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <textarea
                    ref={ref}
                    id={textareaId}
                    disabled={disabled}
                    maxLength={maxLength}
                    value={value}
                    className={cn(
                        'w-full px-4 py-2 border rounded-lg transition-colors resize-y',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'placeholder:text-gray-400 min-h-[100px]',
                        error && 'border-red-500 focus:ring-red-500',
                        disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
                        !error && !disabled && 'border-gray-300',
                        className
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
                    {...props}
                />

                <div className="flex items-center justify-between mt-1">
                    <div className="flex-1">
                        {error && (
                            <p id={`${textareaId}-error`} className="text-sm text-red-600 flex items-center gap-1">
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
                            <p id={`${textareaId}-hint`} className="text-sm text-gray-500">
                                {hint}
                            </p>
                        )}
                    </div>

                    {showCharCount && maxLength && (
                        <span className={cn(
                            'text-xs',
                            currentLength > maxLength * 0.9 ? 'text-red-600' : 'text-gray-500'
                        )}>
                            {currentLength}/{maxLength}
                        </span>
                    )}
                </div>
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;