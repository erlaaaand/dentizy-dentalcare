import { ErrorToastProps } from "./toast.types";
import { Toast } from "./Toast";

export function ErrorToast({
    title = 'Error!',
    message,
    showRetry = false,
    onRetry,
    ...props
}: ErrorToastProps) {
    const action = showRetry && onRetry ? {
        label: 'Retry',
        onClick: onRetry,
    } : undefined;

    return (
        <Toast
            type="error"
            message={message}
            action={action}
            {...props}
        />
    );
}