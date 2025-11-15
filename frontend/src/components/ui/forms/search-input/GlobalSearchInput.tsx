import { SearchInputProps } from "./search-input.types";
import { SearchInput } from "./SearchInput";

// Global Search for header/navigation
export function GlobalSearchInput(props: Omit<SearchInputProps, 'size' | 'variant'>) {
    return (
        <SearchInput
            size="md"
            variant="filled"
            placeholder="Cari pasien, treatment, atau dokter..."
            {...props}
        />
    );
}