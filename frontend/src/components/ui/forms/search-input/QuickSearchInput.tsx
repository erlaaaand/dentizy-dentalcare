import { SearchInputProps } from "./search-input.types";
import { SearchInput } from "./SearchInput";

export function QuickSearchInput(props: Omit<SearchInputProps, 'debounceMs'>) {
    return <SearchInput {...props} debounceMs={0} />;
}