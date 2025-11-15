export const sizeClasses = {
    sm: {
        input: 'px-3 py-1.5 text-sm',
        label: 'text-sm mb-1',
        calendar: 'text-sm',
        icon: 'w-4 h-4',
    },
    md: {
        input: 'px-4 py-2 text-sm',
        label: 'text-sm mb-1',
        calendar: 'text-base',
        icon: 'w-5 h-5',
    },
    lg: {
        input: 'px-4 py-3 text-base',
        label: 'text-base mb-2',
        calendar: 'text-lg',
        icon: 'w-6 h-6',
    },
};

export const variantClasses = {
    default: {
        base: 'border-gray-300 bg-white',
        focus: 'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        disabled: 'bg-gray-100 text-gray-400',
    },
    filled: {
        base: 'border-transparent bg-gray-50',
        focus: 'focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500',
        disabled: 'bg-gray-100 text-gray-400',
    },
    outlined: {
        base: 'border-gray-300 bg-transparent',
        focus: 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        disabled: 'bg-transparent text-gray-400',
    },
};

export const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];