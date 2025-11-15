import { SearchInputGroupProps } from "./search-input.types";
import { SearchInput } from "./SearchInput";
import { cn } from "@/core/utils";

export function SearchInputGroup({
    search,
    onSearchChange,
    filters,
    actions,
    className,
}: SearchInputGroupProps) {
    return (
        <div className={cn('flex flex-col sm:flex-row gap-3 items-start sm:items-center', className)}>
            <div className="flex-1 w-full sm:max-w-md">
                <SearchInput
                    value={search}
                    onChange={onSearchChange}
                    placeholder="Cari..."
                />
            </div>

            {filters && (
                <div className="flex items-center gap-2">
                    {filters}
                </div>
            )}

            {actions && (
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}