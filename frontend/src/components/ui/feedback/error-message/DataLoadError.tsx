import { DataLoadErrorProps } from "./error-message.types";
import { ErrorMessage } from "./ErrorMessage";

export function DataLoadError({
    resourceName = 'data',
    onRetry,
    message,
    ...props
}: DataLoadErrorProps) {
    const defaultMessage = message || `Failed to load ${resourceName}. The data may be temporarily unavailable.`;

    return (
        <ErrorMessage
            variant="warning"
            title={`Unable to Load ${resourceName}`}
            message={defaultMessage}
            onRetry={onRetry}
            {...props}
        />
    );
}