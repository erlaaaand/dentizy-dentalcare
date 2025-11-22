'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/core';

// ✅ Import terpusat dari @/core (Best Practice #1)
import {
    useAuth,
    useConfirm,
    useToast,
    useClickOutside,
    getInitials,    // Utils Formatting
    ROUTES,         // Constants Routes
    ROLE_LABELS     // Constants Roles
} from '@/core';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface HeaderProps {
    className?: string;
    variant?: 'default' | 'minimal' | 'dashboard';
    size?: 'sm' | 'md' | 'lg';
    showWelcome?: boolean;
    showProfile?: boolean;
    userName?: string;
    userRole?: string;
    userAvatar?: string;
    welcomeText?: string;
    children?: React.ReactNode;
    onProfileClick?: () => void;
    onSettingsClick?: () => void;
    onLogoutClick?: () => void;
}

export interface HeaderMenuOption {
    value: string;
    label: string;
    type?: 'default' | 'danger';
}

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

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

// ============================================
// ANIMATION HOOKS & UTILITIES
// ============================================

const useDropdownAnimation = (animationDuration = 300) => {
    const [isMounted, setIsMounted] = useState(false);
    const [animationClass, setAnimationClass] = useState('animate-slide-down');
    const isClosingRef = useRef(false);

    const openDropdown = () => {
        if (isClosingRef.current || isMounted) return;
        setAnimationClass('animate-slide-down');
        setIsMounted(true);
    };

    const closeDropdown = (exitDir: 'up' | 'down' = 'up') => {
        if (isClosingRef.current) return;
        isClosingRef.current = true;
        const exitClass = exitDir === 'down' ? 'animate-slide-down-exit' : 'animate-slide-up-exit';
        setAnimationClass(exitClass);

        setTimeout(() => {
            setIsMounted(false);
            isClosingRef.current = false;
            setAnimationClass('animate-slide-down');
        }, animationDuration);
    };

    const toggleDropdown = (isOpen: boolean) => {
        if (isOpen) openDropdown();
        else if (isMounted) closeDropdown();
    };

    return {
        isMounted,
        animationClass,
        toggleDropdown,
        closeDropdown,
    };
};

// ============================================
// ICON COMPONENTS
// ============================================

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg
        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill="currentColor"
        viewBox="0 0 20 20"
    >
        <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
        />
    </svg>
);

// ============================================
// PROFILE DROPDOWN COMPONENT
// ============================================

interface ProfileDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
    userRole?: string;
    username?: string;
    menuOptions?: HeaderMenuOption[];
    onMenuSelect: (value: string) => void;
    size?: HeaderProps['size'];
}

const ProfileDropdown = React.forwardRef<HTMLDivElement, ProfileDropdownProps>(
    ({ isOpen, onClose, userName, userRole, username, menuOptions = defaultMenuOptions, onMenuSelect, size = 'md' }, ref) => {
        const { isMounted, animationClass, toggleDropdown } = useDropdownAnimation();

        useEffect(() => {
            toggleDropdown(isOpen);
        }, [isOpen, toggleDropdown]);

        const sizeClass = sizeClasses[size];

        if (!isMounted) return null;

        return (
            <div
                ref={ref}
                className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 ${animationClass}`}
            >
                <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {userName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                        {username || '-'}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                        {userRole || 'User'}
                    </p>
                </div>
                <div className="py-2">
                    {menuOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onMenuSelect(option.value)}
                            className={cn(
                                'block w-full text-left px-4 py-2 text-sm transition-colors',
                                option.type === 'danger'
                                    ? 'text-red-600 hover:bg-red-50'
                                    : 'text-gray-700 hover:bg-gray-100'
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        );
    }
);

ProfileDropdown.displayName = 'ProfileDropdown';

// ============================================
// MAIN HEADER COMPONENT
// ============================================

export function Header({
    className,
    variant = 'default',
    size = 'md',
    showWelcome = true,
    showProfile = true,
    userName,
    userRole,
    userAvatar,
    welcomeText,
    children,
    onProfileClick,
    onSettingsClick,
    onLogoutClick,
}: HeaderProps) {
    const router = useRouter();
    const { user, logout: authLogout, isAuthenticated } = useAuth();
    const { confirm } = useConfirm();
    const { showSuccess, showError } = useToast();

    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useClickOutside(profileRef, () => {
        if (showProfileDropdown) setShowProfileDropdown(false);
    });

    const sizeClass = sizeClasses[size];
    const variantClass = variantClasses[variant];

    // Handle menu selection with custom callbacks
    const handleMenuSelect = async (value: string) => {
        setShowProfileDropdown(false);

        switch (value) {
            case 'profile':
                onProfileClick ? onProfileClick() : router.push(ROUTES.PROFILE || '/dashboard/profile');
                break;
            case 'settings':
                onSettingsClick ? onSettingsClick() : router.push('/dashboard/settings');
                break;
            case 'logout':
                if (onLogoutClick) {
                    onLogoutClick();
                } else {
                    await handleLogout();
                }
                break;
        }
    };

    const handleLogout = async () => {
        const isConfirmed = await confirm({
            title: 'Konfirmasi Logout',
            message: 'Apakah Anda yakin ingin keluar dari sistem?',
            type: 'danger',
            confirmText: 'Ya, Keluar'
        });

        if (isConfirmed) {
            try {
                await authLogout();
                showSuccess('Logout berhasil! Sampai jumpa kembali.');
                router.push(ROUTES.LOGIN);
            } catch (error) {
                showError('Gagal logout! Silakan coba lagi.');
            }
        }
    };

    const getUserRoleLabel = () => {
        if (!user?.role) return 'User';
        return ROLE_LABELS[user.role] || user.role;
    };

    const getUserName = () => userName || user?.nama_lengkap || 'User';
    const getUserRole = () => userRole || getUserRoleLabel();
    const getWelcomeText = () => welcomeText || 'Selamat datang kembali di dashboard Dentizy';

    // If children are provided, render custom content
    if (children) {
        return (
            <header
                id="app-header"
                className={cn(
                    variantClass,
                    sizeClass.container,
                    className
                )}
            >
                {children}
            </header>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <header
            id="app-header"
            className={cn(
                variantClass,
                sizeClass.container,
                className
            )}
        >
            <div className="flex items-center justify-between">
                {/* Welcome Section */}
                {showWelcome && (
                    <div className="min-w-0 flex-1">
                        <h1 className={cn('font-bold text-gray-900', sizeClass.title)}>
                            Halo, {getUserName()}!
                        </h1>
                        <p className={cn('text-gray-600 mt-1', sizeClass.subtitle)}>
                            {getWelcomeText()}
                        </p>
                    </div>
                )}

                {/* Profile Dropdown */}
                {showProfile && (
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Menu profil"
                            aria-expanded={showProfileDropdown}
                        >
                            <div className={cn(
                                'bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm text-white font-medium',
                                sizeClass.avatar
                            )}>
                                {userAvatar ? (
                                    <img src={userAvatar} alt={getUserName()} className="rounded-full" />
                                ) : (
                                    <span>{getInitials(getUserName())}</span>
                                )}
                            </div>
                            <ChevronIcon isOpen={showProfileDropdown} />
                        </button>

                        <ProfileDropdown
                            isOpen={showProfileDropdown}
                            onClose={() => setShowProfileDropdown(false)}
                            userName={getUserName()}
                            userRole={getUserRole()}
                            username={user?.username}
                            onMenuSelect={handleMenuSelect}
                            size={size}
                        />
                    </div>
                )}
            </div>
        </header>
    );
}

// ============================================
// SPECIALIZED HEADER COMPONENTS
// ============================================

// Minimal Header for authentication pages
export function MinimalHeader({ className }: { className?: string }) {
    return (
        <Header
            variant="minimal"
            size="sm"
            showWelcome={false}
            showProfile={false}
            className={className}
        />
    );
}

// Dashboard Header with gradient background
export function DashboardHeader({
    className,
    userName,
    userRole,
}: {
    className?: string;
    userName?: string;
    userRole?: string;
}) {
    return (
        <Header
            variant="dashboard"
            size="lg"
            userName={userName}
            userRole={userRole}
            className={className}
        />
    );
}

// Simple Header for basic pages
export function SimpleHeader({
    className,
    title,
    subtitle,
}: {
    className?: string;
    title?: string;
    subtitle?: string;
}) {
    return (
        <Header
            variant="minimal"
            size="md"
            showProfile={false}
            className={className}
        >
            <div className="min-w-0 flex-1">
                {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
                {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
        </Header>
    );
}

// ============================================
// HEADER SECTION COMPONENTS (for compound pattern)
// ============================================

export function HeaderSection({
    children,
    position = 'left',
    className,
}: {
    children: React.ReactNode;
    position?: 'left' | 'center' | 'right';
    className?: string;
}) {
    const positionClasses = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
    };

    return (
        <div
            className={cn(
                'flex items-center flex-1',
                positionClasses[position],
                className
            )}
        >
            {children}
        </div>
    );
}

export function HeaderTitle({
    children,
    className,
    size = 'md',
}: {
    children: React.ReactNode;
    className?: string;
    size?: HeaderProps['size'];
}) {
    const sizeClass = sizeClasses[size];

    return (
        <h1 className={cn('font-bold text-gray-900', sizeClass.title, className)}>
            {children}
        </h1>
    );
}

export function HeaderSubtitle({
    children,
    className,
    size = 'md',
}: {
    children: React.ReactNode;
    className?: string;
    size?: HeaderProps['size'];
}) {
    const sizeClass = sizeClasses[size];

    return (
        <p className={cn('text-gray-600 mt-1', sizeClass.subtitle, className)}>
            {children}
        </p>
    );
}

// ============================================
// COMPOUND COMPONENT ASSIGNMENTS
// ============================================

// Create main component with compound pattern
const HeaderComponent = Object.assign(Header, {
    Minimal: MinimalHeader,
    Dashboard: DashboardHeader,
    Simple: SimpleHeader,
    Section: HeaderSection,
    Title: HeaderTitle,
    Subtitle: HeaderSubtitle,
});

export default HeaderComponent;