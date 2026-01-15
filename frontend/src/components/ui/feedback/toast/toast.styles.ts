export const toastTypes = {
    success: {
        base: 'bg-green-50 border-green-200 text-green-800',
        filled: 'bg-green-600 border-green-600 text-white',
        outlined: 'bg-white border-green-600 text-green-700',
        icon: 'text-green-500',
    },
    error: {
        base: 'bg-red-50 border-red-200 text-red-800',
        filled: 'bg-red-600 border-red-600 text-white',
        outlined: 'bg-white border-red-600 text-red-700',
        icon: 'text-red-500',
    },
    warning: {
        base: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        filled: 'bg-yellow-600 border-yellow-600 text-white',
        outlined: 'bg-white border-yellow-600 text-yellow-700',
        icon: 'text-yellow-500',
    },
    info: {
        base: 'bg-blue-50 border-blue-200 text-blue-800',
        filled: 'bg-blue-600 border-blue-600 text-white',
        outlined: 'bg-white border-blue-600 text-blue-700',
        icon: 'text-blue-500',
    },
} as const;

export const sizeClasses = {
    sm: {
        container: 'p-3 gap-2',
        message: 'text-sm',
        icon: 'w-4 h-4',
        close: 'w-3 h-3',
    },
    md: {
        container: 'p-4 gap-3',
        message: 'text-sm',
        icon: 'w-5 h-5',
        close: 'w-4 h-4',
    },
    lg: {
        container: 'p-5 gap-4',
        message: 'text-base',
        icon: 'w-6 h-6',
        close: 'w-5 h-5',
    },
};

export const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
};

export const animationClasses = {
    'top-right': 'animate-in slide-in-from-right-full',
    'top-left': 'animate-in slide-in-from-left-full',
    'top-center': 'animate-in slide-in-from-top-full',
    'bottom-right': 'animate-in slide-in-from-right-full',
    'bottom-left': 'animate-in slide-in-from-left-full',
    'bottom-center': 'animate-in slide-in-from-bottom-full',
};

