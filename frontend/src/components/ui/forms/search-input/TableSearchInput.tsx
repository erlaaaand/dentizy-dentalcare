import { TableSearchInputProps } from "./search-input.types";
import { SearchInput } from "./SearchInput";

export function TableSearchInput({
    placeholder = 'Cari dalam tabel...',
    ...props
}: TableSearchInputProps) {
    return (
        <SearchInput
            size="sm"
            variant="minimal"
            placeholder={placeholder}
            {...props}
        />
    );
}