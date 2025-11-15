import { PatientDataErrorProps } from "./error-message.types";
import { ErrorMessage } from "./ErrorMessage";

export function PatientDataError({
    patientId,
    onRetry,
    message,
    ...props
}: PatientDataErrorProps) {
    const defaultMessage = message || (
        <div className="space-y-1">
            <p>Unable to load patient data{patientId ? ` for patient ID: ${patientId}` : ''}.</p>
            <p className="text-sm">This may be due to a network issue or the patient record may not exist.</p>
        </div>
    );

    return (
        <ErrorMessage
            variant="error"
            title="Patient Data Unavailable"
            message={defaultMessage}
            onRetry={onRetry}
            {...props}
        />
    );
}