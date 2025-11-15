import { AlertCircle, RefreshCw, AlertTriangle, Info, XCircle } from 'lucide-react';

export const variantConfig = {
    error: {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-500',
        titleColor: 'text-red-800',
        textColor: 'text-red-700',
        icon: AlertCircle,
    },
    warning: {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-500',
        titleColor: 'text-yellow-800',
        textColor: 'text-yellow-700',
        icon: AlertTriangle,
    },
    info: {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-500',
        titleColor: 'text-blue-800',
        textColor: 'text-blue-700',
        icon: Info,
    },
    danger: {
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
        iconColor: 'text-red-600',
        titleColor: 'text-red-900',
        textColor: 'text-red-800',
        icon: XCircle,
    },
};

export const sizeClasses = {
    sm: {
        container: 'p-3 text-sm',
        icon: 'w-4 h-4',
        title: 'text-sm',
        message: 'text-sm',
        button: 'text-xs',
    },
    md: {
        container: 'p-4 text-base',
        icon: 'w-5 h-5',
        title: 'text-base',
        message: 'text-base',
        button: 'text-sm',
    },
    lg: {
        container: 'p-6 text-lg',
        icon: 'w-6 h-6',
        title: 'text-lg',
        message: 'text-lg',
        button: 'text-base',
    },
};