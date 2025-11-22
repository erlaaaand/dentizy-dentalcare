import { AppointmentToastProps } from "./toast.types";
import { Toast } from "./Toast";

// Define ToastType locally since it's not exported from @/core
type ToastType = 'success' | 'error' | 'warning' | 'info';

export function AppointmentToast({
    id,
    patientName,
    appointmentTime,
    type,
    onClose,
    onViewDetails,
}: AppointmentToastProps) {
    const toastTypeMap: Record<string, ToastType> = {
        confirmed: 'success',
        reminder: 'info',
        cancelled: 'error',
        rescheduled: 'warning'
    };

    const mappedType = toastTypeMap[type] || 'info';

    const toastConfig = {
        confirmed: {
            message: `Janji temu dikonfirmasi untuk ${patientName} pada ${appointmentTime}`,
            action: onViewDetails ? { label: 'Lihat Detail', onClick: onViewDetails } : undefined,
        },
        reminder: {
            message: `Pengingat: ${patientName} memiliki janji temu pada ${appointmentTime}`,
            action: onViewDetails ? { label: 'Lihat Detail', onClick: onViewDetails } : undefined,
        },
        cancelled: {
            message: `Janji temu dibatalkan untuk ${patientName} pada ${appointmentTime}`,
            action: undefined,
        },
        rescheduled: {
            message: `Janji temu dijadwalkan ulang untuk ${patientName} pada ${appointmentTime}`,
            action: onViewDetails ? { label: 'Lihat Detail', onClick: onViewDetails } : undefined,
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