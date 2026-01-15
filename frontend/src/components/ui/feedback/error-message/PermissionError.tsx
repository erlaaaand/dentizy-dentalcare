import { PermissionErrorProps } from "./error-message.types";
import { ErrorMessage } from "./ErrorMessage";

export function PermissionError({
    requiredPermission,
    onRequestAccess,
    message,
    ...props
}: PermissionErrorProps) {
    const defaultMessage = message || (
        <div className="space-y-2">
            <p>You don't have permission to access this resource.</p>
            {requiredPermission && (
                <p className="text-sm">Required permission: <strong>{requiredPermission}</strong></p>
            )}
        </div>
    );

    return (
        <ErrorMessage
            variant="danger"
            title="Access Denied"
            message={defaultMessage}
            action={onRequestAccess && (
                <button
                    onClick={onRequestAccess}
                    className="inline-flex items-center gap-1.5 font-medium text-red-700 hover:underline text-sm"
                >
                    Request Access
                </button>
            )}
            {...props}
        />
    );
}