import React, { forwardRef, useMemo } from 'react';
import { cn } from '@/core';
import { SelectProps, SelectOption } from './select.types';
import { sizeClasses, variantClasses, stateClasses } from './select.styles';
import { CompactSelect } from './CompactSelect';
import { FormSelect } from './FormSelect';
import { StatusSelect } from './StatusSelect';
import { SearchableSelect } from './SearchableSelect';
import { SelectGroup } from './SelectGroup';

const ChevronDownIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const LoadingSpinner = ({ className }: { className?: string }) => (
    <svg className={cn('animate-spin', className)} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);

const ErrorIcon = () => (
    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, hint, options, placeholder, className, containerClassName, id, disabled, required, onChange, value, size = 'md', variant = 'default', loading = false, ...props }, ref) => {
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
        const sizeClass = sizeClasses[size];
        const variantClass = variantClasses[variant];

        const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => onChange?.(e.target.value);

        const groupedOptions = useMemo(() => {
            const groups: Record<string, SelectOption[]> = {};
            const ungrouped: SelectOption[] = [];
            options.forEach((opt) => (opt.group ? (groups[opt.group] = [...(groups[opt.group] || []), opt]) : ungrouped.push(opt)));
            return { groups, ungrouped };
        }, [options]);

        const getStateClass = () => {
            if (error) return stateClasses.error;
            if (disabled) return stateClasses.disabled;
            return stateClasses.normal;
        };

        return (
            <div className={cn('w-full', containerClassName)}>
                {label && (
                    <label htmlFor={selectId} className={cn('block font-medium text-gray-700', sizeClass.label, disabled && 'text-gray-400')}>
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        disabled={disabled || loading}
                        value={value}
                        onChange={handleChange}
                        className={cn('w-full rounded-lg transition-colors appearance-none cursor-pointer focus:outline-none', sizeClass.select, variantClass.select, variantClass.background, getStateClass(), className)}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
                        {...props}
                    >
                        {placeholder && <option value="" disabled>{placeholder}</option>}
                        {groupedOptions.ungrouped.map((opt) => <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>)}
                        {Object.entries(groupedOptions.groups).map(([name, opts]) => (
                            <optgroup key={name} label={name}>
                                {opts.map((opt) => <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>)}
                            </optgroup>
                        ))}
                    </select>
                    <div className={cn('absolute top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400', sizeClass.icon)}>
                        {loading ? <LoadingSpinner className={sizeClass.icon} /> : <ChevronDownIcon className={sizeClass.icon} />}
                    </div>
                </div>
                {error && (
                    <div className={cn('flex items-center gap-1 text-red-600 mt-1', sizeClass.hint)}>
                        <ErrorIcon />
                        {error}
                    </div>
                )}
                {hint && !error && <p className={cn('text-gray-500 mt-1', sizeClass.hint)}>{hint}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';

const SelectComponent = Object.assign(Select, { Compact: CompactSelect, Form: FormSelect, Status: StatusSelect, Searchable: SearchableSelect, Group: SelectGroup });
export default SelectComponent;