import { EmptySearchStateProps } from "./empty-state.types";
import { EmptyState } from "./EmptyState";
import { DefaultIcons } from "./empty-state.icons";

export function EmptySearchState({
    title,
    searchQuery,
    resource = 'results',
    onClearSearch,
    ...props
}: EmptySearchStateProps) {
    return (
        <EmptyState
            icon={<DefaultIcons.Search className="w-full h-full" />}
            title={title || 'No results found'}
            description={
                searchQuery
                    ? `No ${resource} found for "${searchQuery}". Try adjusting your search terms.`
                    : `No ${resource} match your current filters.`
            }
            action={onClearSearch && (
                <button
                    onClick={onClearSearch}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                    Clear search
                </button>
            )}
            {...props}
        />
    );
}