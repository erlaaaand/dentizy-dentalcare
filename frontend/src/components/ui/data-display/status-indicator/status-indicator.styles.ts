import { Check, X, Clock, AlertTriangle, Info, Circle } from 'lucide-react';

export const statusConfig = {
    dijadwalkan: {
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        ringColor: 'ring-green-500',
        label: 'Active',
        icon: Check,
    },
    dibatalkan: {
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        ringColor: 'ring-red-500',
        label: 'Error',
        icon: X,
    },
    selesai: {
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        ringColor: 'ring-blue-500',
        label: 'Info',
        icon: Info,
    },
};

export const sizeClasses = {
    xs: {
        dot: 'h-1.5 w-1.5',
        icon: 'h-2 w-2',
        text: 'text-xs',
        badge: 'px-1.5 py-0.5 text-xs',
        pill: 'px-2 py-0.5 text-xs',
    },
    sm: {
        dot: 'h-2 w-2',
        icon: 'h-3 w-3',
        text: 'text-xs',
        badge: 'px-2 py-0.5 text-xs',
        pill: 'px-2.5 py-0.5 text-xs',
    },
    md: {
        dot: 'h-2.5 w-2.5',
        icon: 'h-4 w-4',
        text: 'text-sm',
        badge: 'px-2.5 py-1 text-sm',
        pill: 'px-3 py-1 text-sm',
    },
    lg: {
        dot: 'h-3 w-3',
        icon: 'h-5 w-5',
        text: 'text-base',
        badge: 'px-3 py-1.5 text-base',
        pill: 'px-4 py-1.5 text-base',
    },
    xl: {
        dot: 'h-4 w-4',
        icon: 'h-6 w-6',
        text: 'text-lg',
        badge: 'px-4 py-2 text-lg',
        pill: 'px-5 py-2 text-lg',
    },
};