'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn, useAuth, useToast, useClickOutside, getInitials, ROUTES, ROLE_LABELS } from '@/core';
import { useGetProfile } from '@/core/services/api/auth.api';
import { LoadingSpinner } from '@/components';
import { LogoutConfirmDialog } from '@/components';
import type { HeaderProps } from './header.types';
import { sizeClasses, variantClasses } from './header.styles';
import { ChevronIcon } from './header.icon';
import { ProfileDropdown } from './ProfileDropdown';
import { MinimalHeader } from './MinimalHeader';
import { DashboardHeader } from './DashboardHeader';
import { SimpleHeader } from './SimpleHeader';
import { HeaderSection } from './HeaderSection';
import { HeaderTitle } from './HeaderTitle';
import { HeaderSubtitle } from './HeaderSubtitle';

// Force cleanup function
const forceLogoutCleanup = () => {
    console.log('🧹 Force cleanup started...');

    // Clear ALL cookies
    document.cookie.split(';').forEach(c => {
        const name = c.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        document.cookie = `${name}=; max-age=0; path=/;`;
    });

    // Clear ALL storage
    try {
        localStorage.clear();
        sessionStorage.clear();
    } catch (e) {
        console.error('Storage clear error:', e);
    }

    console.log('✅ Force cleanup completed');
};

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
    const { user, logout: authLogout, isAuthenticated, loading: authLoading } = useAuth();
    const { showSuccess, showError } = useToast();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const { data: profileData } = useGetProfile();

    // ✅ FIX: Wait for client-side mount to prevent hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useClickOutside(profileRef as React.RefObject<HTMLDivElement>, () => {
        if (showProfileDropdown) setShowProfileDropdown(false);
    });

    const sizeClass = sizeClasses[size];
    const variantClass = variantClasses[variant];

    const handleLogout = async () => {
        // Prevent double clicks
        if (isLoggingOut) {
            console.log('⚠️ Already logging out, ignoring...');
            return;
        }

        console.log('🔴 === LOGOUT PROCESS STARTED ===');

        // Close dialog and show loading
        setShowLogoutDialog(false);
        setIsLoggingOut(true);

        // Execute cleanup after a tiny delay to ensure loading shows
        setTimeout(async () => {
            try {
                console.log('🔄 Starting cleanup process...');

                // Try to call logout API (optional, don't wait)
                try {
                    console.log('📡 Calling logout API...');
                    await Promise.race([
                        authLogout(),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
                    ]);
                    console.log('✅ Logout API completed');
                } catch (apiError) {
                    console.warn('⚠️ Logout API error/timeout (continuing):', apiError);
                }

                // Force cleanup (ALWAYS execute)
                console.log('🧹 Executing force cleanup...');
                forceLogoutCleanup();

                // Show success message
                try {
                    showSuccess('Logout berhasil! Sampai jumpa kembali.');
                } catch (toastError) {
                    console.warn('Toast error:', toastError);
                }

                console.log('🔄 Redirecting to login...');
                console.log('🔴 === LOGOUT PROCESS COMPLETED ===');

                // Force redirect
                window.location.href = ROUTES.LOGIN || '/login';

            } catch (error) {
                console.error('❌ Critical logout error:', error);

                // Still force cleanup and redirect
                forceLogoutCleanup();

                try {
                    showError('Terjadi kesalahan, memaksa keluar...');
                } catch (e) {
                    // Ignore
                }

                // Force redirect anyway
                setTimeout(() => {
                    window.location.href = ROUTES.LOGIN || '/login';
                }, 500);
            }
        }, 100);
    };

    const handleMenuSelect = async (value: string) => {
        console.log('🎯 Menu selected:', value);
        setShowProfileDropdown(false);

        try {
            switch (value) {
                case 'profile':
                    console.log('📝 Navigating to profile...');
                    if (onProfileClick) {
                        onProfileClick();
                    } else {
                        router.push(ROUTES.PROFILE || '/dashboard/profile');
                    }
                    break;

                case 'settings':
                    console.log('⚙️ Navigating to settings...');
                    if (onSettingsClick) {
                        onSettingsClick();
                    } else {
                        router.push('/dashboard/settings');
                    }
                    break;

                case 'logout':
                    console.log('🚪 Logout menu clicked');
                    setShowLogoutDialog(true);
                    break;

                default:
                    console.warn('⚠️ Unknown menu action:', value);
            }
        } catch (error) {
            console.error('❌ Menu action error:', error);
            try {
                showError('Terjadi kesalahan. Silakan coba lagi.');
            } catch (e) {
                // Ignore
            }
        }
    };

    const handleLogoutConfirm = async () => {
        if (onLogoutClick) {
            console.log('🔄 Using custom onLogoutClick handler');
            await onLogoutClick();
        } else {
            console.log('🔄 Using default logout handler');
            await handleLogout();
        }
    };

    const getUserRoleLabel = () => {
        const role = user?.role as keyof typeof ROLE_LABELS | undefined;

        if (role && ROLE_LABELS[role]) {
            return ROLE_LABELS[role];
        }

        return role || 'User';
    };

    const getUserName = (): string => {
        return (
            (userName as string | undefined) ??
            (profileData?.nama_lengkap as string | undefined) ??
            (user?.nama_lengkap as string | undefined) ??
            'User'
        );
    };

    const getUserRole = () => {
        return userRole || getUserRoleLabel();
    };

    const getWelcomeText = () => {
        return welcomeText || 'Selamat datang kembali di dashboard Dentizy';
    };

    // Custom children render
    if (children) {
        return (
            <header id="app-header" className={cn(variantClass, sizeClass.container, className)}>
                {children}
            </header>
        );
    }

    // ✅ FIX: Wait for mount before checking auth (prevent hydration mismatch)
    if (!isMounted) {
        return (
            <header id="app-header" className={cn(variantClass, sizeClass.container, className)}>
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-64 mt-2"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </header>
        );
    }

    // ✅ FIX: Show loading skeleton during auth check
    if (authLoading) {
        return (
            <header id="app-header" className={cn(variantClass, sizeClass.container, className)}>
                <div className="flex items-center justify-between">
                    {showWelcome && (
                        <div className="min-w-0 flex-1">
                            <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
                            <div className="h-4 bg-gray-100 rounded animate-pulse w-64 mt-2"></div>
                        </div>
                    )}
                    {showProfile && (
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                    )}
                </div>
            </header>
        );
    }

    // ✅ FIX: Only hide if definitely not authenticated (after loading complete)
    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            <header id="app-header" className={cn(variantClass, sizeClass.container, className)}>
                <div className="flex items-center justify-between">
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

                    {showProfile && (
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => {
                                    console.log('👤 Profile button clicked');
                                    setShowProfileDropdown(!showProfileDropdown);
                                }}
                                className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Menu profil"
                                aria-expanded={showProfileDropdown}
                                disabled={isLoggingOut}
                            >
                                <div className={cn(
                                    'bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full',
                                    'flex items-center justify-center shadow-sm text-white font-medium',
                                    sizeClass.avatar,
                                    isLoggingOut && 'opacity-50 cursor-not-allowed'
                                )}>
                                    {userAvatar ? (
                                        <img
                                            src={userAvatar}
                                            alt={getUserName()}
                                            className="rounded-full w-full h-full object-cover"
                                        />
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
                                username={user?.username as string | undefined}
                                onMenuSelect={handleMenuSelect}
                                size={size}
                            />
                        </div>
                    )}
                </div>
            </header>

            {/* Logout Confirmation Dialog */}
            <LogoutConfirmDialog
                isOpen={showLogoutDialog}
                onClose={() => setShowLogoutDialog(false)}
                onConfirm={handleLogoutConfirm}
                userName={getUserName()}
                message="Apakah Anda yakin ingin keluar dari sistem?"
            />

            {/* Loading Overlay saat Logout */}
            {isLoggingOut && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center"
                    style={{ position: 'fixed' }}
                >
                    <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center max-w-sm mx-4 animate-in fade-in zoom-in duration-200">
                        <LoadingSpinner size="lg" className="mb-4" />
                        <p className="text-gray-800 font-bold text-xl mb-2">Logging out...</p>
                        <p className="text-gray-600 text-sm text-center">
                            Menghapus sesi dan mengamankan akun Anda
                        </p>
                        <div className="mt-4 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                            <div className="bg-blue-600 h-full animate-pulse" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const HeaderComponent = Object.assign(Header, {
    Minimal: MinimalHeader,
    Dashboard: DashboardHeader,
    Simple: SimpleHeader,
    Section: HeaderSection,
    Title: HeaderTitle,
    Subtitle: HeaderSubtitle,
});

export default HeaderComponent;