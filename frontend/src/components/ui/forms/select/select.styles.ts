export const sizeClasses = {
    sm: {
        select: 'px-3 py-1.5 text-sm',
        icon: 'w-4 h-4 right-2',
        label: 'text-xs mb-1',
        hint: 'text-xs mt-1',
    },
    md: {
        select: 'px-4 py-2 text-base',
        icon: 'w-5 h-5 right-3',
        label: 'text-sm mb-1',
        hint: 'text-sm mt-1',
    },
    lg: {
        select: 'px-4 py-3 text-lg',
        icon: 'w-5 h-5 right-3',
        label: 'text-base mb-1.5',
        hint: 'text-base mt-1.5',
    },
};

export const variantClasses = {
    default: {
        select: 'border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        background: 'bg-white',
    },
    minimal: {
        select: 'border border-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        background: 'bg-white',
    },
    filled: {
        select: 'border border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        background: 'bg-gray-100 focus:bg-white',
    },
};

export const stateClasses = {
    error: 'border-red-500 focus:ring-red-500',
    disabled: 'bg-gray-100 cursor-not-allowed opacity-60',
    normal: 'border-gray-300',
};