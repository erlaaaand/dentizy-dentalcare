import { AvatarProps } from "./avatar.types";

export const sizeClasses = {
    xs: 'w-6 h-6 text-xs min-w-6',
    sm: 'w-8 h-8 text-sm min-w-8',
    md: 'w-10 h-10 text-base min-w-10',
    lg: 'w-12 h-12 text-lg min-w-12',
    xl: 'w-16 h-16 text-xl min-w-16',
    '2xl': 'w-20 h-20 text-2xl min-w-20',
    '3xl': 'w-24 h-24 text-3xl min-w-24',
};

export const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg',
};

export const statusSizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
    '3xl': 'w-5 h-5',
};

export const statusPositionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
};

export const statusColorClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
};

export const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
};

export const borderClasses = {
    default: 'ring-2 ring-white',
    colored: 'ring-2',
    none: 'ring-0',
};

export const spacingClasses = {
    none: '-space-x-0',
    sm: '-space-x-1',
    md: '-space-x-2',
    lg: '-space-x-3',
};

export const verticalSpacingClasses = {
    none: '-space-y-0',
    sm: '-space-y-1',
    md: '-space-y-2',
    lg: '-space-y-3',
};

// Modern gradient color palette
export const colorGradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-teal-500 to-blue-500',
    'from-yellow-500 to-orange-500',
    'from-red-500 to-pink-500',
    'from-cyan-500 to-blue-500',
    'from-emerald-500 to-teal-500',
];

export const solidColors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-cyan-500',
];

export function getColorFromString(str: string, type: 'gradient' | 'solid' = 'gradient'): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = type === 'gradient' ? colorGradients : solidColors;
    return colors[Math.abs(hash) % colors.length];
}

export function getStatusBorderColor(status: AvatarProps['status']): string {
    switch (status) {
        case 'online':
            return 'ring-green-500';
        case 'busy':
            return 'ring-red-500';
        case 'away':
            return 'ring-yellow-500';
        case 'offline':
            return 'ring-gray-400';
        default:
            return 'ring-transparent';
    }
}