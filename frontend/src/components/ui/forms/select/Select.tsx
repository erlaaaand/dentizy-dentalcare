import React, { forwardRef } from 'react';
import { cn } from '@/core';
import { SelectProps, SelectOption } from './select.types';
import { ChevronDownIcon, LoadingSpinner, ErrorIcon } from './Icon.styles';
import { sizeClasses, variantClasses, stateClasses } from './select.styles';
import { CompactSelect } from './CompactSelect';
import { FormSelect } from './FormSelect';
import { StatusSelect } from './StatusSelect';
import { SearchableSelect } from './SearchableSelect';
import { SelectGroup } from './SelectGroup';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
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
            size = 'md',
            variant = 'default',
            loading = false,
            ...props
        },
        ref
    ) => {
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
        const sizeClass = sizeClasses[size];
        const variantClass = variantClasses[variant];

        const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            onChange?.(e.target.value);
        };

        // Group options by group if specified
        const groupedOptions = React.useMemo(() => {
            const groups: { [key: string]: SelectOption[] } = {};
            const ungrouped: SelectOption[] = [];

            options.forEach(option => {
                if (option.group) {
                    if (!groups[option.group]) {
                        groups[option.group] = [];
                    }
                    groups[option.group].push(option);
                } else {
                    ungrouped.push(option);
                }
            });

            return { groups, ungrouped };
        }, [options]);

        const getStateClass = () => {
            if (error) return stateClasses.error;
            if (disabled) return stateClasses.disabled;
            return stateClasses.normal;
        };

        return (
            <div className={cn('w-full', containerClassName)}>
                {/* Label */}
                {label && (
                    <label
                        htmlFor={selectId}
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

                {/* Select Container */}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        disabled={disabled || loading}
                        value={value}
                        onChange={handleChange}
                        className={cn(
                            'w-full rounded-lg transition-colors appearance-none cursor-pointer focus:outline-none',
                            sizeClass.select,
                            variantClass.select,
                            variantClass.background,
                            getStateClass(),
                            className
                        )}
                        aria-invalid={!!error}
                        aria-describedby={
                            error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
                        }
                        {...props}
                    >
                        {/* Placeholder Option */}
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}

                        {/* Ungrouped Options */}
                        {groupedOptions.ungrouped.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}

                        {/* Grouped Options */}
                        {Object.entries(groupedOptions.groups).map(([groupName, groupOptions]) => (
                            <optgroup key={groupName} label={groupName}>
                                {groupOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                        disabled={option.disabled}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>

                    {/* Dropdown Icon */}
                    <div className={cn(
                        'absolute top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400',
                        sizeClass.icon
                    )}>
                        {loading ? (
                            <LoadingSpinner className={sizeClass.icon} />
                        ) : (
                            <ChevronDownIcon className={sizeClass.icon} />
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div
                        id={`${selectId}-error`}
                        className={cn('flex items-center gap-1 text-red-600', sizeClass.hint)}
                    >
                        <ErrorIcon />
                        {error}
                    </div>
                )}

                {/* Hint Message */}
                {hint && !error && (
                    <p id={`${selectId}-hint`} className={cn('text-gray-500', sizeClass.hint)}>
                        {hint}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

const SelectComponent = Object.assign(Select, {
    Compact: CompactSelect,
    Form: FormSelect,
    Status: StatusSelect,
    Searchable: SearchableSelect,
    Group: SelectGroup,
});

export default SelectComponent;