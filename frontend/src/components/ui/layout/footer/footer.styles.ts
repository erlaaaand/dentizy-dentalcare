export const sizeClasses = {
    sm: {
        container: 'px-4 py-3',
        text: 'text-xs',
        icon: 'w-3 h-3',
    },
    md: {
        container: 'px-6 py-4',
        text: 'text-sm',
        icon: 'w-4 h-4',
    },
    lg: {
        container: 'px-8 py-6',
        text: 'text-base',
        icon: 'w-5 h-5',
    },
};

export const variantClasses = {
    default: 'bg-white border-t border-gray-200',
    minimal: 'bg-transparent border-t border-gray-100',
    centered: 'bg-white border-t border-gray-200 text-center',
};

export const statusClasses = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    maintenance: 'bg-yellow-500',
};

export const statusText = {
    online: 'Sistem Online',
    offline: 'Sistem Offline',
    maintenance: 'Dalam Pemeliharaan',
};
