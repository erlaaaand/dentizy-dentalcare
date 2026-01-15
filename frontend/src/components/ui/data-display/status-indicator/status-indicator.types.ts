import { LucideIcon } from "lucide-react";

export interface StatusIndicatorProps {
    status: 'dijadwalkan' | 'selesai' | 'dibatalkan';
    label?: string;
    showDot?: boolean;
    showIcon?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'dot' | 'badge' | 'pill' | 'text' | 'icon';
    animated?: boolean;
    pulse?: boolean;
    className?: string;
    icon?: LucideIcon;
    showLabel?: boolean;
    position?: 'left' | 'right';
    count?: number;
    onClick?: () => void;
    interactive?: boolean;
}

export interface StatusIndicatorGroupProps {
    children: React.ReactNode;
    className?: string;
    direction?: 'horizontal' | 'vertical';
    gap?: 'none' | 'sm' | 'md' | 'lg';
    align?: 'start' | 'center' | 'end';
}

// Appointment Status
export interface AppointmentStatusProps extends Omit<StatusIndicatorProps, 'status'> {
    status: 'dijadwalkan' | 'selesai' | 'dibatalkan';
}
