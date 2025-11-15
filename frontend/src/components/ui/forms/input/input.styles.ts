export const inputSizeClasses = {
    sm: {
        input: 'px-3 py-1.5 text-sm',
        icon: 'text-sm',
        label: 'text-xs mb-1',
        hint: 'text-xs mt-1',
    },
    md: {
        input: 'px-4 py-2 text-base',
        icon: 'text-base',
        label: 'text-sm mb-1',
        hint: 'text-sm mt-1',
    },
    lg: {
        input: 'px-4 py-3 text-lg',
        icon: 'text-lg',
        label: 'text-base mb-1.5',
        hint: 'text-base mt-1.5',
    },
};

export const inputVariantClasses = {
    default: {
        input: 'border-gray-300 focus:ring-blue-500 focus:border-transparent',
        label: 'text-gray-700',
    },
    error: {
        input: 'border-red-500 focus:ring-red-500 focus:border-transparent',
        label: 'text-gray-700',
    },
    disabled: {
        input: 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60',
        label: 'text-gray-400',
    },
};