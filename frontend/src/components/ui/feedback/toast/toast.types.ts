import type { ToastType } from '@/core/hooks/ui/useToast';

export interface ToastProps {
    id: string;
    message: string;
    type?: ToastType;
    variant?: 'default' | 'filled' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    duration?: number;
    showIcon?: boolean;
    showClose?: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
    onClose: (id: string) => void;
    className?: string;
}

export interface ToastContainerProps {
    children: React.ReactNode;
    position?: ToastProps['position'];
    className?: string;
}

export interface SuccessToastProps extends Omit<ToastProps, 'type' | 'variant'> {
    title?: string;
}

export interface ErrorToastProps extends Omit<ToastProps, 'type' | 'variant'> {
    title?: string;
    showRetry?: boolean;
    onRetry?: () => void;
}

export interface AppointmentToastProps {
    id: string;
    patientName: string;
    appointmentTime: string;
    type: 'confirmed' | 'reminder' | 'cancelled' | 'rescheduled';
    onClose: (id: string) => void;
    onViewDetails?: () => void;
}