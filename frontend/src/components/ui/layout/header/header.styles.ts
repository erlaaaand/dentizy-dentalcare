// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

import { HeaderMenuOption } from "./header.types";

const sizeClasses = {
    sm: {
        container: 'px-4 py-3',
        title: 'text-xl',
        subtitle: 'text-xs',
        avatar: 'w-6 h-6 text-xs',
    },
    md: {
        container: 'px-6 py-4',
        title: 'text-2xl',
        subtitle: 'text-sm',
        avatar: 'w-8 h-8 text-sm',
    },
    lg: {
        container: 'px-8 py-6',
        title: 'text-3xl',
        subtitle: 'text-base',
        avatar: 'w-10 h-10 text-base',
    },
};

const variantClasses = {
    default: 'bg-white shadow-sm border-b border-gray-200',
    minimal: 'bg-white border-b border-gray-100',
    dashboard: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200',
};

const defaultMenuOptions: HeaderMenuOption[] = [
    { value: 'profile', label: 'Profil Saya' },
    { value: 'settings', label: 'Pengaturan' },
    { value: 'logout', label: 'Keluar', type: 'danger' },
];