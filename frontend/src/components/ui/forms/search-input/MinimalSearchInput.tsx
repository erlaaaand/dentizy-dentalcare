import { SearchInputProps } from "./search-input.types";
import { SearchInput } from "./SearchInput";

export function MinimalSearchInput(props: Omit<SearchInputProps, 'variant'>) {
    return <SearchInput {...props} variant="minimal" />;
}