import { AppointmentCancelConfirmDialogProps } from "./confirm-dialog.types";
import ConfirmDialog from "./ConfirmDialog";

export function AppointmentCancelConfirmDialog({
    patientName,
    appointmentDate,
    appointmentTime,
    sendNotification = true,
    message,
    ...props
}: AppointmentCancelConfirmDialogProps) {
    const defaultMessage = message || (
        <div className="space-y-3">
            <p>
                Are you sure you want to cancel the appointment with <strong>{patientName}</strong>?
            </p>
            <div className="text-sm space-y-1">
                <p>
                    <strong>Date:</strong> {appointmentDate} at {appointmentTime}
                </p>
                {sendNotification && (
                    <p className="text-blue-600">
                        📧 A cancellation notification will be sent to the patient.
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <ConfirmDialog
            type="warning"
            title="Cancel Appointment"
            message={defaultMessage}
            confirmText="Cancel Appointment"
            confirmVariant="warning"
            {...props}
        />
    );
}