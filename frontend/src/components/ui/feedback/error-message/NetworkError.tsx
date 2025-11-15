import { NetworkErrorProps } from "./error-message.types";
import { ErrorMessage } from "./ErrorMessage";

export function NetworkError({
    onRetry,
    showRetry = true,
    message = 'Unable to connect to the server. Please check your internet connection and try again.',
    ...props
}: NetworkErrorProps) {
    return (
        <ErrorMessage
            variant="error"
            title="Connection Error"
            message={message}
            onRetry={showRetry ? onRetry : undefined}
            {...props}
        />
    );
}