// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

export const sizeClasses = {
    sm: {
        title: 'text-xl font-bold',
        description: 'text-xs mt-1',
        backButton: 'text-xs mb-1',
        padding: 'px-4 py-3',
    },
    md: {
        title: 'text-2xl font-bold',
        description: 'text-sm mt-1',
        backButton: 'text-sm mb-2',
        padding: 'px-6 py-4',
    },
    lg: {
        title: 'text-3xl font-bold',
        description: 'text-base mt-1',
        backButton: 'text-base mb-2',
        padding: 'px-8 py-6',
    },
};

export const alignClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
};

export const tabVariantClasses = {
    default: {
        base: 'border-b-2 font-medium text-sm transition-colors',
        active: 'border-blue-600 text-blue-600',
        inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
    },
    pills: {
        base: 'rounded-lg px-3 py-2 font-medium text-sm transition-colors',
        active: 'bg-blue-600 text-white',
        inactive: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    },
    underline: {
        base: 'border-b font-medium text-sm transition-colors',
        active: 'border-blue-600 text-blue-600',
        inactive: 'border-transparent text-gray-500 hover:text-gray-700',
    },
};