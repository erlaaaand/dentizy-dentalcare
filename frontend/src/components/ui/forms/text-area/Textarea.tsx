import React, { forwardRef } from 'react';
import { cn } from '@/core/utils';
import type { TextareaProps } from './text-area.types';
import { ErrorIcon } from './Icon.styles';
import { CompactTextarea } from './CompactTextarea';
import { FormTextarea } from './FormTextarea';
import { DescriptionTextarea } from './DescriptionTextarea';
import { NotesTextarea } from './NotesTextarea';
import { ReadonlyTextarea } from './ReadonlyTextarea';
import { AutoResizeTextarea } from './AutoResizeTextarea';
import { FormattedTextarea } from './FormattedTextarea';
import { sizeClasses, variantClasses, stateClasses, resizeClasses } from './text-area.styles';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
            size = 'md',
            variant = 'default',
            resize = 'vertical',
            ...props
        },
        ref
    ) => {
        const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
        const currentLength = value ? String(value).length : 0;
        const sizeClass = sizeClasses[size];
        const variantClass = variantClasses[variant];

        const getStateClass = () => {
            if (error) return stateClasses.error;
            if (disabled) return stateClasses.disabled;
            return stateClasses.normal;
        };

        const getCharCountColor = () => {
            if (!maxLength) return 'text-gray-500';
            const percentage = (currentLength / maxLength) * 100;
            if (percentage >= 100) return 'text-red-600 font-semibold';
            if (percentage >= 90) return 'text-orange-500';
            if (percentage >= 75) return 'text-yellow-500';
            return 'text-gray-500';
        };

        return (
            <div className={cn('w-full', containerClassName)}>
                {/* Label */}
                {label && (
                    <label
                        htmlFor={textareaId}
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

                {/* Textarea */}
                <textarea
                    ref={ref}
                    id={textareaId}
                    disabled={disabled}
                    maxLength={maxLength}
                    value={value}
                    className={cn(
                        'w-full rounded-lg transition-colors focus:outline-none placeholder:text-gray-400',
                        sizeClass.textarea,
                        variantClass.textarea,
                        variantClass.background,
                        resizeClasses[resize],
                        getStateClass(),
                        className
                    )}
                    aria-invalid={!!error}
                    aria-describedby={
                        error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
                    }
                    {...props}
                />

                {/* Footer: Error/Hint and Character Count */}
                <div className="flex items-center justify-between mt-1">
                    <div className="flex-1">
                        {/* Error Message */}
                        {error && (
                            <div
                                id={`${textareaId}-error`}
                                className={cn('flex items-center gap-1 text-red-600', sizeClass.hint)}
                            >
                                <ErrorIcon />
                                {error}
                            </div>
                        )}

                        {/* Hint Message */}
                        {hint && !error && (
                            <p id={`${textareaId}-hint`} className={cn('text-gray-500', sizeClass.hint)}>
                                {hint}
                            </p>
                        )}
                    </div>

                    {/* Character Count */}
                    {showCharCount && maxLength && (
                        <span className={cn(
                            sizeClass.charCount,
                            getCharCountColor()
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

const TextareaComponent = Object.assign(Textarea, {
    Compact: CompactTextarea,
    Form: FormTextarea,
    Description: DescriptionTextarea,
    Notes: NotesTextarea,
    Readonly: ReadonlyTextarea,
    AutoResize: AutoResizeTextarea,
    Formatted: FormattedTextarea,
});

export default TextareaComponent;