export const sizeClasses = {
    xs: {
        spinner: 'h-3 w-3',
        text: 'text-xs',
        border: 'border',
    },
    sm: {
        spinner: 'h-4 w-4',
        text: 'text-sm',
        border: 'border',
    },
    md: {
        spinner: 'h-6 w-6',
        text: 'text-sm',
        border: 'border-2',
    },
    lg: {
        spinner: 'h-8 w-8',
        text: 'text-base',
        border: 'border-2',
    },
    xl: {
        spinner: 'h-12 w-12',
        text: 'text-lg',
        border: 'border-3',
    },
    '2xl': {
        spinner: 'h-16 w-16',
        text: 'text-xl',
        border: 'border-4',
    },
};

export const variantClasses = {
    default: {
        border: 'border-gray-200',
        active: 'border-blue-600 border-t-transparent',
        text: 'text-gray-600',
    },
    primary: {
        border: 'border-blue-100',
        active: 'border-blue-600 border-t-transparent',
        text: 'text-blue-600',
    },
    success: {
        border: 'border-green-100',
        active: 'border-green-600 border-t-transparent',
        text: 'text-green-600',
    },
    warning: {
        border: 'border-yellow-100',
        active: 'border-yellow-600 border-t-transparent',
        text: 'text-yellow-600',
    },
    error: {
        border: 'border-red-100',
        active: 'border-red-600 border-t-transparent',
        text: 'text-red-600',
    },
    gradient: {
        border: 'border-gray-200',
        active: 'border-gradient-to-r from-blue-600 to-purple-600 border-t-transparent',
        text: 'text-gray-600',
    },
};

export const speedClasses = {
    slow: 'animate-spin-slow',
    normal: 'animate-spin',
    fast: 'animate-spin-fast',
};

export const thicknessClasses = {
    thin: {
        xs: 'border',
        sm: 'border',
        md: 'border',
        lg: 'border',
        xl: 'border-2',
        '2xl': 'border-2',
    },
    normal: {
        xs: 'border',
        sm: 'border',
        md: 'border-2',
        lg: 'border-2',
        xl: 'border-3',
        '2xl': 'border-4',
    },
    thick: {
        xs: 'border-2',
        sm: 'border-2',
        md: 'border-3',
        lg: 'border-3',
        xl: 'border-4',
        '2xl': 'border-6',
    },
};
