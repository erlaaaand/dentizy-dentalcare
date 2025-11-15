import { PatientDeleteConfirmDialogProps } from "./confirm-dialog.types";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

export function PatientDeleteConfirmDialog({
    patientName,
    hasAppointments = false,
    hasMedicalRecords = false,
    ...props
}: PatientDeleteConfirmDialogProps) {
    const message = (
        <div className="space-y-3">
            <p>
                Are you sure you want to delete patient <strong>{patientName}</strong>?
            </p>

            <div className="text-sm space-y-1">
                {hasAppointments && (
                    <p className="text-yellow-600">
                        ⚠️ This patient has upcoming appointments that will be cancelled.
                    </p>
                )}
                {hasMedicalRecords && (
                    <p className="text-red-600">
                        ⚠️ This patient has medical records that will be permanently deleted.
                    </p>
                )}
                <p className="text-red-600 font-medium">
                    This action cannot be undone. All patient data will be permanently removed from the system.
                </p>
            </div>
        </div>
    );

    return (
        <DeleteConfirmDialog
            message={message}
            confirmText="Delete Patient"
            permanent
            {...props}
        />
    );
}