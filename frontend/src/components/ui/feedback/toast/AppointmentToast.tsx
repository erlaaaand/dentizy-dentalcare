import { AppointmentToastProps } from "./toast.types";
import { ToastType } from "@/stores/toast.store";
import { Toast } from "./Toast";

export function AppointmentToast({
    id,
    patientName,
    appointmentTime,
    type,
    onClose,
    onViewDetails,
}: AppointmentToastProps) {
    const toastConfig = {
        confirmed: {
            type: 'success' as ToastType,
            message: `Appointment confirmed for ${patientName} at ${appointmentTime}`,
            action: onViewDetails ? { label: 'View Details', onClick: onViewDetails } : undefined,
        },
        reminder: {
            type: 'info' as ToastType,
            message: `Reminder: ${patientName} has an appointment at ${appointmentTime}`,
            action: onViewDetails ? { label: 'View Details', onClick: onViewDetails } : undefined,
        },
        cancelled: {
            type: 'error' as ToastType,
            message: `Appointment cancelled for ${patientName} at ${appointmentTime}`,
            action: undefined,
        },
        rescheduled: {
            type: 'warning' as ToastType,
            message: `Appointment rescheduled for ${patientName} at ${appointmentTime}`,
            action: onViewDetails ? { label: 'View Details', onClick: onViewDetails } : undefined,
        },
    };

    const config = toastConfig[type];

    return (
        <Toast
            id={id}
            type={config.type}
            message={config.message}
            action={config.action ?? undefined}
            onClose={onClose}
            size="md"
            duration={type === 'reminder' ? 10000 : 5000}
        />
    );
}