// ===========================
//  Toast Types (Consistent with useToast)
// ===========================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

// UI hanya, tidak dipakai di hook tapi aman dipakai komponen
export type ToastPosition =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';

// Ini harus sesuai dengan ToastMessage (backend structure of the toast)
export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
    duration?: number; // default diambil dari UI_CONFIG jika tidak ada
}

// ===========================
//  Props for UI Components
// ===========================

export interface ToastProps extends ToastMessage {
    variant?: 'default' | 'filled' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
    position?: ToastPosition;
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
    position?: ToastPosition;
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
