export const sizeClasses = {
    sm: {
        textarea: 'px-3 py-1.5 text-sm min-h-[80px]',
        label: 'text-xs mb-1',
        hint: 'text-xs mt-1',
        charCount: 'text-xs',
    },
    md: {
        textarea: 'px-4 py-2 text-base min-h-[100px]',
        label: 'text-sm mb-1',
        hint: 'text-sm mt-1',
        charCount: 'text-xs',
    },
    lg: {
        textarea: 'px-4 py-3 text-lg min-h-[120px]',
        label: 'text-base mb-1.5',
        hint: 'text-base mt-1.5',
        charCount: 'text-sm',
    },
};

export const variantClasses = {
    default: {
        textarea: 'border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        background: 'bg-white',
    },
    minimal: {
        textarea: 'border border-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        background: 'bg-white',
    },
    filled: {
        textarea: 'border border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        background: 'bg-gray-100 focus:bg-white',
    },
};

export const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
};

export const stateClasses = {
    error: 'border-red-500 focus:ring-red-500',
    disabled: 'bg-gray-100 cursor-not-allowed opacity-60',
    normal: 'border-gray-300',
};