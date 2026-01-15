import { PageLoadingProps } from "./loading-spinner.types";
import { LoadingContainer } from "./LoadingContainer";
import { LoadingSpinner } from "./LoadingSpinner";

export function PageLoading({
    title = 'Loading',
    description,
    size = 'xl',
    showText = true,
}: PageLoadingProps) {
    return (
        <LoadingContainer center minHeight="50vh">
            <div className="text-center space-y-4">
                <LoadingSpinner
                    size={size}
                    variant="primary"
                    showText={false}
                    center
                />
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {description && (
                        <p className="text-sm text-gray-500 max-w-md">{description}</p>
                    )}
                </div>
            </div>
        </LoadingContainer>
    );
}