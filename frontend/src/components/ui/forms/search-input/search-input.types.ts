export interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'minimal' | 'filled';
    disabled?: boolean;
    autoFocus?: boolean;
    onClear?: () => void;
    loading?: boolean;
}

// Table Search for data tables
export interface TableSearchInputProps extends Omit<SearchInputProps, 'size' | 'variant' | 'placeholder'> {
    placeholder?: string;
}

// Search with results count
export interface SearchWithResultsProps extends SearchInputProps {
    resultsCount?: number;
    totalCount?: number;
}

export interface SearchInputGroupProps {
    search: string;
    onSearchChange: (value: string) => void;
    filters?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}