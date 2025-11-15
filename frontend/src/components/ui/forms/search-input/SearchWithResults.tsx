import { SearchWithResultsProps } from "./search-input.types";
import { SearchInput } from "./SearchInput";

export function SearchWithResults({
    resultsCount,
    totalCount,
    ...props
}: SearchWithResultsProps) {
    return (
        <div className="space-y-2">
            <SearchInput {...props} />
            {(resultsCount !== undefined || totalCount !== undefined) && (
                <div className="text-sm text-gray-500 px-1">
                    {resultsCount !== undefined && totalCount !== undefined ? (
                        <>Menampilkan {resultsCount} dari {totalCount} hasil</>
                    ) : resultsCount !== undefined ? (
                        <>Menampilkan {resultsCount} hasil</>
                    ) : (
                        <>Total {totalCount} items</>
                    )}
                </div>
            )}
        </div>
    );
}