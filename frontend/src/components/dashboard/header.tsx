'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout, getCurrentUser } from '@/lib/api/authService';
import { useModalStore } from '@/lib/store/modalStore';
import { useClickOutside } from '@/lib/hooks/useClickOutside';
import { useToast } from '@/lib/hooks/useToast';

export default function Header() {
    const router = useRouter();
    const showConfirm = useModalStore((state) => state.confirm);
    const isLoading = useModalStore((state) => state.isLoading);

    const currentUser = getCurrentUser();
    const { success, error } = useToast();

    // STATE ANIMASI & DROPDOWN
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [animationClass, setAnimationClass] = useState('animate-slide-down');
    const profileRef = useRef<HTMLDivElement>(null);
    const isClosingRef = useRef(false);
    const animationDuration = 300; // durasi animasi 0.3s

    // ✅ Tutup dropdown jika klik di luar area
    useClickOutside(profileRef, () => {
        if (showProfileDropdown) closeDropdown();
    });

    // ✅ Fungsi buka dropdown
    const openDropdown = () => {
        if (isClosingRef.current || isMounted) return;
        setAnimationClass('animate-slide-down');
        setIsMounted(true);
        setShowProfileDropdown(true);
    };

    // ✅ Fungsi tutup dropdown dengan animasi halus
    const closeDropdown = (exitDir: 'up' | 'down' = 'up') => {
        if (isClosingRef.current) return;
        isClosingRef.current = true;
        const exitClass = exitDir === 'down' ? 'animate-slide-down-exit' : 'animate-slide-up-exit';
        setAnimationClass(exitClass);

        setTimeout(() => {
            setIsMounted(false);
            setShowProfileDropdown(false);
            isClosingRef.current = false;
            setAnimationClass('animate-slide-down'); // reset
        }, animationDuration);
    };

    // ✅ Sinkronisasi niat buka/tutup
    useEffect(() => {
        if (showProfileDropdown) openDropdown();
        else if (isMounted) closeDropdown();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showProfileDropdown]);

    // ✅ Tombol toggle
    const onToggleButtonClick = () => {
        if (showProfileDropdown) closeDropdown();
        else openDropdown();
    };

    // ✅ Fungsi logout
    const handleLogout = async () => {
        try {
            logout();
            success('Logout berhasil! Anda telah keluar dari sistem.');
            setTimeout(() => router.push('/login'), 1500);
        } catch (err) {
            console.error('Logout error:', err);
            error('Logout gagal! Terjadi kesalahan saat logout.');
            logout();
        }
    };

    const confirmLogout = async () => {
        await showConfirm({
            title: 'Konfirmasi Logout',
            message: 'Apakah Anda yakin ingin keluar dari sistem?',
            onConfirm: handleLogout,
            type: 'danger',
            confirmText: 'Ya, Keluar'
        });
    };

    // ✅ Menu dropdown
    const handleMenuSelect = (value: string) => {
        closeDropdown();
        switch (value) {
            case 'profile':
                router.push('/dashboard/profile');
                break;
            case 'settings':
                router.push('/dashboard/settings');
                break;
            case 'logout':
                confirmLogout();
                break;
        }
    };

    // ✅ Utility user
    const getUserInitials = () => {
        if (!currentUser?.nama_lengkap) return '?';
        const names = currentUser.nama_lengkap.split(' ').filter(Boolean);
        return names.length >= 2
            ? `${names[0][0]}${names[1][0]}`.toUpperCase()
            : currentUser.nama_lengkap.substring(0, 2).toUpperCase();
    };

    const getUserRole = () => {
        if (!currentUser?.roles || currentUser.roles.length === 0) return 'User';
        const role = currentUser.roles[0];
        const roleMap: Record<string, string> = {
            kepala_klinik: 'Kepala Klinik',
            dokter: 'Dokter',
            staf: 'Staf',
        };
        return roleMap[role] || role;
    };

    const menuOptions = [
        { value: 'profile', label: 'Profil Saya' },
        { value: 'settings', label: 'Pengaturan' },
        { value: 'logout', label: 'Keluar' },
    ];

    // ✅ RENDER UTAMA
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 p-6 relative">
            <div className="flex items-center justify-between">
                {/* Salam & Judul */}
                <div className="min-w-0 flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Halo, {currentUser?.nama_lengkap || 'User'}!
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Selamat datang kembali di dashboard Dentizy
                    </p>
                </div>

                {/* Dropdown Profil */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={onToggleButtonClick}
                        className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Menu profil"
                        aria-expanded={showProfileDropdown}
                        disabled={isLoading}
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-sm font-medium text-white">
                                {getUserInitials()}
                            </span>
                        </div>
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>

                    {/* Render Dropdown dgn animasi */}
                    {isMounted && (
                        <div
                            className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 ${animationClass}`}
                        >
                            <div className="p-4 border-b border-gray-200">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {currentUser?.nama_lengkap || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {currentUser?.username || '-'}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    {getUserRole()}
                                </p>
                            </div>
                            <div className="py-2">
                                {menuOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleMenuSelect(option.value)}
                                        disabled={option.value === 'logout' && isLoading}
                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors
                                            ${option.value === 'logout'
                                                ? 'text-red-600 hover:bg-red-50'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }
                                            ${option.value === 'logout' && isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {option.value === 'logout' && isLoading ? 'Keluar...' : option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
