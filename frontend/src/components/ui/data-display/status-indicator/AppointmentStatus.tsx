import { AppointmentStatusProps } from "./status-indicator.types";
import StatusIndicator from "./StatusIndicator";

export function AppointmentStatus({ status, ...props }: AppointmentStatusProps) {
    const statusMap = {
        dijadwalkan: 'dijadwalkan',
        selesai: 'selesai',
        dibatalkan: 'dibatalkan',
    } as const;

    return <StatusIndicator status={statusMap[status]} {...props} />;
}
