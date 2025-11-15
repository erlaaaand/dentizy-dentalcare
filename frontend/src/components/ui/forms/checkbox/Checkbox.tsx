// components/ui/forms/Checkbox.tsx
import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { CheckboxProps } from './checkbox.types'; // Impor tipe
import { sizeClasses, variantClasses } from './checkbox.styles'; // Impor gaya

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      className,
      containerClassName,
      id,
      disabled,
      size = 'md',
      variant = 'default',
      indeterminate = false,
      align = 'left',
      fullWidth = false,
      checked,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const sizeClass = sizeClasses[size];
    const variantClass = variantClasses[variant];

    // Render checkmark or indeterminate icon
    const renderIcon = () => {
      if (indeterminate) {
        return (
          <svg className="absolute inset-0 w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14" />
          </svg>
        );
      }

      return (
        <svg className="absolute inset-0 w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      );
    };

    const checkboxContent = (
      <div className={cn(
        'relative inline-flex items-center',
        align === 'right' && 'flex-row-reverse',
        fullWidth && 'w-full'
      )}>
        {/* Checkbox Input */}
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            disabled={disabled}
            checked={checked}
            className={cn(
              'appearance-none border rounded transition-all duration-200 cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              sizeClass.input,
              variantClass.focus,
              checked || indeterminate
                ? variantClass.checked
                : variantClass.unchecked,
              disabled && 'cursor-not-allowed opacity-50',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${checkboxId}-error` : description ? `${checkboxId}-description` : undefined
            }
            {...props}
          />

          {/* Checkmark/Indeterminate Icon */}
          {(checked || indeterminate) && (
            <div className={cn(
              'absolute inset-0 flex items-center justify-center pointer-events-none text-white',
              disabled && 'text-gray-400'
            )}>
              {renderIcon()}
            </div>
          )}
        </div>

        {/* Label and Description */}
        {(label || description) && (
          <div className={cn(
            align === 'left' ? 'ml-3' : 'mr-3',
            fullWidth && 'flex-1'
          )}>
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'font-medium text-gray-700 cursor-pointer select-none',
                  sizeClass.label,
                  disabled && 'text-gray-400 cursor-not-allowed',
                  fullWidth && 'block'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                id={`${checkboxId}-description`}
                className={cn(
                  'text-gray-500 mt-0.5',
                  sizeClass.description,
                  disabled && 'text-gray-400'
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );

    return (
      <div className={cn(
        'w-full',
        containerClassName
      )}>
        {checkboxContent}

        {/* Error Message */}
        {error && (
          <p
            id={`${checkboxId}-error`}
            className={cn(
              'mt-1 text-red-600 flex items-center gap-1',
              sizeClass.container
            )}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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