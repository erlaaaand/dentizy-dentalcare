export const sizeClasses = {
    sm: {
        container: 'h-8',
        input: 'pl-8 pr-7 py-1.5 text-sm',
        icon: 'w-4 h-4',
        clear: 'right-2',
    },
    md: {
        container: 'h-10',
        input: 'pl-10 pr-8 py-2 text-base',
        icon: 'w-5 h-5',
        clear: 'right-2.5',
    },
    lg: {
        container: 'h-12',
        input: 'pl-11 pr-9 py-3 text-lg',
        icon: 'w-5 h-5',
        clear: 'right-3',
    },
};

export const variantClasses = {
    default: {
        input: 'border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        background: 'bg-white',
    },
    minimal: {
        input: 'border border-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        background: 'bg-white',
    },
    filled: {
        input: 'border border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        background: 'bg-gray-100 focus:bg-white',
    },
};