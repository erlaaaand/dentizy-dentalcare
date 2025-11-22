import { LucideIcon } from 'lucide-react';

export interface AlertBannerProps {
    type?: 'info' | 'success' | 'warning' | 'error' | 'neutral';
    title?: string;
    message?: string | React.ReactNode;
    onClose?: () => void;
    className?: string;
    icon?: React.ElementType | React.ReactElement | LucideIcon;
    action?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'banner' | 'inline' | 'toast' | 'floating';
    dismissible?: boolean;
    autoClose?: number;
    showIcon?: boolean;
    border?: boolean;
    shadow?: boolean;
    position?: 'top' | 'bottom' | 'inline';
    animate?: boolean;
}

// Dental Clinic Specific Alerts
export interface AppointmentAlertProps extends Omit<AlertBannerProps, 'type' | 'title'> {
    appointmentType: 'reminder' | 'confirmation' | 'cancellation' | 'reschedule';
    patientName?: string;
    date?: string;
}

export interface AlertContainerProps {
    children: React.ReactNode;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
    maxAlerts?: number;
    className?: string;
}

export interface SuccessAlertProps extends Omit<AlertBannerProps, 'type'> {
    title?: string;
}

export interface ErrorAlertProps extends Omit<AlertBannerProps, 'type'> {
    title?: string;
}

export interface WarningAlertProps extends Omit<AlertBannerProps, 'type'> {
    title?: string;
}

// Info Alert
export interface InfoAlertProps extends Omit<AlertBannerProps, 'type'> {
    title?: string;
}
