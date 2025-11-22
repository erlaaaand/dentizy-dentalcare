import { Check, X, Clock, AlertTriangle, Info, Circle, HelpCircle } from 'lucide-react';
import { STATUS_COLORS, APPOINTMENT_STATUS } from '@/core/constants/status.constants';

// Mapping warna dari Core ke Tailwind classes
const colorMap = {
    blue: {
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        ringColor: 'ring-blue-500',
    },
    green: {
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        ringColor: 'ring-green-500',
    },
    red: {
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        ringColor: 'ring-red-500',
    },
    yellow: {
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        ringColor: 'ring-yellow-500',
    },
    gray: {
        color: 'bg-gray-500',
        textColor: 'text-gray-700',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        ringColor: 'ring-gray-500',
    }
};

export const statusConfig = {
    // Menggunakan konstanta dari Core
    [APPOINTMENT_STATUS.DIJADWALKAN]: {
        ...colorMap[STATUS_COLORS[APPOINTMENT_STATUS.DIJADWALKAN] || 'blue'],
        label: 'Dijadwalkan',
        icon: Clock,
    },
    [APPOINTMENT_STATUS.SELESAI]: {
        ...colorMap[STATUS_COLORS[APPOINTMENT_STATUS.SELESAI] || 'green'],
        label: 'Selesai',
        icon: Check,
    },
    [APPOINTMENT_STATUS.DIBATALKAN]: {
        ...colorMap[STATUS_COLORS[APPOINTMENT_STATUS.DIBATALKAN] || 'red'],
        label: 'Dibatalkan',
        icon: X,
    },
    // Fallback/Generic statuses
    active: {
        ...colorMap.green,
        label: 'Active',
        icon: Check,
    },
    inactive: {
        ...colorMap.gray,
        label: 'Inactive',
        icon: Circle,
    },
    error: {
        ...colorMap.red,
        label: 'Error',
        icon: AlertTriangle,
    },
    info: {
        ...colorMap.blue,
        label: 'Info',
        icon: Info,
    },
    unknown: {
        ...colorMap.gray,
        label: 'Unknown',
        icon: HelpCircle,
    }
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