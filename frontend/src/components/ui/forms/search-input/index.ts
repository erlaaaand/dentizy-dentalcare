// frontend/src/components/ui/forms/search-input/index.ts

// Export komponen utama sebagai default
export { default as SearchInput } from './SearchInput';

// Export specialized components
export { QuickSearchInput } from './QuickSearchInput';
export { MinimalSearchInput } from './MinimalSearchInput';
export { TableSearchInput } from './TableSearchInput';
export { GlobalSearchInput } from './GlobalSearchInput';
export { SearchWithResults } from './SearchWithResults';
export { SearchInputGroup } from './SearchInputGroup';

// Export types
export * from './search-input.types';

// Export styles & icons
export * from './search-input.styles';
export * from './Icon.styles';