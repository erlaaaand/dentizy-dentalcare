import React from 'react';
import { useDebounce } from '@/core/hooks';
import { cn } from '@/core';
import { SearchInputProps } from './search-input.types';
import { sizeClasses, variantClasses } from './search-input.styles';
import { LoadingSpinner, SearchIcon, ClearIcon } from './Icon.styles';
import { QuickSearchInput } from './QuickSearchInput';
import { MinimalSearchInput } from './MinimalSearchInput';
import { TableSearchInput } from './TableSearchInput';
import { GlobalSearchInput } from './GlobalSearchInput';
import { SearchWithResults } from './SearchWithResults';
import { SearchInputGroup } from './SearchInputGroup';

export function SearchInput({
    value,
    onChange,
    placeholder = 'Cari...',
    debounceMs = 300,
    className,
    size = 'md',
    variant = 'default',
    disabled = false,
    autoFocus = false,
    onClear,
    loading = false,
}: SearchInputProps) {
    const [localValue, setLocalValue] = React.useState(value);
    const debouncedValue = useDebounce(localValue, debounceMs);

    const sizeClass = sizeClasses[size];
    const variantClass = variantClasses[variant];

    // Sync with external value changes
    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Call onChange when debounced value changes
    React.useEffect(() => {
        onChange(debouncedValue);
    }, [debouncedValue, onChange]);

    const handleClear = () => {
        setLocalValue('');
        onChange('');
        onClear?.();
    };

    return (
        <div className={cn(
            'relative rounded-lg transition-colors',
            sizeClass.container,
            variantClass.background,
            disabled && 'opacity-50 cursor-not-allowed',
            className
        )}>
            {/* Search Icon */}
            <div className={cn(
                'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400',
                disabled && 'text-gray-300'
            )}>
                {loading ? (
                    <LoadingSpinner className={sizeClass.icon} />
                ) : (
                    <SearchIcon className={sizeClass.icon} />
                )}
            </div>

            {/* Input Field */}
            <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                autoFocus={autoFocus}
                className={cn(
                    'w-full rounded-lg focus:outline-none placeholder-gray-400 transition-colors',
                    sizeClass.input,
                    variantClass.input,
                    disabled && 'cursor-not-allowed'
                )}
            />

            {/* Clear Button */}
            {localValue && !disabled && (
                <button
                    onClick={handleClear}
                    className={cn(
                        'absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors',
                        sizeClass.clear
                    )}
                    type="button"
                    aria-label="Clear search"
                >
                    <ClearIcon className={sizeClass.icon} />
                </button>
            )}
        </div>
    );
}

// Create main component with compound pattern
const SearchInputComponent = Object.assign(SearchInput, {
    Quick: QuickSearchInput,
    Minimal: MinimalSearchInput,
    Table: TableSearchInput,
    Global: GlobalSearchInput,
    WithResults: SearchWithResults,
    Group: SearchInputGroup,
});

export default SearchInputComponent;