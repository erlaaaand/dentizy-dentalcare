import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DatePicker from '@/components/ui/DatePicker';

export interface FilterOption {
    type: 'text' | 'select' | 'date' | 'daterange';
    key: string;
    label: string;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
}

export interface FilterBarProps {
    filters: FilterOption[];
    values: Record<string, any>;
    onChange: (key: string, value: any) => void;
    onReset?: () => void;
    onSearch?: () => void;
    className?: string;
}

export default function FilterBar({
    filters,
    values,
    onChange,
    onReset,
    onSearch,
    className
}: FilterBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const visibleFilters = isExpanded ? filters : filters.slice(0, 3);

    const handleReset = () => {
        onReset?.();
    };

    return (
        <div className={cn('bg-white border border-gray-200 rounded-lg p-4', className)}>
            <div className="space-y-4">
                {/* Filter Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {visibleFilters.map((filter) => {
                        switch (filter.type) {
                            case 'text':
                                return (
                                    <Input
                                        key={filter.key}
                                        label={filter.label}
                                        placeholder={filter.placeholder}
                                        value={values[filter.key] || ''}
                                        onChange={(e) => onChange(filter.key, e.target.value)}
                                    />
                                );

                            case 'select':
                                return (
                                    <Select
                                        key={filter.key}
                                        label={filter.label}
                                        placeholder={filter.placeholder}
                                        options={filter.options || []}
                                        value={values[filter.key] || ''}
                                        onChange={(value) => onChange(filter.key, value)}
                                    />
                                );

                            case 'date':
                                return (
                                    <DatePicker
                                        key={filter.key}
                                        label={filter.label}
                                        placeholder={filter.placeholder}
                                        value={values[filter.key] || ''}
                                        onChange={(value) => onChange(filter.key, value)}
                                    />
                                );

                            default:
                                return null;
                        }
                    })}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-2">
                        {onSearch && (
                            <button
                                onClick={onSearch}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <span>Cari</span>
                                </div>
                            </button>
                        )}

                        {onReset && (
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    {filters.length > 3 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                            {isExpanded ? 'Sembunyikan Filter' : `Tampilkan Lebih (+${filters.length - 3})`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Compact Filter Bar (for smaller spaces)
export interface CompactFilterBarProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    filterCount?: number;
    onFilterClick?: () => void;
    sortOptions?: Array<{ value: string; label: string }>;
    sortValue?: string;
    onSortChange?: (value: string) => void;
    className?: string;
}

export function CompactFilterBar({
    searchValue,
    onSearchChange,
    filterCount,
    onFilterClick,
    sortOptions,
    sortValue,
    onSortChange,
    className
}: CompactFilterBarProps) {
    return (
        <div className={cn('flex items-center gap-3', className)}>
            {/* Search */}
            <div className="flex-1">
                <Input
                    placeholder="Cari..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    leftIcon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    }
                />
            </div>

            {/* Filter Button */}
            {onFilterClick && (
                <button
                    onClick={onFilterClick}
                    className="relative px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Filter</span>
                    </div>
                    {filterCount && filterCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {filterCount}
                        </span>
                    )}
                </button>
            )}

            {/* Sort */}
            {sortOptions && sortOptions.length > 0 && (
                <Select
                    options={sortOptions}
                    value={sortValue}
                    onChange={onSortChange}
                    placeholder="Urutkan"
                    className="w-48"
                />
            )}
        </div>
    );
}