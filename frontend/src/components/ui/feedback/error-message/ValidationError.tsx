import { ValidationErrorProps } from "./error-message.types";
import { ErrorMessage } from "./ErrorMessage";

export function ValidationError({
    errors,
    fieldName,
    message,
    ...props
}: ValidationErrorProps) {
    const defaultMessage = message || (
        <div className="space-y-1">
            {fieldName && (
                <p>Please fix the following errors in <strong>{fieldName}</strong>:</p>
            )}
            {errors && errors.length > 0 && (
                <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            )}
        </div>
    );

    return (
        <ErrorMessage
            variant="warning"
            title="Validation Error"
            message={defaultMessage}
            {...props}
        />
    );
}