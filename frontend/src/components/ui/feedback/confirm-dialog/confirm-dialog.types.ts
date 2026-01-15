import { LucideIcon } from 'lucide-react';

export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title?: string;
    message: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    type?: 'info' | 'warning' | 'danger' | 'success' | 'delete' | 'logout' | 'archive';
    variant?: 'default' | 'compact' | 'detailed' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    disabled?: boolean;
    icon?: LucideIcon;
    showIcon?: boolean;
    confirmVariant?: 'primary' | 'danger' | 'success' | 'warning';
    cancelVariant?: 'secondary' | 'outline' | 'ghost';
    align?: 'center' | 'left';
    overlayClose?: boolean;
    escapeClose?: boolean;
    showCloseButton?: boolean;
    className?: string;
    contentClassName?: string;
    hideCancel?: boolean;
    destructive?: boolean;
    additionalActions?: React.ReactNode;
}

export interface DeleteConfirmDialogProps extends Omit<ConfirmDialogProps, 'type' | 'confirmVariant'> {
    itemName?: string;
    itemType?: string;
    permanent?: boolean;
}

// Logout Confirmation Dialog
export interface LogoutConfirmDialogProps extends Omit<ConfirmDialogProps, 'type'> {
    userName?: string;
}

// Archive Confirmation Dialog
export interface ArchiveConfirmDialogProps extends Omit<ConfirmDialogProps, 'type'> {
    itemName?: string;
    itemType?: string;
}

// Patient Delete Confirmation (Dental Clinic Specific)
export interface PatientDeleteConfirmDialogProps extends Omit<ConfirmDialogProps, 'type' | 'message'> {
    patientName: string;
    hasAppointments?: boolean;
    hasMedicalRecords?: boolean;
}

export interface AppointmentCancelConfirmDialogProps extends Omit<ConfirmDialogProps, 'type' | 'message'> {
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    sendNotification?: boolean;
    message?: string;
}