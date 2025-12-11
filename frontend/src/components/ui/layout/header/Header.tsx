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
import { useQueryClient } from "@tanstack/react-query";
import { Bell } from 'lucide-react';

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
    showProfile = true,
    userName,
    userRole,
    userAvatar,
    children,
    onProfileClick,
    onSettingsClick,
    onLogoutClick,
}: HeaderProps) {
    const router = useRouter();
    const { user, logout: authLogout, isAuthenticated, loading: authLoading } = useAuth();
    const { showInfo, showError } = useToast();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const { data: profileData } = useGetProfile();

    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const notifRef = useRef(null);

    const notifications = [
        { id: 1, text: "Jadwal konsultasi baru", time: "Baru saja", unread: true },
        { id: 2, text: "Rekam medis pasien diperbarui", time: "1 jam lalu", unread: false },
        { id: 3, text: "Pengingat: Rapat bulanan", time: "Hari ini", unread: false },
    ];

    // ✅ FIX: Wait for client-side mount to prevent hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useClickOutside(profileRef as React.RefObject<HTMLDivElement>, () => {
        if (showProfileDropdown) setShowProfileDropdown(false);
    });

    const sizeClass = sizeClasses[size];
    const variantClass = variantClasses[variant];

    const queryClient = useQueryClient();
    const { setHasToken } = useAuth();

    const handleLogout = async () => {
        if (isLoggingOut) {
            console.log("⚠️ Logout already in progress…");
            return;
        }

        console.log("🔴 === LOGOUT START ===");

        setIsLoggingOut(true);
        setShowLogoutDialog(false);

        //
        // 1) HENTIKAN semua activity React Query + auth snapshot
        //
        try {
            console.log("⛔ Stopping queries…");
            queryClient.cancelQueries();
            queryClient.removeQueries({ queryKey: ["auth.me"], exact: false });

            // cegah komponen lain dari memicu /auth/me lagi
            console.log("🔐 Disabling auth state…");
            setHasToken(false);
        } catch (e) {
            console.warn("Query cleanup warning:", e);
        }

        //
        // 2) CALL API logout TIDAK BOLEH BLOCKING
        //    → kalau timeout, tetap lanjut
        //
        const callLogoutApi = async () => {
            try {
                await Promise.race([
                    authLogout(), // dari backend
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Logout timeout")), 1500)
                    ),
                ]);
                console.log("✅ Logout API responded");
            } catch (err) {
                console.warn("⚠️ Logout API error — ignored:", err);
            }
        };

        //
        // Delay mikro supaya overlay loader muncul smooth
        //
        setTimeout(async () => {
            await callLogoutApi();

            //
            // 3) FORCE CLEANUP (HARUS jalan, apapun hasil API)
            //
            try {
                console.log("🧹 Clearing tokens & storage…");
                forceLogoutCleanup();
            } catch (cleanupErr) {
                console.error("Cleanup error:", cleanupErr);
            }

            //
            // 4) Clear React Query total
            //
            try {
                console.log("🗑️ Clearing React Query cache…");
                queryClient.clear();
            } catch { }

            //
            // 5) Notifikasi
            //
            try {
                showInfo("Logout berhasil! Sampai jumpa kembali.");
            } catch { }

            console.log("➡️ Redirecting to login…");
            console.log("🔴 === LOGOUT END ===");

            //
            // 6) Redirect pakai replace (tidak bisa back)
            //
            window.location.replace(ROUTES.LOGIN ?? "/login");
        }, 80);
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
                console.error(e);
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
                <div className="flex items-center justify-end">

                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                            className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none"
                        >
                            {/* Icon Bell */}
                            <Bell className="w-6 h-6" />
                            
                            {/* Badge Merah (Indikator ada notif) */}
                            <span className="absolute top-1 right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        </button>

                        {/* Dropdown Notifikasi */}
                        {showNotifDropdown && (
                            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-800">Notifikasi</h3>
                                    <span className="text-xs text-blue-500 cursor-pointer hover:underline">Tandai dibaca</span>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <div key={notif.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${notif.unread ? 'bg-blue-50/50' : ''}`}>
                                                <p className="text-sm text-gray-800 font-medium">{notif.text}</p>
                                                <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 text-sm">Tidak ada notifikasi</div>
                                    )}
                                </div>
                                <div className="p-2 bg-gray-50 text-center border-t border-gray-100">
                                    <button className="text-xs text-blue-600 font-medium hover:text-blue-700">Lihat Semua</button>
                                </div>
                            </div>
                        )}
                    </div>

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