'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider'; // Pastikan path import benar
import { ROUTES } from '@/core/constants/routes.constants';

// Daftar rute yang boleh diakses tanpa login
const PUBLIC_ROUTES = [ROUTES.LOGIN, '/forgot-password', '/register'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Jika masih loading state auth awal, tunggu
        if (loading) return;

        const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

        if (!isAuthenticated && !isPublicRoute) {
            // Jika tidak login dan akses halaman private -> lempar ke login
            router.replace(ROUTES.LOGIN);
        } else if (isAuthenticated && isPublicRoute) {
            // Jika sudah login tapi akses halaman login -> lempar ke dashboard
            router.replace(ROUTES.DASHBOARD);
        } else {
            // Selesai pengecekan
            setIsChecking(false);
        }
    }, [isAuthenticated, loading, pathname, router]);

    return <>{children}</>;
}