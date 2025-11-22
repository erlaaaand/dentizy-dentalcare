'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn, useAuth, useConfirm, useToast, useClickOutside, getInitials, ROUTES, ROLE_LABELS } from '@/core';
import { useGetProfile } from '@/core/services/api/auth.api';
import { HeaderProps } from './header.types';
import { sizeClasses, variantClasses } from './header.styles';
import { ChevronIcon } from './header.icon';
import { ProfileDropdown } from './ProfileDropdown';
import { MinimalHeader } from './MinimalHeader';
import { DashboardHeader } from './DashboardHeader';
import { SimpleHeader } from './SimpleHeader';
import { HeaderSection } from './HeaderSection';
import { HeaderTitle } from './HeaderTitle';
import { HeaderSubtitle } from './HeaderSubtitle';

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
    const { data: profileData } = useGetProfile();

    useClickOutside(profileRef, () => showProfileDropdown && setShowProfileDropdown(false));

    const sizeClass = sizeClasses[size];
    const variantClass = variantClasses[variant];

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
                onLogoutClick ? onLogoutClick() : await handleLogout();
                break;
        }
    };

    const handleLogout = async () => {
        const isConfirmed = await confirm({
            title: 'Konfirmasi Logout',
            message: 'Apakah Anda yakin ingin keluar dari sistem?',
            type: 'danger',
            confirmText: 'Ya, Keluar',
        });
        if (isConfirmed) {
            try {
                await authLogout();
                showSuccess('Logout berhasil! Sampai jumpa kembali.');
                router.push(ROUTES.LOGIN);
            } catch {
                showError('Gagal logout! Silakan coba lagi.');
            }
        }
    };

    const getUserRoleLabel = () => (user?.role ? ROLE_LABELS[user.role] || user.role : 'User');
    const getUserName = () => userName || profileData?.nama_lengkap || user?.nama_lengkap || 'User';
    const getUserRole = () => userRole || getUserRoleLabel();
    const getWelcomeText = () => welcomeText || 'Selamat datang kembali di dashboard Dentizy';

    if (children) {
        return <header id="app-header" className={cn(variantClass, sizeClass.container, className)}>{children}</header>;
    }

    if (!isAuthenticated) return null;

    return (
        <header id="app-header" className={cn(variantClass, sizeClass.container, className)}>
            <div className="flex items-center justify-between">
                {showWelcome && (
                    <div className="min-w-0 flex-1">
                        <h1 className={cn('font-bold text-gray-900', sizeClass.title)}>Halo, {getUserName()}!</h1>
                        <p className={cn('text-gray-600 mt-1', sizeClass.subtitle)}>{getWelcomeText()}</p>
                    </div>
                )}
                {showProfile && (
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Menu profil"
                            aria-expanded={showProfileDropdown}
                        >
                            <div className={cn('bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm text-white font-medium', sizeClass.avatar)}>
                                {userAvatar ? <img src={userAvatar} alt={getUserName()} className="rounded-full" /> : <span>{getInitials(getUserName())}</span>}
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

const HeaderComponent = Object.assign(Header, {
    Minimal: MinimalHeader,
    Dashboard: DashboardHeader,
    Simple: SimpleHeader,
    Section: HeaderSection,
    Title: HeaderTitle,
    Subtitle: HeaderSubtitle,
});

export default HeaderComponent;