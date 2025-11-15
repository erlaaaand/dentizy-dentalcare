import { AlertTriangle, AlertCircle, CheckCircle, Info, Trash2, LogOut, Archive } from 'lucide-react';


export const typeConfig = {
    info: {
        icon: Info,
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        borderColor: 'border-blue-200',
        buttonVariant: 'primary' as const,
        defaultTitle: 'Information',
        defaultConfirmText: undefined
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50',
        iconColor: 'text-yellow-600',
        borderColor: 'border-yellow-200',
        buttonVariant: 'warning' as const,
        defaultTitle: 'Warning',
        defaultConfirmText: undefined
    },
    danger: {
        icon: AlertCircle,
        bgColor: 'bg-red-50',
        iconColor: 'text-red-600',
        borderColor: 'border-red-200',
        buttonVariant: 'danger' as const,
        defaultTitle: 'Danger',
        defaultConfirmText: undefined
    },
    success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        iconColor: 'text-green-600',
        borderColor: 'border-green-200',
        buttonVariant: 'success' as const,
        defaultTitle: 'Success',
        defaultConfirmText: undefined
    },
    delete: {
        icon: Trash2,
        bgColor: 'bg-red-50',
        iconColor: 'text-red-600',
        borderColor: 'border-red-200',
        buttonVariant: 'danger' as const,
        defaultTitle: 'Delete Confirmation',
        defaultConfirmText: 'Delete',
    },
    logout: {
        icon: LogOut,
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-600',
        borderColor: 'border-orange-200',
        buttonVariant: 'warning' as const,
        defaultTitle: 'Logout Confirmation',
        defaultConfirmText: 'Logout',
    },
    archive: {
        icon: Archive,
        bgColor: 'bg-purple-50',
        iconColor: 'text-purple-600',
        borderColor: 'border-purple-200',
        buttonVariant: 'primary' as const,
        defaultTitle: 'Archive Confirmation',
        defaultConfirmText: 'Archive',
    },
};

export const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
};

export const variantClasses = {
    default: 'p-6',
    compact: 'p-4',
    detailed: 'p-8',
};

export const alignClasses = {
    center: 'text-center',
    left: 'text-left',
};