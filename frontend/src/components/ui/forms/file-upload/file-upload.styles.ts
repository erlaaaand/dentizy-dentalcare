export const sizeClasses = {
    sm: {
        container: 'p-4',
        icon: 'w-8 h-8',
        text: 'text-xs',
        label: 'text-sm mb-1',
    },
    md: {
        container: 'p-6',
        icon: 'w-12 h-12',
        text: 'text-sm',
        label: 'text-sm mb-1',
    },
    lg: {
        container: 'p-8',
        icon: 'w-16 h-16',
        text: 'text-base',
        label: 'text-base mb-2',
    },
};

export const variantClasses = {
    default: {
        base: 'border-gray-300 bg-white',
        active: 'border-blue-500 bg-blue-50',
        hover: 'hover:border-gray-400',
        disabled: 'bg-gray-100 opacity-60',
    },
    filled: {
        base: 'border-transparent bg-gray-50',
        active: 'border-blue-500 bg-blue-100',
        hover: 'hover:bg-gray-100',
        disabled: 'bg-gray-100 opacity-60',
    },
    outlined: {
        base: 'border-gray-300 bg-transparent',
        active: 'border-blue-500 bg-blue-50',
        hover: 'hover:border-gray-400',
        disabled: 'bg-transparent opacity-60',
    },
};