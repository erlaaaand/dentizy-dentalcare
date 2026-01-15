import { AppointmentErrorProps } from "./error-message.types";
import { ErrorMessage } from "./ErrorMessage";

export function AppointmentError({
    appointmentId,
    onRetry,
    onSchedule,
    message,
    ...props
}: AppointmentErrorProps) {
    const defaultMessage = message || (
        <div className="space-y-1">
            <p>Unable to load appointment details{appointmentId ? ` for appointment ID: ${appointmentId}` : ''}.</p>
            <p className="text-sm">The appointment may have been cancelled or rescheduled.</p>
        </div>
    );

    return (
        <ErrorMessage
            variant="warning"
            title="Appointment Not Found"
            message={defaultMessage}
            onRetry={onRetry}
            action={onSchedule && (
                <button
                    onClick={onSchedule}
                    className="inline-flex items-center gap-1.5 font-medium text-yellow-700 hover:underline text-sm"
                >
                    Schedule New Appointment
                </button>
            )}
            {...props}
        />
    );
}