import { AppointmentAlertProps } from "./alert-banner.types";
import AlertBanner from "./AlertBanner";

export function AppointmentAlert({
    appointmentType,
    patientName,
    date,
    ...props
}: AppointmentAlertProps) {
    const config = {
        reminder: {
            type: 'info' as const,
            title: 'Appointment Reminder',
            message: `You have an appointment with ${patientName} on ${date}`,
        },
        confirmation: {
            type: 'success' as const,
            title: 'Appointment Confirmed',
            message: `Appointment with ${patientName} has been confirmed for ${date}`,
        },
        cancellation: {
            type: 'error' as const,
            title: 'Appointment Cancelled',
            message: `Appointment with ${patientName} on ${date} has been cancelled`,
        },
        reschedule: {
            type: 'warning' as const,
            title: 'Appointment Rescheduled',
            message: `Appointment with ${patientName} has been rescheduled to ${date}`,
        },
    };

    const alertConfig = config[appointmentType];

    return (
        <AlertBanner
            type={alertConfig.type}
            title={alertConfig.title}
            message={props.message || alertConfig.message}
            {...props}
        />
    );
}