export interface ErrorMessageProps {
    message: string | React.ReactNode;
    title?: string;
    onRetry?: () => void;
    onDismiss?: () => void;
    variant?: 'error' | 'warning' | 'info' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    className?: string;
    retryText?: string;
    dismissText?: string;
    showIcon?: boolean;
    showBorder?: boolean;
    shadow?: boolean;
    action?: React.ReactNode;
    code?: string;
    details?: string;
    compact?: boolean;
}

export interface NetworkErrorProps extends Omit<ErrorMessageProps, 'variant' | 'title'> {
    onRetry: () => void;
    showRetry?: boolean;
}

// Data Loading Error Component
export interface DataLoadErrorProps extends Omit<ErrorMessageProps, 'variant' | 'title'> {
    resourceName?: string;
    onRetry: () => void;
}

// Permission Error Component
export interface PermissionErrorProps extends Omit<ErrorMessageProps, 'variant' | 'title'> {
    requiredPermission?: string;
    onRequestAccess?: () => void;
}

// Form Validation Error Component
export interface ValidationErrorProps extends Omit<ErrorMessageProps, 'variant'> {
    errors?: string[];
    fieldName?: string;
}


// Dental Clinic Specific Errors
export interface PatientDataErrorProps extends Omit<ErrorMessageProps, 'variant' | 'title'> {
    patientId?: string;
    onRetry: () => void;
}

export interface AppointmentErrorProps extends Omit<ErrorMessageProps, 'variant' | 'title'> {
    appointmentId?: string;
    onRetry?: () => void;
    onSchedule?: () => void;
}