import { AppointmentToastProps } from "./toast.types";
import { type ToastType } from "@/core";
import { Toast } from "./Toast";

export function AppointmentToast({
    id,
    patientName,
    appointmentTime,
    type,
    onClose,
    onViewDetails,
}: AppointmentToastProps) {
    // Mapping type appointment ke tipe Toast core
    const toastTypeMap: Record<string, ToastType> = {
        confirmed: 'success',
        reminder: 'info',
        cancelled: 'error',
        rescheduled: 'warning'
    };

    const mappedType = toastTypeMap[type] || 'info';

    const toastConfig = {
        confirmed: {
            message: `Appointment confirmed for ${patientName} at ${appointmentTime}`,
            action: onViewDetails ? { label: 'View Details', onClick: onViewDetails } : undefined,
        },
        reminder: {
            message: `Reminder: ${patientName} has an appointment at ${appointmentTime}`,
            action: onViewDetails ? { label: 'View Details', onClick: onViewDetails } : undefined,
        },
        cancelled: {
            message: `Appointment cancelled for ${patientName} at ${appointmentTime}`,
            action: undefined,
        },
        rescheduled: {
            message: `Appointment rescheduled for ${patientName} at ${appointmentTime}`,
            action: onViewDetails ? { label: 'View Details', onClick: onViewDetails } : undefined,
        },
    };

    const config = toastConfig[type];

    return (
        <Toast
            id={id}
            type={mappedType}
            message={config.message}
            action={config.action}
            onClose={onClose}
            size="md"
            duration={type === 'reminder' ? 10000 : 5000}
        />
    );
}