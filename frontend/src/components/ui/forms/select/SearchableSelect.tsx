import React from "react";
import { SearchableSelectProps } from "./select.types";
import { Select } from "./Select";

export function SearchableSelect({
    options,
    searchPlaceholder = 'Cari...',
    onSearchChange,
    ...props
}: SearchableSelectProps) {
    const [search, setSearch] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);

    const filteredOptions = React.useMemo(() => {
        if (!search) return options;
        return options.filter(option =>
            option.label.toLowerCase().includes(search.toLowerCase())
        );
    }, [options, search]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        onSearchChange?.(value);
    };

    // This is a simplified version - in a real implementation you might want to use a custom dropdown
    return (
        <div className="relative">
            <Select
                options={filteredOptions}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setIsOpen(false)}
                {...props}
            />

            {/* Search input would be implemented in a custom dropdown component */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 mt-1 p-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            )}
        </div>
    );
}