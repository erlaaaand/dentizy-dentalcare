import {AlertCircle, CheckCircle, AlertTriangle, Info, Bell } from 'lucide-react';

export const alertStyles = {
    info: {
        container: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-500',
        title: 'text-blue-800',
        message: 'text-blue-700',
        accent: 'bg-blue-500',
        gradient: 'from-blue-50 to-blue-25',
    },
    success: {
        container: 'bg-green-50 border-green-200',
        icon: 'text-green-500',
        title: 'text-green-800',
        message: 'text-green-700',
        accent: 'bg-green-500',
        gradient: 'from-green-50 to-green-25',
    },
    warning: {
        container: 'bg-yellow-50 border-yellow-200',
        icon: 'text-yellow-500',
        title: 'text-yellow-800',
        message: 'text-yellow-700',
        accent: 'bg-yellow-500',
        gradient: 'from-yellow-50 to-yellow-25',
    },
    error: {
        container: 'bg-red-50 border-red-200',
        icon: 'text-red-500',
        title: 'text-red-800',
        message: 'text-red-700',
        accent: 'bg-red-500',
        gradient: 'from-red-50 to-red-25',
    },
    neutral: {
        container: 'bg-gray-50 border-gray-200',
        icon: 'text-gray-500',
        title: 'text-gray-800',
        message: 'text-gray-700',
        accent: 'bg-gray-500',
        gradient: 'from-gray-50 to-gray-25',
    },
};

export const sizeClasses = {
    sm: {
        container: 'p-3 text-sm',
        icon: 'w-4 h-4',
        title: 'text-sm',
        message: 'text-sm',
    },
    md: {
        container: 'p-4 text-base',
        icon: 'w-5 h-5',
        title: 'text-base',
        message: 'text-base',
    },
    lg: {
        container: 'p-6 text-lg',
        icon: 'w-6 h-6',
        title: 'text-lg',
        message: 'text-lg',
    },
};

export const variantClasses = {
    banner: 'w-full rounded-lg border',
    inline: 'w-full rounded-md border',
    toast: 'max-w-md rounded-xl border shadow-xl',
    floating: 'fixed z-50 rounded-lg border shadow-2xl mx-4',
};

export const positionClasses = {
    top: 'top-4 left-1/2 transform -translate-x-1/2',
    bottom: 'bottom-4 left-1/2 transform -translate-x-1/2',
    inline: '',
};

export const defaultIcons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
    neutral: Bell,
};